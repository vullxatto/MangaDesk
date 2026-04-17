// @ts-nocheck
import { MessageCircle } from 'lucide-react'

const presenceLabel = {
  active: 'В сети',
  away: 'Неактивен',
  offline: 'Не в сети',
}

function ReviewOnlineSidebar({ members }) {
  const onlineMembers = members.filter((m) => m.presence !== 'offline')
  const onlineCount = onlineMembers.length

  return (
    <div className="review-aside-block">
      <div className="review-aside-head">
        <h2 className="review-aside-title">Участники онлайн</h2>
        <span className="review-aside-badge">{onlineCount}</span>
      </div>
      {onlineCount === 0 ? (
        <p className="review-online-empty">Сейчас никого в сети</p>
      ) : (
        <ul className="review-online-list">
          {onlineMembers.map((m) => {
            const dotClass = `team-card-avatar-dot team-card-avatar-dot--${m.presence ?? 'active'}`
            return (
              <li key={m.id} className="review-online-item">
                <div className="review-online-avatar-wrap">
                  <img
                    src={`https://picsum.photos/seed/review-side-${m.id}/64/64`}
                    alt={m.name}
                    className="review-online-avatar"
                    loading="lazy"
                    title={m.name}
                  />
                  <span className={dotClass} role="img" aria-label={presenceLabel[m.presence ?? 'active']} />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="review-chat-teaser">
        <MessageCircle size={18} strokeWidth={2} aria-hidden className="review-chat-teaser-icon" />
        <p className="review-chat-teaser-text">Общий чат для обсуждения материалов (скоро)</p>
      </div>
    </div>
  )
}

export default ReviewOnlineSidebar
