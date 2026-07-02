import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { PressActionButton } from '../../components/PressActionButton'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'

type AddGlossaryEntryModalProps = {
  open: boolean
  mode?: 'add' | 'edit'
  projectLabel: string
  initialSource?: string
  initialTarget?: string
  onClose: () => void
  onSubmit: (source: string, target: string) => void
  onDelete?: () => void
}

export function AddGlossaryEntryModal({
  open,
  mode = 'add',
  projectLabel,
  initialSource = '',
  initialTarget = '',
  onClose,
  onSubmit,
  onDelete,
}: AddGlossaryEntryModalProps) {
  const titleId = useId()
  const [source, setSource] = useState(initialSource)
  const [target, setTarget] = useState(initialTarget)

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    setSource(initialSource)
    setTarget(initialTarget)
  }, [open, initialSource, initialTarget])

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
        className="team-modal project-form-modal glossary-add-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="team-modal-header">
          <h2 id={titleId} className="team-modal-title">
            {mode === 'edit' ? 'Редактировать термин' : 'Добавить в глоссарий'}: {projectLabel}
          </h2>
          <button type="button" className="team-modal-close" aria-label="Закрыть" onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="project-form-body">
          <div className="project-form-field review-queue-field">
            <label className="dashboard-filter-btn review-queue-chapter-cell project-form-name-cell">
              <span className="dashboard-filter-btn-text">
                <span className="dashboard-filter-btn-label">Оригинал:</span>
                <input
                  className="review-queue-chapter-input project-form-name-input"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  autoFocus
                  placeholder="—"
                  aria-label="Оригинал"
                />
              </span>
            </label>
          </div>
          <div className="project-form-field review-queue-field">
            <label className="dashboard-filter-btn review-queue-chapter-cell project-form-name-cell">
              <span className="dashboard-filter-btn-text">
                <span className="dashboard-filter-btn-label">Перевод:</span>
                <input
                  className="review-queue-chapter-input project-form-name-input"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="—"
                  aria-label="Перевод"
                />
              </span>
            </label>
          </div>
        </div>
        <div className="project-form-footer">
          {mode === 'edit' ? (
            <PressActionButton wrapClassName="project-form-delete-btn" onClick={onDelete}>
              <span>Удалить</span>
            </PressActionButton>
          ) : null}
          <PressActionButton onClick={onClose}>
            <span>Отмена</span>
          </PressActionButton>
          <PressActionButton
            onClick={() => {
              const s = source.trim()
              const t = target.trim()
              if (!s || !t) return
              onSubmit(s, t)
              onClose()
            }}
          >
            <span>Сохранить</span>
          </PressActionButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}
