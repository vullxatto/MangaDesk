import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  ChapterRow,
  PipelineContextValue,
  PipelineProviderProps,
  ProcessingJob,
  UploadQueueItem,
} from '../pipelineTypes'
import {
  CURRENT_USER,
  getNextFreeChapterNumberForProject,
  INITIAL_CHAPTERS,
  isDuplicateChapterNumber,
  MANGA_PROJECTS,
  SOLO_KEY,
  TEAM_MEMBERS,
} from './pipelineConstants'
import { PipelineReactContext } from './pipelineReactContext'

function formatNowRu() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatStartedAt(ts: number) {
  return new Date(ts).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function migrateWaitingToSolo(prev: ChapterRow[]): ChapterRow[] {
  const now = formatNowRu()
  return prev.map((c) =>
    c.statusCode === 'waiting_editor'
      ? ({
          ...c,
          statusCode: 'edit',
          editorId: CURRENT_USER.id,
          editorName: CURRENT_USER.name,
          assignedAt: now,
          date: now,
        } satisfies ChapterRow)
      : c,
  )
}

function getInitialChapters(): ChapterRow[] {
  const rows = INITIAL_CHAPTERS.map((c) => ({ ...c }))
  if (typeof window !== 'undefined' && window.localStorage.getItem(SOLO_KEY) === '1') {
    return migrateWaitingToSolo(rows)
  }
  return rows
}

function makeQueueItemId() {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function PipelineProvider({ children }: PipelineProviderProps) {
  const [soloMode, setSoloModeState] = useState(
    () => typeof window !== 'undefined' && window.localStorage.getItem(SOLO_KEY) === '1',
  )
  const [chapters, setChapters] = useState<ChapterRow[]>(getInitialChapters)
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([])
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([])
  const [selectedWaitingIds, setSelectedWaitingIds] = useState<Set<number>>(() => new Set())
  const chapterIdRef = useRef(Math.max(0, ...INITIAL_CHAPTERS.map((c) => c.id)))
  const jobIdRef = useRef(0)
  const finishedJobsRef = useRef<Set<string>>(new Set())

  const setSoloMode = useCallback((value: boolean) => {
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

  const finishArchive = useCallback((job: ProcessingJob) => {
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

      let row: ChapterRow
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

  const addZipToUploadQueue = useCallback((fileList: FileList | File[]) => {
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
    (id: string, partial: Partial<UploadQueueItem>) => {
      setUploadQueue((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item
          const merged: UploadQueueItem = { ...item, ...partial }
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

  const removeUploadQueueItem = useCallback((id: string) => {
    setUploadQueue((prev) => prev.filter((q) => q.id !== id))
  }, [])

  const clearUploadQueue = useCallback(() => {
    setUploadQueue([])
  }, [])

  const submitUploadQueueItem = useCallback(
    (id: string) => {
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
            undefined,
          )
        ) {
          return prev
        }
        setProcessingJobs((jobs) => {
          if (jobs.some((j) => j.queueItemId === id)) {
            return jobs
          }
          jobIdRef.current += 1
          const jid = jobIdRef.current
          const totalChapters = 4 + Math.floor(Math.random() * 4)
          const solo = soloMode
          const preEditorId = solo || !item.editorId ? null : item.editorId
          const job: ProcessingJob = {
            id: `job-${jid}`,
            queueItemId: id,
            fileName: item.file.name,
            current: 0,
            totalChapters,
            startedAt: Date.now(),
            projectTitle: project.title,
            chapterNumber: num,
            preEditorId,
            solo,
          }
          return [...jobs, job]
        })
        return prev.filter((q) => q.id !== id)
      })
    },
    [soloMode, chapters, processingJobs],
  )

  useEffect(() => {
    const tick = window.setInterval(() => {
      setProcessingJobs((jobs) => {
        if (jobs.length === 0) return jobs
        const done: ProcessingJob[] = []
        const next: ProcessingJob[] = []
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

  const updateChapterMetadata = useCallback(
    (chapterId: number, nextTitle: string, nextNumber: number) => {
      const trimmed = nextTitle.trim()
      if (!trimmed || !Number.isFinite(nextNumber) || nextNumber < 1) return
      const now = formatNowRu()
      setChapters((prev) => {
        if (
          isDuplicateChapterNumber(
            trimmed,
            nextNumber,
            prev,
            uploadQueue,
            processingJobs,
            '',
            chapterId,
          )
        ) {
          return prev
        }
        return prev.map((c) =>
          c.id === chapterId ? { ...c, title: trimmed, number: nextNumber, date: now } : c,
        )
      })
    },
    [uploadQueue, processingJobs],
  )

  const assignEditor = useCallback((chapterIds: number[], editorId: string) => {
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

  const completeEditorTask = useCallback((chapterId: number) => {
    const now = formatNowRu()
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId && c.statusCode === 'edit' && c.editorId === CURRENT_USER.id
          ? { ...c, statusCode: 'ready', date: now }
          : c,
      ),
    )
  }, [])

  const toggleWaitingSelected = useCallback((chapterId: number) => {
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

  const value = useMemo<PipelineContextValue>(
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
      updateChapterMetadata,
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
      updateChapterMetadata,
      completeEditorTask,
      editorTasks,
      selectedWaitingIds,
      toggleWaitingSelected,
    ],
  )

  return <PipelineReactContext.Provider value={value}>{children}</PipelineReactContext.Provider>
}
