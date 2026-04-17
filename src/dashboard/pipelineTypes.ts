import type { ReactNode } from 'react'

export type ChapterStatusCode =
  | 'ready'
  | 'ai'
  | 'edit'
  | 'upload'
  | 'waiting_editor'

export interface ChapterRow {
  id: number
  title: string
  number: number
  statusCode: ChapterStatusCode
  date: string
  editorId: string | null
  editorName: string | null
  assignedAt: string | null
}

export interface UploadQueueItem {
  id: string
  file: File
  projectId: string
  chapterNumber: string
  editorId: string
}

export interface ProcessingJob {
  id: string
  fileName: string
  current: number
  totalChapters: number
  startedAt: number
  projectTitle: string
  chapterNumber: number
  preEditorId: string | null
  solo: boolean
}

export interface PipelineContextValue {
  soloMode: boolean
  setSoloMode: (value: boolean) => void
  chapters: ChapterRow[]
  uploadQueue: UploadQueueItem[]
  addZipToUploadQueue: (fileList: FileList | File[]) => void
  updateUploadQueueItem: (id: string, partial: Partial<UploadQueueItem>) => void
  removeUploadQueueItem: (id: string) => void
  clearUploadQueue: () => void
  submitUploadQueueItem: (id: string) => void
  processingJobs: ProcessingJob[]
  stats: { queue: number; inEdit: number; ready: number }
  assignEditor: (chapterIds: number[], editorId: string) => void
  completeEditorTask: (chapterId: number) => void
  editorTasks: ChapterRow[]
  selectedWaitingIds: Set<number>
  toggleWaitingSelected: (chapterId: number) => void
  formatStartedAt: (ts: number) => string
}

export type PipelineProviderProps = { children: ReactNode }
