import ReviewActivityFeed from '../review/ReviewActivityFeed'
import ReviewDropzone from '../review/ReviewDropzone'
import ReviewOnlineSidebar from '../review/ReviewOnlineSidebar'
import ReviewProcessingSection from '../review/ReviewProcessingSection'
import { usePipeline } from '../../context/usePipeline'

const onlineMock = [
  { id: 1, name: 'Still Rise', activity: 'Проверяет макет 14-й главы', presence: 'active' },
  { id: 2, name: 'Роберт', activity: 'Редактура · Атака титанов', presence: 'active' },
  { id: 3, name: 'Мария', activity: 'В сети', presence: 'away' },
  { id: 4, name: 'Алексей', activity: 'Не в сети', presence: 'offline' },
]

const feedMock = [
  {
    id: 1,
    type: 'achievement',
    actor: 'Мария',
    text: 'завершила чистку текста для главы 3 (Клинок, рассекающий демонов).',
    timeLabel: '12 минут назад',
    isoTime: '',
  },
  {
    id: 2,
    type: 'system',
    actor: 'Система',
    text: 'обработка архива scan_batch_12.zip поставлена в очередь.',
    timeLabel: '1 час назад',
    isoTime: '',
  },
  {
    id: 3,
    type: 'discussion',
    actor: 'Роберт',
    text: 'открыл обсуждение по сомнительному переводу в главе 14.',
    quote: '«Можно ли здесь оставить имя в катакане, как в оригинале?»',
    timeLabel: '3 часа назад',
    isoTime: '',
  },
]

function ReviewPage({ title = 'Обзор' }) {
  const { stats } = usePipeline()

  return (
    <div className="chapters-page projects-page review-page">
      <div className="dashboard-toolbar projects-page-toolbar review-page-toolbar">
        <h1>{title}</h1>
        <p className="review-summary" aria-live="polite">
          В очереди: {stats.queue} · В редактуре: {stats.inEdit} · Готово: {stats.ready}
        </p>
      </div>

      <div className="review-layout">
        <div className="review-main">
          <ReviewDropzone />
          <ReviewProcessingSection />
        </div>
        <aside className="review-aside">
          <ReviewOnlineSidebar members={onlineMock} />
          <ReviewActivityFeed events={feedMock} />
        </aside>
      </div>
    </div>
  )
}

export default ReviewPage
