import type { ReactNode } from 'react'
import type { GlossaryEntry } from './glossary/glossaryTypes'

export type ChapterStatusCode =
  | 'ready'
  | 'ai'
  | 'edit'
  | 'upload'
  | 'waiting_editor'

export interface DashboardProject {
  id: string
  title: string
  slug: string
}

export interface TeamMember {
  id: string
  name: string
  role?: string
}

export interface ChapterRow {
  id: string
  projectId: string
  title: string
  number: number
  statusCode: ChapterStatusCode
  date: string
  editorId: string | null
  editorName: string | null
  assignedAt: string | null
  restoredFromTrash?: boolean
}

export interface UploadQueueItem {
  id: string
  file: File
  projectId: string
  chapterNumber: string
  editorId: string
}

export interface PipelineContextValue {
  soloMode: boolean
  setSoloMode: (value: boolean) => void
  projects: DashboardProject[]
  teamMembers: TeamMember[]
  dashboardLoading: boolean
  dashboardError: string | null
  refreshDashboard: () => Promise<void>
  createProject: (payload: {
    title: string
    description?: string | null
    source_language?: string | null
    target_language?: string | null
  }) => Promise<void>
  updateProject: (
    projectId: string,
    payload: {
      title?: string
      description?: string | null
      source_language?: string | null
      target_language?: string | null
    },
  ) => Promise<void>
  removeProject: (projectId: string) => Promise<void>
  chapters: ChapterRow[]
  uploadQueue: UploadQueueItem[]
  addFilesToUploadQueue: (fileList: FileList | File[]) => void
  updateUploadQueueItem: (id: string, partial: Partial<UploadQueueItem>) => void
  removeUploadQueueItem: (id: string) => void
  clearUploadQueue: () => void
  submitUploadQueueItem: (id: string) => Promise<void>
  stats: { queue: number; inEdit: number; ready: number }
  assignEditor: (chapterIds: string[], editorId: string) => Promise<void>
  updateChapterMetadata: (
    chapterId: string,
    projectId: string,
    chapterNumber: number,
    chapterTitle?: string | null,
  ) => Promise<void>
  removeChapter: (chapterId: string) => Promise<void>
  completeEditorTask: (chapterId: string) => Promise<void>
  editorTasks: ChapterRow[]
  selectedWaitingIds: Set<string>
  toggleWaitingSelected: (chapterId: string) => void
  formatStartedAt: (ts: number) => string
  glossaryByProjectId: Record<string, GlossaryEntry[]>
  loadGlossaryForProject: (projectId: string) => Promise<void>
  addGlossaryEntry: (projectId: string, entry: Omit<GlossaryEntry, 'id'>) => Promise<void>
  updateGlossaryEntry: (
    projectId: string,
    entryId: string,
    next: Omit<GlossaryEntry, 'id'>,
  ) => Promise<void>
  removeGlossaryEntry: (projectId: string, entryId: string) => Promise<void>
}

export type PipelineProviderProps = { children: ReactNode }
