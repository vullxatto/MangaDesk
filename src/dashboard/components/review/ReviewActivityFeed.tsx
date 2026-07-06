import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'

const dotClassByType = {
  achievement: 'review-feed-dot--accent',
  system: 'review-feed-dot--purple',
  discussion: 'review-feed-dot--warm',
}

function ReviewActivityFeed({ events, maxHeight = 380 }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const updateScrollTopVisibility = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setShowScrollTop(el.scrollTop > 8)
  }, [])

  useLayoutEffect(() => {
    updateScrollTopVisibility()
  }, [events, maxHeight, updateScrollTopVisibility])

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="review-aside-block review-aside-block--feed article-mini-card">
      <div className="review-aside-head">
        <h2 className="review-aside-title">Лента событий</h2>
        <button
          type="button"
          className={`review-queue-clear review-feed-scroll-top${showScrollTop ? ' review-feed-scroll-top--visible' : ''}`}
          onClick={scrollToTop}
          aria-label="Прокрутить ленту наверх"
          aria-hidden={!showScrollTop}
          tabIndex={showScrollTop ? 0 : -1}
        >
          <ArrowUp size={16} strokeWidth={1.8} aria-hidden />
        </button>
      </div>
      <div
        ref={scrollRef}
        className="review-feed-scroll"
        style={{ ['--review-feed-max-height' as string]: `${maxHeight}px` }}
        onScroll={updateScrollTopVisibility}
      >
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
    </div>
  )
}

export default ReviewActivityFeed
