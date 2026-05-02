import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

type AddGlossaryEntryModalProps = {
  open: boolean
  mode?: 'add' | 'edit'
  projectLabel: string
  initialSource?: string
  initialTarget?: string
  onClose: () => void
  onSubmit: (source: string, target: string) => void
}

export function AddGlossaryEntryModal({
  open,
  mode = 'add',
  projectLabel,
  initialSource = '',
  initialTarget = '',
  onClose,
  onSubmit,
}: AddGlossaryEntryModalProps) {
  const titleId = useId()
  const [source, setSource] = useState(initialSource)
  const [target, setTarget] = useState(initialTarget)

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
        className="team-modal glossary-add-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="team-modal-header">
          <h2 id={titleId} className="team-modal-title">
            {mode === 'edit' ? 'Редактировать термин' : 'Добавить в глоссарий'} · {projectLabel}
          </h2>
          <button type="button" className="team-modal-close" aria-label="Закрыть" onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="glossary-add-modal-body">
          <label className="glossary-add-field">
            <span className="glossary-add-label">Оригинал</span>
            <input
              className="glossary-add-input"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              autoFocus
            />
          </label>
          <label className="glossary-add-field">
            <span className="glossary-add-label">Перевод</span>
            <input
              className="glossary-add-input"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </label>
        </div>
        <div className="glossary-add-modal-footer">
          <button type="button" className="dashboard-reset-btn" onClick={onClose}>
            Отмена
          </button>
          <button
            type="button"
            className="dashboard-new-btn"
            onClick={() => {
              const s = source.trim()
              const t = target.trim()
              if (!s || !t) return
              onSubmit(s, t)
              onClose()
            }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
