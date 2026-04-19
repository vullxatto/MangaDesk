import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { MANGA_PROJECTS, isDuplicateChapterNumber } from '../context/pipelineConstants'
import type { ChapterRow, ProcessingJob, UploadQueueItem } from '../pipelineTypes'

export default function ChapterMetadataModal({
  initialTitle,
  initialNumber,
  chapterId,
  chapters,
  uploadQueue,
  processingJobs,
  onClose,
  onConfirm,
}: {
  initialTitle: string
  initialNumber: number
  chapterId: number
  chapters: ChapterRow[]
  uploadQueue: UploadQueueItem[]
  processingJobs: ProcessingJob[]
  onClose: () => void
  onConfirm: (title: string, number: number) => void
}) {
  const [projectId, setProjectId] = useState(
    () => MANGA_PROJECTS.find((p) => p.title === initialTitle)?.id ?? MANGA_PROJECTS[0].id,
  )
  const [chapterNum, setChapterNum] = useState(String(initialNumber))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleConfirm() {
    const project = MANGA_PROJECTS.find((p) => p.id === projectId)
    const num = parseInt(String(chapterNum).trim(), 10)
    if (!project) {
      setError('Выберите проект')
      return
    }
    if (!Number.isFinite(num) || num < 1) {
      setError('Укажите номер главы не меньше 1')
      return
    }
    if (
      isDuplicateChapterNumber(
        project.title,
        num,
        chapters,
        uploadQueue,
        processingJobs,
        '',
        chapterId,
      )
    ) {
      setError('Такой номер для этого проекта уже занят')
      return
    }
    setError(null)
    onConfirm(project.title, num)
    onClose()
  }

  return createPortal(
    <div
      className="team-modal-backdrop review-submit-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="team-modal review-submit-modal chapter-editor-meta-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chapter-metadata-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="team-modal-header">
          <h2 id="chapter-metadata-modal-title" className="team-modal-title">
            Изменить проект и номер главы
          </h2>
          <button type="button" className="team-modal-close" aria-label="Закрыть" onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="chapter-editor-meta-modal-body">
          <label className="chapter-editor-meta-field">
            <span className="review-queue-field-label">Проект</span>
            <select
              className="chapter-editor-meta-select"
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value)
                setError(null)
              }}
            >
              {MANGA_PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
          <label className="chapter-editor-meta-field">
            <span className="review-queue-field-label">Номер главы</span>
            <input
              type="number"
              className="review-queue-input"
              min={1}
              step={1}
              value={chapterNum}
              onChange={(e) => {
                setChapterNum(e.target.value)
                setError(null)
              }}
            />
          </label>
          {error ? (
            <p className="review-queue-field-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <div className="chapter-editor-meta-modal-footer">
          <button type="button" className="dashboard-reset-btn chapter-editor-meta-cancel" onClick={onClose}>
            Отмена
          </button>
          <button type="button" className="dashboard-new-btn review-queue-submit" onClick={handleConfirm}>
            <span>Подтвердить</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
