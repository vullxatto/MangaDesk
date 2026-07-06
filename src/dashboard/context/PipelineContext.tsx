import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  ChapterRow,
  DashboardProject,
  OverviewPipelineJob,
  PipelineContextValue,
  PipelineProviderProps,
  TeamMember,
  UploadQueueItem,
} from '../pipelineTypes'
import { resolveItemCreatedAt, resolveItemUpdatedAt, resolveProjectDates } from '../projectDates'
import type { GlossaryEntry } from '../glossary/glossaryTypes'
import { getProjectGlossary, pruneProjectGlossaryStorage, setProjectGlossary } from '../projectGlossary'
import { pruneProjectLinksStorage } from '../projectLinks'
import { CURRENT_USER, getNextFreeChapterNumberForProject, isDuplicateChapterNumber, SOLO_KEY } from './pipelineConstants'
import { useAuth } from '../../context/AuthContext'
import { PipelineReactContext } from './pipelineReactContext'
import {
  apiDelete,
  apiDownloadChapterArchive,
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
  created_at: string
  updated_at: string
  restored_from_trash?: boolean
  review_feedback?: string | null
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
  created_at: string
  updated_at: string
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
  chapter_id: string | null
  chapter_number: number | null
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
  const createdAt = resolveItemCreatedAt(c.id, c.created_at)
  const updatedAt = resolveItemUpdatedAt(c.id, c.updated_at, c.created_at)
  return {
    id: c.id,
    projectId: c.project_id,
    title: c.project_title,
    number: c.chapter_number,
    statusCode: st,
    date: formatNowRuFromIso(updatedAt),
    createdAt,
    updatedAt,
    editorId: c.editor_id,
    editorName: c.editor_name,
    assignedAt: c.editor_id ? formatNowRuFromIso(updatedAt) : null,
    restoredFromTrash: !!c.restored_from_trash,
    reviewFeedback: c.review_feedback ?? null,
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
  const [glossaryByProjectId, setGlossaryByProjectId] = useState<Record<string, GlossaryEntry[]>>(
    () => ({}),
  )
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState<string | null>(null)

  const [overviewJobs, setOverviewJobs] = useState<OverviewPipelineJob[]>([])
  const overviewJobsRef = useRef(overviewJobs)
  overviewJobsRef.current = overviewJobs

  const dismissOverviewJob = useCallback((chapterId: string) => {
    setOverviewJobs((prev) => prev.filter((j) => j.chapterId !== chapterId))
  }, [])

  const clearOverviewJobs = useCallback(() => {
    setOverviewJobs([])
  }, [])

  const activeOverviewJobCount = useMemo(
    () => overviewJobs.filter((j) => j.state !== 'completed' && j.state !== 'failed').length,
    [overviewJobs],
  )

  const refreshDashboard = useCallback(async () => {
    setDashboardError(null)
    setDashboardLoading(true)
    try {
      const [pj, tm, ch] = await Promise.all([
        apiGet<ProjectApi[]>('/projects'),
        apiGet<TeamMemberApi[]>('/team/members'),
        apiGet<ChapterApi[]>('/chapters'),
      ])
      setProjects(
        pj.map((p) => {
          const dates = resolveProjectDates(p.id, p.created_at, p.updated_at)
          return {
            id: p.id,
            title: p.title,
            slug: p.slug,
            createdAt: dates.createdAt,
            updatedAt: dates.updatedAt,
          }
        }),
      )
      const projectIds = pj.map((p) => p.id)
      pruneProjectLinksStorage(projectIds)
      pruneProjectGlossaryStorage(projectIds)
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

  type OverviewStatusApi = {
    state: string
    total: number
    done: number
    phase: string
    error: string | null
  }

  useEffect(() => {
    if (activeOverviewJobCount === 0) return
    let cancelled = false

    const pollOne = async (cid: string) => {
      try {
        const s = await apiGet<OverviewStatusApi>(`/chapters/${cid}/overview-pipeline/status`)
        if (cancelled) return
        setOverviewJobs((prev) =>
          prev.map((job) =>
            job.chapterId === cid
              ? {
                  ...job,
                  state: s.state,
                  total: s.total,
                  done: s.done,
                  phase: s.phase,
                  error: s.error ?? null,
                }
              : job,
          ),
        )
        if (s.state === 'completed') {
          await refreshDashboard()
          if (!cancelled) {
            setTimeout(() => {
              if (!cancelled) {
                setOverviewJobs((prev) => prev.filter((j) => j.chapterId !== cid))
              }
            }, 2200)
          }
        } else if (s.state === 'failed') {
          await refreshDashboard()
        }
      } catch {
        if (!cancelled) {
          setOverviewJobs((prev) =>
            prev.map((job) =>
              job.chapterId === cid
                ? { ...job, state: 'failed', error: 'Не удалось получить статус обработки' }
                : job,
            ),
          )
        }
      }
    }

    const pollAll = async () => {
      if (cancelled) return
      const active = overviewJobsRef.current.filter(
        (j) => j.state !== 'completed' && j.state !== 'failed',
      )
      if (active.length === 0) return
      await Promise.all(active.map((j) => pollOne(j.chapterId)))
    }

    void pollAll()
    const timer = setInterval(() => void pollAll(), 1400)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [activeOverviewJobCount, refreshDashboard])

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
      const created = await apiPostJson<ProjectApi>('/projects', {
        title: payload.title,
        description: payload.description ?? null,
        source_language: payload.source_language ?? null,
        target_language: payload.target_language ?? null,
      })
      await refreshDashboard()
      const dates = resolveProjectDates(created.id, created.created_at, created.updated_at)
      return {
        id: created.id,
        title: created.title,
        slug: created.slug,
        createdAt: dates.createdAt,
        updatedAt: dates.updatedAt,
      }
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
        await apiPatchJson(`/chapters/${chapterId}`, { status_code: 'ai' })
        await apiPostJson(`/chapters/${chapterId}/overview-pipeline/start`, {
          solo_mode: soloMode,
          assigned_editor_id: soloMode
            ? CURRENT_USER.id
            : item.editorId?.trim()
              ? item.editorId
              : null,
        })
        setOverviewJobs((prev) => [
          ...prev,
          {
            chapterId,
            fileLabel: item.file.name,
            state: 'running',
            total: 0,
            done: 0,
            phase: 'queued',
            error: null,
          },
        ])
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
    async (
      chapterId: string,
      projectId: string,
      chapterNumber: number,
      chapterTitle?: string | null,
      editorId?: string | null,
    ) => {
      if (!Number.isFinite(chapterNumber) || chapterNumber < 1) return
      try {
        const payload: {
          project_id: string
          chapter_number: number
          chapter_title: string | null
          assigned_editor_id?: string | null
        } = {
          project_id: projectId,
          chapter_number: chapterNumber,
          chapter_title: chapterTitle ?? null,
        }
        if (editorId !== undefined) {
          payload.assigned_editor_id = editorId?.trim() ? editorId : null
        }
        await apiPatchJson(`/chapters/${chapterId}`, payload)
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
      } catch (e) {
        console.error(e)
        setDashboardError(e instanceof Error ? e.message : 'Ошибка назначения')
      }
    },
    [teamMembers, refreshDashboard],
  )

  const uploadTaskDeliverables = useCallback(async (chapterId: string, files: File[]) => {
    const archives = files.filter((f) => /\.(zip|rar)$/i.test(f.name))
    const others = files.filter((f) => !/\.(zip|rar)$/i.test(f.name))

    for (const arch of archives) {
      const fd = new FormData()
      fd.append('file', arch)
      await apiPostMultipart(`/chapters/${chapterId}/archive`, fd)
    }

    if (others.length > 0) {
      const fd = new FormData()
      for (const f of others) fd.append('files', f)
      await apiPostMultipart(`/chapters/${chapterId}/upload`, fd)
    }
  }, [])

  const submitTaskForReview = useCallback(
    async (chapterId: string) => {
      try {
        await apiPostJson(`/chapters/${chapterId}/submit-for-review`, {})
        await refreshDashboard()
      } catch (e) {
        console.error(e)
        setDashboardError(e instanceof Error ? e.message : 'Ошибка отправки на проверку')
        throw e
      }
    },
    [refreshDashboard],
  )

  const reviewChapter = useCallback(
    async (chapterId: string, action: 'approve' | 'reject', comment?: string) => {
      try {
        await apiPostJson(`/chapters/${chapterId}/review`, { action, comment: comment ?? null })
        await refreshDashboard()
      } catch (e) {
        console.error(e)
        setDashboardError(e instanceof Error ? e.message : 'Ошибка проверки')
        throw e
      }
    },
    [refreshDashboard],
  )

  const downloadChapterDeliverables = useCallback(async (chapterId: string) => {
    try {
      await apiDownloadChapterArchive(chapterId)
    } catch (e) {
      console.error(e)
      setDashboardError(e instanceof Error ? e.message : 'Ошибка скачивания')
      throw e
    }
  }, [])

  const loadGlossaryForProject = useCallback(async (projectId: string) => {
    try {
      const rows = await apiGet<GlossaryApi[]>(`/glossary/${projectId}`)
      const mapped: GlossaryEntry[] = rows.map((r) => ({
        id: String(r.id),
        source: r.term_source,
        target: r.term_target,
        chapterId: r.chapter_id,
        chapterNumber: r.chapter_number,
      }))
      setProjectGlossary(projectId, mapped)
      setGlossaryByProjectId((prev) => ({ ...prev, [projectId]: mapped }))
      return mapped
    } catch (e) {
      console.error(e)
      const cached = getProjectGlossary(projectId)
      if (cached.length > 0) {
        setGlossaryByProjectId((prev) => ({ ...prev, [projectId]: cached }))
        return cached
      }
      setGlossaryByProjectId((prev) => {
        if (prev[projectId] !== undefined) return prev
        return { ...prev, [projectId]: [] }
      })
      throw e
    }
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
        chapter_id: entry.chapterId ?? null,
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

  const clearDashboardError = useCallback(() => {
    setDashboardError(null)
  }, [])

  const value = useMemo<PipelineContextValue>(
    () => ({
      soloMode,
      setSoloMode,
      projects,
      teamMembers,
      dashboardLoading,
      dashboardError,
      clearDashboardError,
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
      overviewJobs,
      dismissOverviewJob,
      clearOverviewJobs,
      stats,
      assignEditor,
      updateChapterMetadata,
      removeChapter,
      uploadTaskDeliverables,
      submitTaskForReview,
      reviewChapter,
      downloadChapterDeliverables,
      editorTasks,
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
      clearDashboardError,
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
      overviewJobs,
      dismissOverviewJob,
      clearOverviewJobs,
      stats,
      assignEditor,
      updateChapterMetadata,
      removeChapter,
      uploadTaskDeliverables,
      submitTaskForReview,
      reviewChapter,
      downloadChapterDeliverables,
      editorTasks,
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
