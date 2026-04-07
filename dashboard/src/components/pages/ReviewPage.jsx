import { useState } from 'react'
import ReviewActivityFeed from '../review/ReviewActivityFeed'
import ReviewDropzone from '../review/ReviewDropzone'
import ReviewOnlineSidebar from '../review/ReviewOnlineSidebar'
import ReviewPipelineReadyGrids from '../review/ReviewPipelineReadyGrids'

const pipelineMock = [
  { id: 1, projectTitle: 'Тайтл 1', chapterNumber: 14, participantName: 'Роберт' },
  { id: 2, projectTitle: 'Тайтл 2', chapterNumber: 3, participantName: 'Мария' },
  { id: 3, projectTitle: 'Тайтл 3', chapterNumber: 21, participantName: 'Алексей' },
  { id: 4, projectTitle: 'Тайтл 4', chapterNumber: 8, participantName: 'Елена' },
  { id: 5, projectTitle: 'Тайтл 5', chapterNumber: 102, participantName: 'Дмитрий' },
  { id: 6, projectTitle: 'Тайтл 1', chapterNumber: 15, participantName: 'Мария' },
  { id: 7, projectTitle: 'Тайтл 2', chapterNumber: 41, participantName: 'Роберт' },
  { id: 8, projectTitle: 'Тайтл 6', chapterNumber: 2, participantName: 'Анна' },
  { id: 9, projectTitle: 'Тайтл 3', chapterNumber: 19, participantName: 'Алексей' },
  { id: 10, projectTitle: 'Тайтл 7', chapterNumber: 11, participantName: 'Елена' },
  { id: 11, projectTitle: 'Тайтл 4', chapterNumber: 33, participantName: 'Дмитрий' },
  { id: 12, projectTitle: 'Тайтл 5', chapterNumber: 6, participantName: 'Анна' },
]

const readyMock = [
  {
    id: 1,
    projectTitle: 'Тайтл 1',
    chapterNumber: 12,
    readyAt: '31.01.2026 14:40',
    readyAtIso: '2026-01-31T14:40:00',
  },
  {
    id: 2,
    projectTitle: 'Тайтл 3',
    chapterNumber: 7,
    readyAt: '30.01.2026 18:22',
    readyAtIso: '2026-01-30T18:22:00',
  },
  {
    id: 3,
    projectTitle: 'Тайтл 2',
    chapterNumber: 5,
    readyAt: '29.01.2026 11:05',
    readyAtIso: '2026-01-29T11:05:00',
  },
  {
    id: 4,
    projectTitle: 'Тайтл 4',
    chapterNumber: 22,
    readyAt: '28.01.2026 09:15',
    readyAtIso: '2026-01-28T09:15:00',
  },
  {
    id: 5,
    projectTitle: 'Тайтл 5',
    chapterNumber: 1,
    readyAt: '27.01.2026 21:00',
    readyAtIso: '2026-01-27T21:00:00',
  },
  {
    id: 6,
    projectTitle: 'Тайтл 1',
    chapterNumber: 13,
    readyAt: '26.01.2026 16:30',
    readyAtIso: '2026-01-26T16:30:00',
  },
  {
    id: 7,
    projectTitle: 'Тайтл 6',
    chapterNumber: 4,
    readyAt: '25.01.2026 12:00',
    readyAtIso: '2026-01-25T12:00:00',
  },
  {
    id: 8,
    projectTitle: 'Тайтл 2',
    chapterNumber: 40,
    readyAt: '24.01.2026 08:45',
    readyAtIso: '2026-01-24T08:45:00',
  },
  {
    id: 9,
    projectTitle: 'Тайтл 3',
    chapterNumber: 18,
    readyAt: '23.01.2026 19:20',
    readyAtIso: '2026-01-23T19:20:00',
  },
  {
    id: 10,
    projectTitle: 'Тайтл 7',
    chapterNumber: 9,
    readyAt: '22.01.2026 10:00',
    readyAtIso: '2026-01-22T10:00:00',
  },
  {
    id: 11,
    projectTitle: 'Тайтл 4',
    chapterNumber: 31,
    readyAt: '21.01.2026 14:30',
    readyAtIso: '2026-01-21T14:30:00',
  },
  {
    id: 12,
    projectTitle: 'Тайтл 5',
    chapterNumber: 6,
    readyAt: '20.01.2026 07:55',
    readyAtIso: '2026-01-20T07:55:00',
  },
]

const onlineMock = [
  { id: 1, name: 'Still Rise', activity: 'Проверяет макет 14-й главы', presence: 'active' },
  { id: 2, name: 'Роберт', activity: 'Редактура · Тайтл 1', presence: 'active' },
  { id: 3, name: 'Мария', activity: 'В сети', presence: 'away' },
  { id: 4, name: 'Алексей', activity: 'Не в сети', presence: 'offline' },
]

const feedMock = [
  {
    id: 1,
    type: 'achievement',
    actor: 'Мария',
    text: 'завершила чистку текста для главы 3 (Тайтл 2).',
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
  const [queueFiles, setQueueFiles] = useState([])
  const inEdit = pipelineMock.length
  const ready = readyMock.length

  return (
    <div className="chapters-page projects-page review-page">
      <div className="dashboard-toolbar projects-page-toolbar review-page-toolbar">
        <h1>{title}</h1>
        <p className="review-summary" aria-live="polite">
          В очереди: {queueFiles.length} · В редактуре: {inEdit} · Готово: {ready}
        </p>
      </div>

      <div className="review-layout">
        <div className="review-main">
          <ReviewDropzone files={queueFiles} onFilesChange={setQueueFiles} />
          <ReviewPipelineReadyGrids pipelineItems={pipelineMock} readyItems={readyMock} />
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
