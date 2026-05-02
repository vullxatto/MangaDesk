import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Copy, X } from 'lucide-react'

type TeamInviteModalProps = {
  open: boolean
  inviteLink: string
  onClose: () => void
}

export default function TeamInviteModal({ open, inviteLink, onClose }: TeamInviteModalProps) {
  const titleId = useId()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    setCopied(false)
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
        className="team-modal team-invite-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="team-modal-header">
          <h2 id={titleId} className="team-modal-title">
            Приглашение в команду
          </h2>
          <button type="button" className="team-modal-close" aria-label="Закрыть" onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="team-invite-body">
          <p className="team-invite-hint">
            Отправьте ссылку участнику. После подключения роли и права зададите на вкладке команды.
          </p>
          <div className="team-invite-link-wrap">
            <input className="team-invite-link-input" value={inviteLink} readOnly />
            <button
              type="button"
              className="team-invite-copy-btn"
              onClick={async () => {
                await navigator.clipboard.writeText(inviteLink)
                setCopied(true)
              }}
            >
              {copied ? <Check size={16} strokeWidth={2} /> : <Copy size={16} strokeWidth={2} />}
              <span>{copied ? 'Скопировано' : 'Копировать'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
