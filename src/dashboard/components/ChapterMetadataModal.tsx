import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { DashboardProject } from '../pipelineTypes'
import { isDuplicateChapterNumber } from '../context/pipelineConstants'
import type { ChapterRow, UploadQueueItem } from '../pipelineTypes'

export default function ChapterMetadataModal({
  initialProjectId,
  initialNumber,
  chapterId,
  projects,
  chapters,
  uploadQueue,
  onClose,
  onConfirm,
  onDelete,
}: {
  initialProjectId: string
  initialNumber: number
  chapterId: string
  projects: DashboardProject[]
  chapters: ChapterRow[]
  uploadQueue: UploadQueueItem[]
  onClose: () => void
  onConfirm: (projectId: string, number: number, chapterTitle?: string | null) => void
  onDelete: () => void
}) {
  const [projectId, setProjectId] = useState(
    () => projects.find((p) => p.id === initialProjectId)?.id ?? projects[0]?.id ?? '',
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
    const num = parseInt(String(chapterNum).trim(), 10)
    if (!projectId) {
      setError('Выберите проект')
      return
    }
    if (!Number.isFinite(num) || num < 1) {
      setError('Укажите номер главы не меньше 1')
      return
    }
    if (isDuplicateChapterNumber(projectId, num, chapters, uploadQueue, '', chapterId)) {
      setError('Такой номер для этого проекта уже занят')
      return
    }
    setError(null)
    onConfirm(projectId, num, null)
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
              {projects.map((p) => (
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
          <button
            type="button"
            className="dashboard-reset-btn chapter-editor-meta-cancel"
            onClick={onDelete}
            style={{ marginRight: 'auto', color: '#b91c1c', borderColor: 'rgba(180,40,40,0.35)' }}
          >
            Удалить
          </button>
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
