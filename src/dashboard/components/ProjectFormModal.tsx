import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { usePipeline } from '../context/usePipeline'

type ProjectFormModalProps = {
  open: boolean
  mode: 'add' | 'edit'
  projectId?: string
  initialName?: string
  onDelete?: () => void
  onClose: () => void
}

export default function ProjectFormModal({
  open,
  mode,
  projectId,
  initialName = '',
  onDelete,
  onClose,
}: ProjectFormModalProps) {
  const { createProject, updateProject } = usePipeline()
  const titleId = useId()
  const [name, setName] = useState(initialName)
  const [sourceLang, setSourceLang] = useState('jp')
  const [targetLang, setTargetLang] = useState('ru')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(initialName)
      setError(null)
    }
  }, [open, initialName])

  useEffect(() => {
    if (!open) return undefined
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Введите название')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (mode === 'add') {
        await createProject({
          title: trimmed,
          description: null,
          source_language: sourceLang,
          target_language: targetLang,
        })
      } else if (projectId) {
        await updateProject(projectId, {
          title: trimmed,
          source_language: sourceLang,
          target_language: targetLang,
        })
      }
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

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
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="project-form-input"
              placeholder="Введите название"
            />
          </label>
          <label className="project-form-field">
            <span>Язык оригинала</span>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="project-form-input"
            >
              <option value="jp">Японский</option>
              <option value="en">Английский</option>
              <option value="kr">Корейский</option>
              <option value="cn">Китайский</option>
            </select>
          </label>
          <label className="project-form-field">
            <span>Язык перевода</span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="project-form-input"
            >
              <option value="ru">Русский</option>
              <option value="en">Английский</option>
            </select>
          </label>
          {error ? (
            <p className="review-queue-field-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <div className="project-form-footer">
          {mode === 'edit' ? (
            <button
              type="button"
              className="dashboard-reset-btn"
              onClick={onDelete}
              disabled={saving}
              style={{ marginRight: 'auto', color: '#b91c1c', borderColor: 'rgba(180,40,40,0.35)' }}
            >
              Удалить
            </button>
          ) : null}
          <button type="button" className="dashboard-reset-btn" onClick={onClose} disabled={saving}>
            Отмена
          </button>
          <button type="button" className="dashboard-new-btn" onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
