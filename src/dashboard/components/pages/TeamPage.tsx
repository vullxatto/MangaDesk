import { useState } from 'react'
import { Trash2, UserPlus } from 'lucide-react'
import { PressActionButton } from '../../../components/PressActionButton'
import TeamInviteModal from '../TeamInviteModal'
import { apiDelete, apiPostJson } from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'
import { usePipeline } from '../../context/usePipeline'

function TeamPage({ title = 'Команда' }) {
  const { user, teams, currentTeamId } = useAuth()
  const { teamMembers, refreshDashboard } = usePipeline()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [error, setError] = useState<string | null>(null)

  const currentTeam = teams.find((t) => t.id === currentTeamId) ?? null
  const isPersonalTeam = !!currentTeam?.is_personal

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

  async function handleRemove(memberId: string, memberName: string) {
    const ok = window.confirm(`Удалить участника ${memberName} из команды?`)
    if (!ok) return
    setError(null)
    try {
      await apiDelete(`/team/members/${memberId}`)
      await refreshDashboard()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить участника')
    }
  }

  return (
    <div className="chapters-page projects-page team-page">
      <div className="dashboard-toolbar projects-page-toolbar team-page-toolbar">
        <h1>{title}</h1>
        {!isPersonalTeam ? (
          <PressActionButton onClick={() => void handleInvite()}>
            <UserPlus className="projects-add-project-plus" size={18} strokeWidth={2.5} aria-hidden />
            <span>Пригласить</span>
          </PressActionButton>
        ) : null}
      </div>

      {error ? <p className="review-queue-field-error">{error}</p> : null}

      <div className="chapters-panel article-mini-card">
        <div className="projects-table team-members-table">
          <div className="projects-row projects-head">
            <span>Участник</span>
            <span>Роль</span>
            <span className="chapters-actions-head" aria-hidden="true" />
          </div>
          {teamMembers.map((m) => (
            <div key={m.id} className="projects-row">
              <span className="projects-name">{m.name}</span>
              <span className="account-muted">{m.role ?? 'member'}</span>
              <span className="chapters-actions">
                {user?.id !== m.id ? (
                  <button
                    type="button"
                    onClick={() => void handleRemove(m.id, m.name)}
                    aria-label={`Удалить ${m.name}`}
                  >
                    <Trash2 size={14} strokeWidth={1.8} aria-hidden /> Удалить
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
    </div>
  )
}

export default TeamPage
