import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

type ProjectFormModalProps = {
  open: boolean
  mode: 'add' | 'edit'
  initialName?: string
  onClose: () => void
}

export default function ProjectFormModal({
  open,
  mode,
  initialName = '',
  onClose,
}: ProjectFormModalProps) {
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
        className="team-modal project-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="team-modal-header">
          <h2 id={titleId} className="team-modal-title">
            {mode === 'add' ? 'Добавить проект' : 'Редактировать проект'}
          </h2>
          <button type="button" className="team-modal-close" aria-label="Закрыть" onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="project-form-body">
          <label className="project-form-field">
            <span>Название проекта</span>
            <input defaultValue={initialName} className="project-form-input" placeholder="Введите название" />
          </label>
          <label className="project-form-field">
            <span>Язык оригинала</span>
            <select defaultValue="jp" className="project-form-input">
              <option value="jp">Японский</option>
              <option value="en">Английский</option>
              <option value="kr">Корейский</option>
              <option value="cn">Китайский</option>
            </select>
          </label>
          <label className="project-form-field">
            <span>Язык перевода</span>
            <select defaultValue="ru" className="project-form-input">
              <option value="ru">Русский</option>
              <option value="en">Английский</option>
            </select>
          </label>
        </div>
        <div className="project-form-footer">
          <button type="button" className="dashboard-reset-btn" onClick={onClose}>
            Отмена
          </button>
          <button type="button" className="dashboard-new-btn" onClick={onClose}>
            Сохранить
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
