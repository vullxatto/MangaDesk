import ReviewActivityFeed from '../review/ReviewActivityFeed'
import ReviewDropzone from '../review/ReviewDropzone'
import ReviewOnlineSidebar from '../review/ReviewOnlineSidebar'
import ReviewProcessingSection from '../review/ReviewProcessingSection'

const onlineMock = [
  { id: 1, name: 'Still Rise', activity: 'Проверяет макет 14-й главы', presence: 'active' },
  { id: 2, name: 'Роберт', activity: 'Редактура · Атака титанов', presence: 'away' },
  { id: 3, name: 'Мария', activity: 'В сети', presence: 'away' },
  { id: 4, name: 'Алексей', activity: 'Не в сети', presence: 'offline' },
  { id: 5, name: 'Елена', activity: 'Типографика · Клинок', presence: 'active' },
  { id: 6, name: 'Дмитрий', activity: 'Вычитка главы 7', presence: 'active' },
  { id: 7, name: 'София', activity: 'В сети', presence: 'away' },
  { id: 8, name: 'Иван', activity: 'Загрузка сканов', presence: 'offline' },
  { id: 9, name: 'Катя', activity: 'Глоссарий', presence: 'active' },
  { id: 10, name: 'Никита', activity: 'В сети', presence: 'away' },
  { id: 11, name: 'Ольга', activity: 'Редактура', presence: 'active' },
  { id: 12, name: 'Павел', activity: 'Не в сети', presence: 'offline' },
  { id: 13, name: 'Анна', activity: 'Проверка SFX', presence: 'active' },
  { id: 14, name: 'Максим', activity: 'В сети', presence: 'away' },
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
  {
    id: 4,
    type: 'achievement',
    actor: 'Still Rise',
    text: 'отправил главу 41 на финальную вычитку (F6DSF6DS).',
    timeLabel: '5 часов назад',
    isoTime: '',
  },
  {
    id: 5,
    type: 'system',
    actor: 'Система',
    text: 'OCR завершён для обложки ReManga.png — 1 страница, без ошибок.',
    timeLabel: '6 часов назад',
    isoTime: '',
  },
  {
    id: 6,
    type: 'discussion',
    actor: 'Алексей',
    text: 'предложил правку в глоссарии проекта «Атака титанов».',
    quote: '«Survey Corps лучше оставить как Разведкорпус, без кальки.»',
    timeLabel: 'вчера',
    isoTime: '',
  },
  {
    id: 7,
    type: 'achievement',
    actor: 'Мария',
    text: 'добавила 12 терминов в глоссарий «Клинок, рассекающий демонов».',
    timeLabel: 'вчера',
    isoTime: '',
  },
  {
    id: 8,
    type: 'system',
    actor: 'Система',
    text: 'автоматическая синхронизация с ReManga прошла успешно.',
    timeLabel: 'вчера',
    isoTime: '',
  },
  {
    id: 9,
    type: 'discussion',
    actor: 'Роберт',
    text: 'оставил комментарий к макету главы 14.',
    quote: '«На 7-й странице обрезан SFX — нужно подвинуть текстовый блок.»',
    timeLabel: '2 дня назад',
    isoTime: '',
  },
  {
    id: 10,
    type: 'achievement',
    actor: 'Still Rise',
    text: 'принял приглашение в команду и получил роль редактора.',
    timeLabel: '2 дня назад',
    isoTime: '',
  },
  {
    id: 11,
    type: 'system',
    actor: 'Система',
    text: 'глава 40 переведена в статус «На проверке».',
    timeLabel: '3 дня назад',
    isoTime: '',
  },
  {
    id: 12,
    type: 'discussion',
    actor: 'Мария',
    text: 'спросила про формат экспорта для ReManga.',
    quote: '«Отдаём PSD послойно или плоский PNG достаточно?»',
    timeLabel: '3 дня назад',
    isoTime: '',
  },
  {
    id: 13,
    type: 'achievement',
    actor: 'Алексей',
    text: 'закрыл 8 задач по вычитке в проекте «Атака титанов».',
    timeLabel: '4 дня назад',
    isoTime: '',
  },
  {
    id: 14,
    type: 'system',
    actor: 'Система',
    text: 'резервная копия проектов команды создана автоматически.',
    timeLabel: '5 дней назад',
    isoTime: '',
  },
  {
    id: 15,
    type: 'achievement',
    actor: 'Роберт',
    text: 'опубликовал главу 13 на ReManga.',
    timeLabel: '6 дней назад',
    isoTime: '',
  },
]

function ReviewPage({ title = 'Обзор' }) {
  return (
    <div className="chapters-page projects-page review-page">
      <div className="dashboard-toolbar projects-page-toolbar review-page-toolbar">
        <h1>{title}</h1>
      </div>

      <div className="review-layout">
        <div className="review-main">
          <ReviewDropzone />
          <ReviewProcessingSection />
        </div>
        <aside className="review-aside">
          <ReviewOnlineSidebar members={onlineMock} />
          <ReviewActivityFeed events={feedMock} maxHeight={380} />
        </aside>
      </div>
    </div>
  )
}

export default ReviewPage
