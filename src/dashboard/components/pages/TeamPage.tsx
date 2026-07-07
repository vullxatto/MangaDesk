import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Pencil, UserPlus } from 'lucide-react'
import { PressActionButton } from '../../../components/PressActionButton'
import TeamInviteModal from '../TeamInviteModal'
import TeamMemberEditModal from '../TeamMemberEditModal'
import DashboardDropdown from '../DashboardDropdown'
import { apiDelete, apiPatchJson, apiPostJson } from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'
import { usePipeline } from '../../context/usePipeline'
import {
  canManageTeamMembers,
  teamRoleLabel,
  type EditableTeamRole,
} from '../../teamRoles'
import type { TeamMember } from '../../pipelineTypes'

const DEFAULT_PAGE_SIZE = 10

const pageSizeOptions = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
]

function TeamPage({ title = 'Команда' }) {
  const { user, teams, currentTeamId } = useAuth()
  const { teamMembers, refreshDashboard } = usePipeline()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [pageIndex, setPageIndex] = useState(0)
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [memberActionBusy, setMemberActionBusy] = useState(false)

  const currentTeam = teams.find((t) => t.id === currentTeamId) ?? null
  const isPersonalTeam = !!currentTeam?.is_personal
  const canManageMembers = canManageTeamMembers(currentTeam?.role)

  const totalPages = Math.max(1, Math.ceil(teamMembers.length / pageSize))
  const safePageIndex = Math.min(pageIndex, totalPages - 1)
  const paginatedMembers = useMemo(() => {
    const start = safePageIndex * pageSize
    return teamMembers.slice(start, start + pageSize)
  }, [teamMembers, pageSize, safePageIndex])

  useEffect(() => {
    setPageIndex(0)
  }, [pageSize, teamMembers.length])

  useEffect(() => {
    if (pageIndex > totalPages - 1) {
      setPageIndex(Math.max(0, totalPages - 1))
    }
  }, [pageIndex, totalPages])

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (!openFilterKey) return
      const t = e.target as Node
      const trigger = document.querySelector(`[data-review-queue-dd="${CSS.escape(openFilterKey)}"]`)
      const portalMenu = document.querySelector(`[data-review-queue-portal="${CSS.escape(openFilterKey)}"]`)
      if (trigger?.contains(t) || portalMenu?.contains(t)) return
      setOpenFilterKey(null)
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenFilterKey(null)
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openFilterKey])

  async function handleInvite() {
    setError(null)
    try {
      const res = await apiPostJson<{ invite_url: string }>('/team/invites', {})
      setInviteLink(res.invite_url)
      setInviteOpen(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать инвайт')
    }
  }

  async function handleRemove(member: TeamMember) {
    const ok = window.confirm(`Удалить участника ${member.name} из команды?`)
    if (!ok) return
    setError(null)
    setMemberActionBusy(true)
    try {
      await apiDelete(`/team/members/${member.id}`)
      setEditingMember(null)
      await refreshDashboard()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить участника')
    } finally {
      setMemberActionBusy(false)
    }
  }

  async function handleSaveRole(member: TeamMember, role: EditableTeamRole) {
    setError(null)
    setMemberActionBusy(true)
    try {
      await apiPatchJson(`/team/members/${member.id}`, { role })
      setEditingMember(null)
      await refreshDashboard()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось изменить роль')
    } finally {
      setMemberActionBusy(false)
    }
  }

  function canEditMember(member: TeamMember) {
    return (
      canManageMembers &&
      !isPersonalTeam &&
      user?.id !== member.id &&
      member.role !== 'owner'
    )
  }

  return (
    <div className="chapters-page projects-page team-page">
      <div className="dashboard-toolbar projects-page-toolbar team-page-toolbar">
        <h1>{title}</h1>
        <div className="projects-page-toolbar-actions">
          <div className="dashboard-filters chapters-page-filters">
            <DashboardDropdown
              label="Число строк"
              options={pageSizeOptions}
              value={String(pageSize)}
              onChange={(value) => setPageSize(Number(value))}
              ddKey="team-filter|page-size"
              openKey={openFilterKey}
              onOpenChange={setOpenFilterKey}
              stableTriggerWidth
            />
            <div className="chapters-page-pagination">
              <button
                type="button"
                className="review-queue-clear chapters-page-pagination-btn"
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={safePageIndex <= 0}
                aria-label="Предыдущая страница"
              >
                <ChevronLeft size={16} strokeWidth={1.8} aria-hidden />
              </button>
              <span className="chapters-page-pagination-label">
                {safePageIndex + 1} / {totalPages}
              </span>
              <button
                type="button"
                className="review-queue-clear chapters-page-pagination-btn"
                onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePageIndex >= totalPages - 1}
                aria-label="Следующая страница"
              >
                <ChevronRight size={16} strokeWidth={1.8} aria-hidden />
              </button>
            </div>
          </div>
          {!isPersonalTeam ? (
            <PressActionButton onClick={() => void handleInvite()}>
              <UserPlus className="projects-add-project-plus" size={18} strokeWidth={2.5} aria-hidden />
              <span>Пригласить</span>
            </PressActionButton>
          ) : null}
        </div>
      </div>

      {error ? <p className="review-queue-field-error">{error}</p> : null}

      <div className="chapters-panel article-mini-card">
        <div className="projects-table team-members-table">
          <div className="projects-row projects-head">
            <span>Участник</span>
            <span>Роль</span>
            <span className="chapters-actions-head" aria-hidden="true" />
          </div>
          {paginatedMembers.map((m) => (
            <div key={m.id} className="projects-row">
              <span className="team-member-identity">
                <div className="chapters-editor-avatar-wrap">
                  <div className="chapters-editor-avatar">
                    <img
                      src={`https://picsum.photos/seed/mangadesk-team-${m.id}/96/96`}
                      alt=""
                      className="chapters-editor-avatar-img"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
                <span className="projects-name">{m.name}</span>
              </span>
              <span className="account-muted">{teamRoleLabel(m.role)}</span>
              <span className="chapters-actions">
                {canEditMember(m) ? (
                  <button
                    type="button"
                    className="review-queue-clear"
                    onClick={() => setEditingMember(m)}
                    aria-label={`Редактировать участника ${m.name}`}
                    title="Редактировать"
                  >
                    <Pencil size={16} strokeWidth={1.8} aria-hidden />
                  </button>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      </div>

      <TeamInviteModal
        open={inviteOpen}
        inviteLink={inviteLink}
        onClose={() => setInviteOpen(false)}
      />

      {editingMember ? (
        <TeamMemberEditModal
          open
          memberName={editingMember.name}
          memberRole={editingMember.role}
          saving={memberActionBusy}
          onClose={() => {
            if (memberActionBusy) return
            setEditingMember(null)
          }}
          onSave={(role) => handleSaveRole(editingMember, role)}
          onDelete={() => handleRemove(editingMember)}
        />
      ) : null}
    </div>
  )
}

export default TeamPage
