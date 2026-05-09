import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  ChapterRow,
  DashboardProject,
  PipelineContextValue,
  PipelineProviderProps,
  TeamMember,
  UploadQueueItem,
} from '../pipelineTypes'
import type { GlossaryEntry } from '../glossary/glossaryTypes'
import { CURRENT_USER, getNextFreeChapterNumberForProject, isDuplicateChapterNumber, SOLO_KEY } from './pipelineConstants'
import { useAuth } from '../../context/AuthContext'
import { PipelineReactContext } from './pipelineReactContext'
import {
  apiDelete,
  apiGet,
  apiPatchJson,
  apiPostJson,
  apiPostMultipart,
} from '../../lib/api'

type ChapterApi = {
  id: string
  project_id: string
  project_title: string
  chapter_number: number
  chapter_title: string | null
  status_code: string
  editor_id: string | null
  editor_name: string | null
  updated_at: string
  restored_from_trash?: boolean
}

type ProjectApi = {
  id: string
  team_id: string
  slug: string
  title: string
  description: string | null
  source_language: string | null
  target_language: string | null
  cover_storage_key: string | null
}

type TeamMemberApi = {
  id: string
  username: string
  email: string | null
  role: string
}

type GlossaryApi = {
  id: number
  project_id: string
  term_source: string
  term_target: string
  notes: string | null
}

