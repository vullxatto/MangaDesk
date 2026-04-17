// @ts-nocheck
const dotClassByType = {
  achievement: 'review-feed-dot--accent',
  system: 'review-feed-dot--purple',
  discussion: 'review-feed-dot--warm',
}

function ReviewActivityFeed({ events }) {
  return (
    <div className="review-aside-block review-aside-block--feed">
      <h2 className="review-aside-title review-aside-title--solo">Лента событий</h2>
      <ul className="review-feed-list">
        {events.map((ev) => (
          <li key={ev.id} className="review-feed-item">
            <span
              className={`review-feed-dot ${dotClassByType[ev.type] ?? dotClassByType.system}`}
              aria-hidden
            />
            <div className="review-feed-body">
              <p className="review-feed-text">
                <strong>{ev.actor}</strong> {ev.text}
              </p>
              {ev.quote ? (
                <blockquote className="review-feed-quote">{ev.quote}</blockquote>
              ) : null}
              <time className="review-feed-time" dateTime={ev.isoTime}>
                {ev.timeLabel}
              </time>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ReviewActivityFeed
