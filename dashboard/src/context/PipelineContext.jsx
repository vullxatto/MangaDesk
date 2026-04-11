/* eslint-disable react-refresh/only-export-components -- провайдер и хук экспортируются вместе */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  CURRENT_USER,
  getNextFreeChapterNumberForProject,
  INITIAL_CHAPTERS,
  isDuplicateChapterNumber,
  MANGA_PROJECTS,
  SOLO_KEY,
  TEAM_MEMBERS,
} from './pipelineConstants'

function formatNowRu() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatStartedAt(ts) {
  return new Date(ts).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function migrateWaitingToSolo(prev) {
  const now = formatNowRu()
  return prev.map((c) =>
    c.statusCode === 'waiting_editor'
      ? {
          ...c,
          statusCode: 'edit',
          editorId: CURRENT_USER.id,
          editorName: CURRENT_USER.name,
          assignedAt: now,
          date: now,
        }
      : c,
  )
}

function getInitialChapters() {
  const rows = INITIAL_CHAPTERS.map((c) => ({ ...c }))
  if (typeof window !== 'undefined' && window.localStorage.getItem(SOLO_KEY) === '1') {
    return migrateWaitingToSolo(rows)
  }
  return rows
}

function makeQueueItemId() {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const PipelineContext = createContext(null)

export function PipelineProvider({ children }) {
  const [soloMode, setSoloModeState] = useState(
    () => typeof window !== 'undefined' && window.localStorage.getItem(SOLO_KEY) === '1',
  )
  const [chapters, setChapters] = useState(getInitialChapters)
  const [uploadQueue, setUploadQueue] = useState([])
  const [processingJobs, setProcessingJobs] = useState([])
  const [selectedWaitingIds, setSelectedWaitingIds] = useState(() => new Set())
  const chapterIdRef = useRef(
    Math.max(0, ...INITIAL_CHAPTERS.map((c) => c.id)),
  )
  const jobIdRef = useRef(0)
  const finishedJobsRef = useRef(new Set())
  const pendingJobRef = useRef(null)

  const setSoloMode = useCallback((value) => {
    const on = !!value
    setSoloModeState(on)
    if (on) {
      setChapters((prev) => migrateWaitingToSolo(prev))
      setSelectedWaitingIds(new Set())
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(SOLO_KEY, soloMode ? '1' : '0')
  }, [soloMode])

  const finishArchive = useCallback((job) => {
    const now = formatNowRu()
    setChapters((prev) => {
      const id = chapterIdRef.current + 1
      chapterIdRef.current = id
      const title = job.projectTitle
      const number = job.chapterNumber
      const solo = job.solo === true
      const preEditor = job.preEditorId
        ? TEAM_MEMBERS.find((m) => m.id === job.preEditorId)
        : null

      let row
      if (solo) {
        row = {
          id,
          title,
          number,
          statusCode: 'edit',
          date: now,
          editorId: CURRENT_USER.id,
          editorName: CURRENT_USER.name,
          assignedAt: now,
        }
      } else if (preEditor) {
        row = {
          id,
          title,
          number,
          statusCode: 'edit',
          date: now,
          editorId: preEditor.id,
          editorName: preEditor.name,
          assignedAt: now,
        }
      } else {
        row = {
          id,
          title,
          number,
          statusCode: 'waiting_editor',
          date: now,
          editorId: null,
          editorName: null,
          assignedAt: null,
        }
      }
      return [...prev, row]
    })
  }, [])

  const addZipToUploadQueue = useCallback((fileList) => {
    const files = Array.from(fileList)
    if (files.length === 0) return
    setUploadQueue((prev) => {
      const seen = new Set(prev.map((q) => `${q.file.name}-${q.file.size}`))
      const next = [...prev]
      for (const file of files) {
        const key = `${file.name}-${file.size}`
        if (seen.has(key)) continue
        seen.add(key)
        next.push({
          id: makeQueueItemId(),
          file,
          projectId: '',
          chapterNumber: '',
          editorId: '',
        })
      }
      return next
    })
  }, [])

  const updateUploadQueueItem = useCallback(
    (id, partial) => {
      setUploadQueue((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item
          const merged = { ...item, ...partial }
          if (partial.projectId !== undefined && partial.projectId !== item.projectId) {
            const p = MANGA_PROJECTS.find((x) => x.id === partial.projectId)
            if (p) {
              merged.chapterNumber = String(
                getNextFreeChapterNumberForProject(
                  chapters,
                  prev,
                  processingJobs,
                  p.title,
                  id,
                ),
              )
            } else {
              merged.chapterNumber = ''
            }
          }
          return merged
        }),
      )
    },
    [chapters, processingJobs],
  )

  const removeUploadQueueItem = useCallback((id) => {
    setUploadQueue((prev) => prev.filter((q) => q.id !== id))
  }, [])

  const clearUploadQueue = useCallback(() => {
    setUploadQueue([])
  }, [])

  const submitUploadQueueItem = useCallback(
    (id) => {
      pendingJobRef.current = null
      setUploadQueue((prev) => {
        const item = prev.find((q) => q.id === id)
        if (!item) return prev
        const project = MANGA_PROJECTS.find((p) => p.id === item.projectId)
        const num = parseInt(String(item.chapterNumber).trim(), 10)
        if (!project || !Number.isFinite(num) || num < 1) return prev
        if (
          isDuplicateChapterNumber(
            project.title,
            num,
            chapters,
            prev,
            processingJobs,
            id,
          )
        ) {
          return prev
        }
        pendingJobRef.current = { item, project, num, solo: soloMode }
        return prev.filter((q) => q.id !== id)
      })
      const pending = pendingJobRef.current
      pendingJobRef.current = null
      if (!pending) return
      const { item, project, num, solo } = pending
      const jid = jobIdRef.current + 1
      jobIdRef.current = jid
      const totalChapters = 4 + Math.floor(Math.random() * 4)
      const preEditorId = solo || !item.editorId ? null : item.editorId
      setProcessingJobs((jobs) => [
        ...jobs,
        {
          id: `job-${jid}`,
          fileName: item.file.name,
          current: 0,
          totalChapters,
          startedAt: Date.now(),
          projectTitle: project.title,
          chapterNumber: num,
          preEditorId,
          solo,
        },
      ])
    },
    [soloMode, chapters, processingJobs],
  )

  useEffect(() => {
    const tick = window.setInterval(() => {
      setProcessingJobs((jobs) => {
        if (jobs.length === 0) return jobs
        const done = []
        const next = []
        for (const j of jobs) {
          if (j.current >= j.totalChapters) continue
          const nc = j.current + 1
          if (nc >= j.totalChapters) {
            done.push({ ...j, current: nc })
          } else {
            next.push({ ...j, current: nc })
          }
        }
        if (done.length) {
          window.queueMicrotask(() => {
            for (const job of done) {
              if (finishedJobsRef.current.has(job.id)) continue
              finishedJobsRef.current.add(job.id)
              finishArchive(job)
            }
          })
        }
        return next
      })
    }, 700)
    return () => window.clearInterval(tick)
  }, [finishArchive])

  const stats = useMemo(() => {
    const inEdit = chapters.filter((c) => c.statusCode === 'edit').length
    const ready = chapters.filter((c) => c.statusCode === 'ready').length
    return { queue: uploadQueue.length, inEdit, ready }
  }, [chapters, uploadQueue.length])

  const assignEditor = useCallback((chapterIds, editorId) => {
    const member = TEAM_MEMBERS.find((m) => m.id === editorId)
    if (!member) return
    const now = formatNowRu()
    setChapters((prev) =>
      prev.map((c) =>
        chapterIds.includes(c.id) && c.statusCode === 'waiting_editor'
          ? {
              ...c,
              statusCode: 'edit',
              editorId: member.id,
              editorName: member.name,
              assignedAt: now,
              date: now,
            }
          : c,
      ),
    )
    setSelectedWaitingIds(new Set())
  }, [])

  const completeEditorTask = useCallback((chapterId) => {
    const now = formatNowRu()
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId && c.statusCode === 'edit' && c.editorId === CURRENT_USER.id
          ? { ...c, statusCode: 'ready', date: now }
          : c,
      ),
    )
  }, [])

  const toggleWaitingSelected = useCallback((chapterId) => {
    setSelectedWaitingIds((prev) => {
      const next = new Set(prev)
      if (next.has(chapterId)) next.delete(chapterId)
      else next.add(chapterId)
      return next
    })
  }, [])

  const editorTasks = useMemo(
    () =>
      chapters.filter(
        (c) => c.editorId === CURRENT_USER.id && c.statusCode === 'edit',
      ),
    [chapters],
  )

  const value = useMemo(
    () => ({
      soloMode,
      setSoloMode,
      chapters,
      uploadQueue,
      addZipToUploadQueue,
      updateUploadQueueItem,
      removeUploadQueueItem,
      clearUploadQueue,
      submitUploadQueueItem,
      processingJobs,
      stats,
      assignEditor,
      completeEditorTask,
      editorTasks,
      selectedWaitingIds,
      toggleWaitingSelected,
      formatStartedAt,
    }),
    [
      soloMode,
      setSoloMode,
      chapters,
      uploadQueue,
      addZipToUploadQueue,
      updateUploadQueueItem,
      removeUploadQueueItem,
      clearUploadQueue,
      submitUploadQueueItem,
      processingJobs,
      stats,
      assignEditor,
      completeEditorTask,
      editorTasks,
      selectedWaitingIds,
      toggleWaitingSelected,
    ],
  )

  return <PipelineContext.Provider value={value}>{children}</PipelineContext.Provider>
}

export function usePipeline() {
  const ctx = useContext(PipelineContext)
  if (!ctx) {
    throw new Error('usePipeline must be used within PipelineProvider')
  }
  return ctx
}
