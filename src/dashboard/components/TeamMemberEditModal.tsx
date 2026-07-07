import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { PressActionButton } from '../../components/PressActionButton'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import DashboardDropdown from './DashboardDropdown'
import {
  EDITABLE_MEMBER_ROLE_OPTIONS,
  type EditableTeamRole,
  isEditableMemberRole,
} from '../teamRoles'

type TeamMemberEditModalProps = {
  open: boolean
  memberName: string
  memberRole?: string | null
  saving?: boolean
  onClose: () => void
  onSave: (role: EditableTeamRole) => void | Promise<void>
  onDelete: () => void | Promise<void>
}

export default function TeamMemberEditModal({
  open,
  memberName,
  memberRole,
  saving = false,
  onClose,
  onSave,
  onDelete,
}: TeamMemberEditModalProps) {
  const titleId = useId()
  const [role, setRole] = useState<EditableTeamRole>('member')
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null)

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    setRole(isEditableMemberRole(memberRole) ? memberRole : 'member')
    setOpenDropdownKey(null)
  }, [open, memberRole])

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
        className="team-modal project-form-modal team-member-edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="team-modal-header">
          <h2 id={titleId} className="team-modal-title">
            Участник: {memberName}
          </h2>
          <button type="button" className="team-modal-close" aria-label="Закрыть" onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="project-form-body">
          <div className="project-form-field review-queue-field">
            <DashboardDropdown
              label="Роль"
              options={[...EDITABLE_MEMBER_ROLE_OPTIONS]}
              value={role}
              onChange={(value) => setRole(value as EditableTeamRole)}
              ddKey="team-member-edit|role"
              openKey={openDropdownKey}
              onOpenChange={setOpenDropdownKey}
            />
          </div>
        </div>
        <div className="project-form-footer">
          <PressActionButton wrapClassName="project-form-delete-btn" onClick={onDelete} disabled={saving}>
            <span>Удалить</span>
          </PressActionButton>
          <PressActionButton onClick={onClose} disabled={saving}>
            <span>Отмена</span>
          </PressActionButton>
          <PressActionButton
            onClick={() => void onSave(role)}
            disabled={saving || (isEditableMemberRole(memberRole) && role === memberRole)}
          >
            <span>{saving ? 'Сохранение…' : 'Сохранить'}</span>
          </PressActionButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}
