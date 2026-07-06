import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'

const ONLINE_ROWS = 2
const ONLINE_COLS = 6
const ONLINE_PAGE_SIZE = ONLINE_ROWS * ONLINE_COLS

const presenceLabel = {
  active: 'В сети',
  away: 'Неактивен',
  offline: 'Не в сети',
}

type OnlineMember = {
  id: string
  name: string
  activity?: string
  presence?: string
}

function ReviewOnlineSidebar({ members }: { members: OnlineMember[] }) {
  const onlineMembers = members
  const onlineCount = onlineMembers.length
  const totalPages = Math.max(1, Math.ceil(onlineCount / ONLINE_PAGE_SIZE))
  const [pageIndex, setPageIndex] = useState(0)
  const safePageIndex = Math.min(pageIndex, totalPages - 1)

  useEffect(() => {
    setPageIndex((p) => Math.min(p, totalPages - 1))
  }, [totalPages])

  const visibleMembers = useMemo(
    () => onlineMembers.slice(safePageIndex * ONLINE_PAGE_SIZE, (safePageIndex + 1) * ONLINE_PAGE_SIZE),
    [onlineMembers, safePageIndex],
  )

  const showNav = totalPages > 1

  return (
    <div className="review-aside-block article-mini-card">
      <div className="review-aside-head">
        <h2 className="review-aside-title">Участники онлайн</h2>
        <span className="review-aside-count">{onlineCount}</span>
      </div>
      {onlineCount === 0 ? (
        <p className="review-online-empty">Сейчас никого в сети</p>
      ) : (
        <div className="review-online-panel">
          <div className="review-online-grid-row">
            {showNav ? (
              <button
                type="button"
                className="review-queue-clear chapters-page-pagination-btn review-online-nav-btn"
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={safePageIndex <= 0}
                aria-label="Предыдущие участники"
              >
                <ChevronLeft size={16} strokeWidth={1.8} aria-hidden />
              </button>
            ) : null}
            <ul
              className="review-online-list"
              style={
                {
                  '--review-online-cols': ONLINE_COLS,
                  '--review-online-rows': ONLINE_ROWS,
                } as CSSProperties
              }
            >
              {visibleMembers.map((m) => (
                <li key={m.id} className="review-online-item">
                  <div className="review-online-avatar-wrap">
                    <img
                      src={`https://picsum.photos/seed/review-side-${m.id}/64/64`}
                      alt={m.name}
                      className="review-online-avatar"
                      loading="lazy"
                      title={m.name}
                    />
                    <span
                      className="team-card-avatar-dot team-card-avatar-dot--active"
                      role="img"
                      aria-label={presenceLabel.active}
                    />
                  </div>
                </li>
              ))}
            </ul>
            {showNav ? (
              <button
                type="button"
                className="review-queue-clear chapters-page-pagination-btn review-online-nav-btn"
                onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePageIndex >= totalPages - 1}
                aria-label="Следующие участники"
              >
                <ChevronRight size={16} strokeWidth={1.8} aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
      )}

      <div className="review-chat-teaser">
        <MessageSquare size={16} strokeWidth={2} aria-hidden className="review-chat-teaser-icon" />
        <p className="review-chat-teaser-text">Общий чат для обсуждения материалов (скоро)</p>
      </div>
    </div>
  )
}

export default ReviewOnlineSidebar
