import { useEffect, useState } from 'react'
import { usePipeline } from '../../context/usePipeline'
import { useReviewAssignmentsTableColumns } from '../../tableColumns'
import DashboardDropdown from '../DashboardDropdown'
import TableColumnsDropdown from '../TableColumnsDropdown'
import ReviewActivityFeed from '../review/ReviewActivityFeed'
import ReviewAssignmentsSummary from '../review/ReviewAssignmentsSummary'
import ReviewDropzone from '../review/ReviewDropzone'
import ReviewOnlineSidebar from '../review/ReviewOnlineSidebar'
import ReviewProcessingSection from '../review/ReviewProcessingSection'

const DEFAULT_PAGE_SIZE = 5

const pageSizeOptions = [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '15', label: '15' },
  { value: '20', label: '20' },
]

const onlineMock = [
  { id: 'c0000001-0001-0001-0001-000000000001', name: 'Still Rise', activity: 'Редактура · глава 47', presence: 'active' },
  { id: 'c0000002-0001-0001-0001-000000000002', name: 'Роберт', activity: 'Редактура · Башня Бога', presence: 'active' },
  { id: 'c0000003-0001-0001-0001-000000000003', name: 'Мария', activity: 'Магическая битва · глава 248', presence: 'active' },
  { id: 'c0000004-0001-0001-0001-000000000004', name: 'Алексей', activity: 'Всеведущий читатель · глава 112', presence: 'active' },
  { id: 'c0000005-0001-0001-0001-000000000005', name: 'Елена', activity: 'Глоссарий · Поднятие уровня', presence: 'active' },
  { id: 'c0000006-0001-0001-0001-000000000006', name: 'Дмитрий', activity: 'Ванпанчмен · глава 191', presence: 'active' },
  { id: 'c0000007-0001-0001-0001-000000000007', name: 'Виктория', activity: 'Блич · глава 683', presence: 'active' },
  { id: 'c0000008-0001-0001-0001-000000000008', name: 'Никита', activity: 'Маг лабиринта · глава 6', presence: 'active' },
  { id: 'c0000009-0001-0001-0001-000000000009', name: 'София', activity: 'Дандадан · глава 122', presence: 'active' },
  { id: 'c0000010-0001-0001-0001-000000000010', name: 'Артём', activity: 'Кайдзю №8 · глава 3', presence: 'active' },
  { id: 'c0000011-0001-0001-0001-000000000011', name: 'Полина', activity: 'Наруто · глава 702', presence: 'active' },
  { id: 'c0000010-0001-0001-0001-000000000012', name: 'Артём', activity: 'Кайдзю №8 · глава 3', presence: 'active' },
  { id: 'c0000011-0001-0001-0001-000000000013', name: 'Полина', activity: 'Наруто · глава 702', presence: 'active' },
]

