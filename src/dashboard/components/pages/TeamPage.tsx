import { useState } from 'react'
import { Trash2, UserPlus } from 'lucide-react'
import TeamInviteModal from '../TeamInviteModal'
import { apiDelete, apiPostJson } from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'
import { usePipeline } from '../../context/usePipeline'

function TeamPage({ title = 'Команда' }) {
  const { user } = useAuth()
  const { teamMembers, refreshDashboard } = usePipeline()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [error, setError] = useState<string | null>(null)

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
        <button type="button" className="dashboard-new-btn" onClick={() => void handleInvite()}>
          <UserPlus className="projects-add-project-plus" size={18} strokeWidth={2.5} aria-hidden />
          <span>Пригласить</span>
        </button>
      </div>

      {error ? <p className="review-queue-field-error">{error}</p> : null}

      <div className="account-card">
        <h2>Участники команды</h2>
        <div className="trash-list">
          {teamMembers.map((m) => (
            <div key={m.id} className="trash-item">
              <div>
                <div className="dashboard-user-name">{m.name}</div>
                <div className="account-muted">{m.role ?? 'member'}</div>
              </div>
              {user?.id !== m.id ? (
                <button
                  type="button"
                  className="account-social-btn"
                  onClick={() => void handleRemove(m.id, m.name)}
                  aria-label={`Удалить ${m.name}`}
                >
                  <Trash2 size={14} strokeWidth={1.8} aria-hidden /> Удалить
                </button>
              ) : null}
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