function formatNowRuFromIso(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function mapChapter(c: ChapterApi): ChapterRow {
  const st = c.status_code as ChapterRow['statusCode']
  return {
    id: c.id,
    projectId: c.project_id,
    title: c.project_title,
    number: c.chapter_number,
    statusCode: st,
    date: formatNowRuFromIso(c.updated_at),
    editorId: c.editor_id,
    editorName: c.editor_name,
    assignedAt: c.editor_id ? formatNowRuFromIso(c.updated_at) : null,
    restoredFromTrash: !!c.restored_from_trash,
  }
}

function makeQueueItemId() {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function PipelineProvider({ children }: PipelineProviderProps) {
  const { ready: authReady, currentTeamId } = useAuth()
  const [soloMode, setSoloModeState] = useState(
    () => typeof window !== 'undefined' && window.localStorage.getItem(SOLO_KEY) === '1',
  )
  const [projects, setProjects] = useState<DashboardProject[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [chapters, setChapters] = useState<ChapterRow[]>([])
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([])
  const [selectedWaitingIds, setSelectedWaitingIds] = useState<Set<string>>(() => new Set())
  const [glossaryByProjectId, setGlossaryByProjectId] = useState<Record<string, GlossaryEntry[]>>(
    () => ({}),
  )
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState<string | null>(null)

  const refreshDashboard = useCallback(async () => {
    setDashboardError(null)
    setDashboardLoading(true)
    try {
      const [pj, tm, ch] = await Promise.all([
        apiGet<ProjectApi[]>('/projects'),
        apiGet<TeamMemberApi[]>('/team/members'),
        apiGet<ChapterApi[]>('/chapters'),
      ])
      setProjects(pj.map((p) => ({ id: p.id, title: p.title, slug: p.slug })))
      setTeamMembers(tm.map((m) => ({ id: m.id, name: m.username, role: m.role })))
      setChapters(ch.map(mapChapter))
    } catch (e) {
      setDashboardError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setDashboardLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authReady) return
    void refreshDashboard()
  }, [authReady, currentTeamId, refreshDashboard])

  const setSoloMode = useCallback(
    (value: boolean) => {
      const on = !!value
      setSoloModeState(on)
      if (on) {
        void (async () => {
          try {
            const waiting = chapters.filter((c) => c.statusCode === 'waiting_editor')
            for (const c of waiting) {
              await apiPatchJson(`/chapters/${c.id}`, {
                assigned_editor_id: CURRENT_USER.id,
                status_code: 'edit',
              })
            }
            await refreshDashboard()
            setSelectedWaitingIds(new Set())
          } catch (e) {
            console.error(e)
            setDashboardError(e instanceof Error ? e.message : 'Ошибка solo-режима')
          }
        })()
      }
    },
    [chapters, refreshDashboard],
  )

  useEffect(() => {
    window.localStorage.setItem(SOLO_KEY, soloMode ? '1' : '0')
  }, [soloMode])

  const createProject = useCallback(
    async (payload: {
      title: string
      description?: string | null
      source_language?: string | null
      target_language?: string | null
    }) => {
      await apiPostJson<ProjectApi>('/projects', {
        title: payload.title,
        description: payload.description ?? null,
        source_language: payload.source_language ?? null,
        target_language: payload.target_language ?? null,
      })
      await refreshDashboard()
    },
    [refreshDashboard],
  )

  const updateProject = useCallback(
    async (
      projectId: string,
      payload: {
        title?: string
        description?: string | null
        source_language?: string | null
        target_language?: string | null
      },
    ) => {
      await apiPatchJson<ProjectApi>(`/projects/${projectId}`, payload)
      await refreshDashboard()
    },
    [refreshDashboard],
  )

  const removeProject = useCallback(
    async (projectId: string) => {
      await apiDelete(`/projects/${projectId}`)
      await refreshDashboard()
    },
    [refreshDashboard],
  )

  const addFilesToUploadQueue = useCallback((fileList: FileList | File[]) => {
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
            merged.chapterNumber = String(
              getNextFreeChapterNumberForProject(
                chapters,
                prev,
                projects,
                partial.projectId,
                id,
              ),
            )
          }
          return merged
        }),
      )
    },
    [chapters, projects],
  )

  const removeUploadQueueItem = useCallback((id: string) => {
    setUploadQueue((prev) => prev.filter((q) => q.id !== id))
  }, [])

  const clearUploadQueue = useCallback(() => {
    setUploadQueue([])
  }, [])

  const submitUploadQueueItem = useCallback(
    async (id: string) => {
      const item = uploadQueue.find((q) => q.id === id)
      if (!item) return
      const project = projects.find((p) => p.id === item.projectId)
      const num = parseInt(String(item.chapterNumber).trim(), 10)
      if (!project || !Number.isFinite(num) || num < 1) return
      if (
        isDuplicateChapterNumber(item.projectId, num, chapters, uploadQueue, id, undefined)
      ) {
        return
      }
      setDashboardError(null)
      try {
        const created = await apiPostJson<ChapterApi>('/chapters', {
          project_id: item.projectId,
          chapter_number: num,
          chapter_title: null,
        })
        const chapterId = created.id
        const lower = item.file.name.toLowerCase()
        if (lower.endsWith('.zip') || lower.endsWith('.rar')) {
          const fd = new FormData()
          fd.append('file', item.file)
          await apiPostMultipart(`/chapters/${chapterId}/archive`, fd)
        } else {
          const fd = new FormData()
          fd.append('files', item.file)
          await apiPostMultipart(`/chapters/${chapterId}/upload`, fd)
        }
        if (soloMode) {
          await apiPatchJson(`/chapters/${chapterId}`, {
            assigned_editor_id: CURRENT_USER.id,
            status_code: 'edit',
          })
        } else if (item.editorId) {
          await apiPatchJson(`/chapters/${chapterId}`, {
            assigned_editor_id: item.editorId,
            status_code: 'edit',
          })
        }
        await refreshDashboard()
        setUploadQueue((prev) => prev.filter((q) => q.id !== id))
      } catch (e) {
        console.error(e)
        setDashboardError(e instanceof Error ? e.message : 'Ошибка загрузки')
      }
    },
    [uploadQueue, projects, chapters, soloMode, refreshDashboard],
  )

  const stats = useMemo(() => {
    const inEdit = chapters.filter((c) => c.statusCode === 'edit').length
    const ready = chapters.filter((c) => c.statusCode === 'ready').length
    return { queue: uploadQueue.length, inEdit, ready }
  }, [chapters, uploadQueue.length])

  const updateChapterMetadata = useCallback(
    async (chapterId: string, projectId: string, chapterNumber: number, chapterTitle?: string | null) => {
      if (!Number.isFinite(chapterNumber) || chapterNumber < 1) return
      try {
        await apiPatchJson(`/chapters/${chapterId}`, {
          project_id: projectId,
          chapter_number: chapterNumber,
          chapter_title: chapterTitle ?? null,
        })
        await refreshDashboard()
      } catch (e) {
        console.error(e)
        setDashboardError(e instanceof Error ? e.message : 'Ошибка сохранения')
      }
    },
    [refreshDashboard],
  )

  const removeChapter = useCallback(
    async (chapterId: string) => {
      await apiDelete(`/chapters/${chapterId}`)
      await refreshDashboard()
      setSelectedWaitingIds((prev) => {
        if (!prev.has(chapterId)) return prev
        const next = new Set(prev)
        next.delete(chapterId)
        return next
      })
    },
    [refreshDashboard],
  )

  const assignEditor = useCallback(
    async (chapterIds: string[], editorId: string) => {
      const member = teamMembers.find((m) => m.id === editorId)
      if (!member) return
      try {
        for (const cid of chapterIds) {
          await apiPatchJson(`/chapters/${cid}`, {
            assigned_editor_id: editorId,
            status_code: 'edit',
          })
        }
        await refreshDashboard()
        setSelectedWaitingIds(new Set())
      } catch (e) {
        console.error(e)
        setDashboardError(e instanceof Error ? e.message : 'Ошибка назначения')
      }
    },
    [teamMembers, refreshDashboard],
  )

  const completeEditorTask = useCallback(
    async (chapterId: string) => {
      try {
        await apiPatchJson(`/chapters/${chapterId}`, { status_code: 'ready' })
        await refreshDashboard()
      } catch (e) {
        console.error(e)
        setDashboardError(e instanceof Error ? e.message : 'Ошибка')
      }
    },
    [refreshDashboard],
  )

  const toggleWaitingSelected = useCallback((chapterId: string) => {
    setSelectedWaitingIds((prev) => {
      const next = new Set(prev)
      if (next.has(chapterId)) next.delete(chapterId)
      else next.add(chapterId)
      return next
    })
  }, [])

  const loadGlossaryForProject = useCallback(async (projectId: string) => {
    const rows = await apiGet<GlossaryApi[]>(`/glossary/${projectId}`)
    const mapped: GlossaryEntry[] = rows.map((r) => ({
      id: String(r.id),
      source: r.term_source,
      target: r.term_target,
    }))
    setGlossaryByProjectId((prev) => ({ ...prev, [projectId]: mapped }))
  }, [])

  const addGlossaryEntry = useCallback(
    async (projectId: string, entry: Omit<GlossaryEntry, 'id'>) => {
      const source = entry.source.trim()
      const target = entry.target.trim()
      if (!source || !target) return
      await apiPostJson(`/glossary/${projectId}`, {
        term_source: source,
        term_target: target,
        notes: null,
      })
      await loadGlossaryForProject(projectId)
    },
    [loadGlossaryForProject],
  )

  const updateGlossaryEntry = useCallback(
    async (projectId: string, entryId: string, next: Omit<GlossaryEntry, 'id'>) => {
      const source = next.source.trim()
      const target = next.target.trim()
      if (!source || !target) return
      await apiPatchJson(`/glossary/${projectId}/entries/${entryId}`, {
        term_source: source,
        term_target: target,
        notes: null,
      })
      await loadGlossaryForProject(projectId)
    },
    [loadGlossaryForProject],
  )

  const removeGlossaryEntry = useCallback(
    async (projectId: string, entryId: string) => {
      await apiDelete(`/glossary/${projectId}/entries/${entryId}`)
      await loadGlossaryForProject(projectId)
    },
    [loadGlossaryForProject],
  )

  const editorTasks = useMemo(
    () =>
      chapters.filter(
        (c) => c.editorId === CURRENT_USER.id && c.statusCode === 'edit',
      ),
    [chapters],
  )

  const formatStartedAt = useCallback((ts: number) => {
    return new Date(ts).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [])

  const value = useMemo<PipelineContextValue>(
    () => ({
      soloMode,
      setSoloMode,
      projects,
      teamMembers,
      dashboardLoading,
      dashboardError,
      refreshDashboard,
      createProject,
      updateProject,
      removeProject,
      chapters,
      uploadQueue,
      addFilesToUploadQueue,
      updateUploadQueueItem,
      removeUploadQueueItem,
      clearUploadQueue,
      submitUploadQueueItem,
      stats,
      assignEditor,
      updateChapterMetadata,
      removeChapter,
      completeEditorTask,
      editorTasks,
      selectedWaitingIds,
      toggleWaitingSelected,
      formatStartedAt,
      glossaryByProjectId,
      loadGlossaryForProject,
      addGlossaryEntry,
      updateGlossaryEntry,
      removeGlossaryEntry,
    }),
    [
      soloMode,
      setSoloMode,
      projects,
      teamMembers,
      dashboardLoading,
      dashboardError,
      refreshDashboard,
      createProject,
      updateProject,
      removeProject,
      chapters,
      uploadQueue,
      addFilesToUploadQueue,
      updateUploadQueueItem,
      removeUploadQueueItem,
      clearUploadQueue,
      submitUploadQueueItem,
      stats,
      assignEditor,
      updateChapterMetadata,
      removeChapter,
      completeEditorTask,
      editorTasks,
      selectedWaitingIds,
      toggleWaitingSelected,
      formatStartedAt,
      glossaryByProjectId,
      loadGlossaryForProject,
      addGlossaryEntry,
      updateGlossaryEntry,
      removeGlossaryEntry,
    ],
  )

  return <PipelineReactContext.Provider value={value}>{children}</PipelineReactContext.Provider>
}