const feedMock = [
  {
    id: 1,
    type: 'achievement',
    actor: 'Алексей',
    text: 'завершил правки по главе 112 («Всеведущий читатель»).',
    timeLabel: '12 минут назад',
    isoTime: '',
  },
  {
    id: 2,
    type: 'system',
    actor: 'Система',
    text: 'OCR завершён для solo_lvl_047.zip — 28 страниц, без ошибок.',
    timeLabel: '1 час назад',
    isoTime: '',
  },
  {
    id: 3,
    type: 'discussion',
    actor: 'Роберт',
    text: 'открыл обсуждение по переводу «Ranker» в главе 52.',
    quote: '«Оставляем «Ранкер» или лучше «Ранкёр» с ударением?»',
    timeLabel: '3 часа назад',
    isoTime: '',
  },
  {
    id: 4,
    type: 'achievement',
    actor: 'Still Rise',
    text: 'отправил главу 47 на финальную вычитку («Поднятие уровня в одиночку»).',
    timeLabel: '5 часов назад',
    isoTime: '',
  },
  {
    id: 5,
    type: 'system',
    actor: 'Система',
    text: 'глава 250 («Магическая битва») переведена в статус «Обработка».',
    timeLabel: '6 часов назад',
    isoTime: '',
  },
  {
    id: 6,
    type: 'discussion',
    actor: 'Елена',
    text: 'предложила правку в глоссарии «Магическая битва».',
    quote: '«Domain Expansion — оставить «Расширение территории», как в аниме.»',
    timeLabel: 'вчера',
    isoTime: '',
  },
  {
    id: 7,
    type: 'achievement',
    actor: 'Мария',
    text: 'добавила 3 термина в глоссарий «Поднятие уровня в одиночку».',
    timeLabel: 'вчера',
    isoTime: '',
  },
  {
    id: 8,
    type: 'system',
    actor: 'Система',
    text: 'глава 44 восстановлена из корзины и снова доступна для редактуры.',
    timeLabel: 'вчера',
    isoTime: '',
  },
  {
    id: 9,
    type: 'discussion',
    actor: 'Дмитрий',
    text: 'оставил комментарий к макету главы 191.',
    quote: '«На 12-й странице SFX перекрывает реплику — сдвинуть блок на 8 px.»',
    timeLabel: '2 дня назад',
    isoTime: '',
  },
  {
    id: 10,
    type: 'achievement',
    actor: 'Still Rise',
    text: 'удалил проект «Клинок, рассекающий демонов» — главы перенесены в корзину.',
    timeLabel: '2 дня назад',
    isoTime: '',
  },
  {
    id: 11,
    type: 'system',
    actor: 'Система',
    text: 'глава 46 («Поднятие уровня в одиночку») переведена в статус «Готово».',
    timeLabel: '3 дня назад',
    isoTime: '',
  },
  {
    id: 12,
    type: 'discussion',
    actor: 'Роберт',
    text: 'спросил про формат экспорта для ReManga.',
    quote: '«Отдаём PSD послойно или плоский PNG достаточно?»',
    timeLabel: '3 дня назад',
    isoTime: '',
  },
  {
    id: 13,
    type: 'achievement',
    actor: 'Елена',
    text: 'закрыла вычитку главы 111 («Всеведущий читатель»).',
    timeLabel: '4 дня назад',
    isoTime: '',
  },
  {
    id: 14,
    type: 'system',
    actor: 'Система',
    text: 'резервная копия проектов команды «Студия Still Rise» создана автоматически.',
    timeLabel: '5 дней назад',
    isoTime: '',
  },
  {
    id: 15,
    type: 'achievement',
    actor: 'Мария',
    text: 'опубликовала главу 53 на ReManga («Башня Бога»).',
    timeLabel: '6 дней назад',
    isoTime: '',
  },
]

function ReviewPage({ title = 'Обзор' }) {
  const { soloMode } = usePipeline()
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null)
  const reviewColumns = useReviewAssignmentsTableColumns(soloMode)

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (!openFilterKey) return
      const t = e.target as Node
      const trigger = document.querySelector(`[data-review-queue-dd="${CSS.escape(openFilterKey)}"]`)
      const portalMenu = document.querySelector(`[data-review-queue-portal="${CSS.escape(openFilterKey)}"]`)
      if (trigger?.contains(t) || portalMenu?.contains(t)) return
      setOpenFilterKey(null)
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenFilterKey(null)
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openFilterKey])

  return (
    <div className="chapters-page projects-page review-page">
      <div className="dashboard-toolbar projects-page-toolbar review-page-toolbar">
        <h1>{title}</h1>
        <div className="dashboard-filters chapters-page-filters">
          <DashboardDropdown
            label="Число строк"
            options={pageSizeOptions}
            value={String(pageSize)}
            onChange={(value) => setPageSize(Number(value))}
            ddKey="review-filter|page-size"
            openKey={openFilterKey}
            onOpenChange={setOpenFilterKey}
            stableTriggerWidth
          />
          <TableColumnsDropdown
            columns={reviewColumns.columns}
            isVisible={reviewColumns.isVisible}
            onToggle={reviewColumns.toggleColumn}
            ddKey="review-filter|columns"
            openKey={openFilterKey}
            onOpenChange={setOpenFilterKey}
          />
        </div>
      </div>

      <div className="review-layout">
        <div className="review-main">
          <ReviewDropzone pageSize={pageSize} />
          <ReviewProcessingSection pageSize={pageSize} />
          <ReviewAssignmentsSummary
            pageSize={pageSize}
            isColumnVisible={reviewColumns.isVisible}
            gridTemplate={reviewColumns.gridTemplate}
          />
        </div>
        <aside className="review-aside">
          <ReviewOnlineSidebar members={onlineMock} />
          <ReviewActivityFeed events={feedMock} maxHeight={480} />
        </aside>
      </div>
    </div>
  )
}

export default ReviewPage
