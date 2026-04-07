import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

function TeamRequisitesModal({ member, onClose }) {
  useEffect(() => {
    if (!member) return undefined
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [member, onClose])

  if (!member) return null

  return createPortal(
    <div className="team-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="team-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="team-modal-header">
          <h2 id="team-modal-title" className="team-modal-title">
            Данные: {member.name}
          </h2>
          <button type="button" className="team-modal-close" aria-label="Закрыть" onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <dl className="team-modal-body">
          <div className="team-modal-row">
            <dt>Почта</dt>
            <dd>
              <a href={`mailto:${member.email}`}>{member.email}</a>
            </dd>
          </div>
          <div className="team-modal-row">
            <dt>Номер карты</dt>
            <dd className="team-modal-card-num">{member.cardNumber}</dd>
          </div>
        </dl>
      </div>
    </div>,
    document.body,
  )
}

export default TeamRequisitesModal
