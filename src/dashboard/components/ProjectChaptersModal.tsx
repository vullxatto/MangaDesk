import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

type ProjectChaptersModalProps = {
  open: boolean
  projectName: string
  chaptersCount: number
  latestChapterId: number | null
  onClose: () => void
}

export default function ProjectChaptersModal({
  open,
  projectName,
  chaptersCount,
  latestChapterId,
  onClose,
}: ProjectChaptersModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return undefined
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="team-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="team-modal project-jump-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="team-modal-header">
          <h2 id={titleId} className="team-modal-title">
            Переход к главам: {projectName}
          </h2>
          <button type="button" className="team-modal-close" aria-label="Закрыть" onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="project-jump-body">
          <p className="project-jump-hint">Глав в проекте: {chaptersCount}</p>
          <Link to="/dashboard/chapters" className="project-jump-link" onClick={onClose}>
            Открыть вкладку глав
          </Link>
          {latestChapterId ? (
            <Link
              to={`/dashboard/chapters/${latestChapterId}/edit`}
              className="project-jump-link"
              onClick={onClose}
            >
              Открыть последнюю главу в редакторе
            </Link>
          ) : (
            <p className="project-jump-empty">У проекта пока нет главы для перехода в редактор.</p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
