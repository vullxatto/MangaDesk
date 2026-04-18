import { CreditCard, MoreVertical } from 'lucide-react'

const presenceLabel = {
  active: 'В сети',
  away: 'В сети, неактивен',
  offline: 'Не в сети',
}

function TeamCard({ member, onOpenDetails }) {
  const presence = member.presence ?? 'active'
  const dotClass = `team-card-avatar-dot team-card-avatar-dot--${presence}`

  return (
    <article className="team-card">
      <div className="team-card-header">
        <div className="team-card-identity">
          <div className="team-card-avatar-wrap">
            <div className="team-card-avatar">
              <img
                src={`https://picsum.photos/seed/mangadesk-team-${member.id}/96/96`}
                alt=""
                className="team-card-avatar-img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <span className={dotClass} role="img" aria-label={presenceLabel[presence] ?? presenceLabel.active} />
          </div>
          <div className="team-card-titles">
            <h3 className="team-card-name">{member.name}</h3>
            <p className="team-card-role">{member.role}</p>
          </div>
        </div>
        <button type="button" className="team-card-menu" aria-label="Действия">
          <MoreVertical size={18} strokeWidth={2} />
        </button>
      </div>

      <div className="team-card-stats">
        <div className="team-card-stat">
          <span className="team-card-stat-label team-card-stat-label--chapters">Главы (всего / в месяц)</span>
          <div className="team-card-stat-value">
            {member.chapters} / {member.chaptersPerMonth ?? '—'}
          </div>
        </div>
        <div className="team-card-stat team-card-stat--end">
          <span className="team-card-stat-label">В команде</span>
          <div className="team-card-stat-value">{member.teamSince}</div>
        </div>
      </div>

      <div className="team-card-meta">
        <button
          type="button"
          className="team-card-details-btn"
          onClick={() => onOpenDetails(member)}
        >
          <CreditCard size={16} strokeWidth={2} aria-hidden />
          <span>Данные</span>
        </button>
        <a className="team-card-stats-link" href={member.statsHref ?? '#'}>
          Статистика
        </a>
      </div>
    </article>
  )
}

export default TeamCard
