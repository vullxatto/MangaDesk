import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

type CreateTeamModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
}

export default function CreateTeamModal({ open, onClose, onSubmit }: CreateTeamModalProps) {
  const titleId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setName('')
    setError(null)
    const t = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !saving) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose, saving])

  if (!open) return null

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Введите название команды')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit(trimmed)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать команду')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="team-modal-backdrop" role="presentation" onClick={() => !saving && onClose()}>
      <div
        className="team-modal project-form-modal create-team-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="team-modal-header">
          <h2 id={titleId} className="team-modal-title">
            Создать команду
          </h2>
          <button
            type="button"
            className="team-modal-close"
            aria-label="Закрыть"
            onClick={onClose}
            disabled={saving}
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="project-form-body">
          <label className="project-form-field">
            <span>Название команды</span>
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="project-form-input"
              placeholder="Например, Студия перевода"
              maxLength={255}
              disabled={saving}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleSave()
              }}
            />
          </label>
          {error ? (
            <p className="review-queue-field-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <div className="project-form-footer">
          <button type="button" className="dashboard-reset-btn" onClick={onClose} disabled={saving}>
            Отмена
          </button>
          <button type="button" className="dashboard-new-btn" onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Создание…' : 'Создать'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
