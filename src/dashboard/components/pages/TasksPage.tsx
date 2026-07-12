import { Fragment, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCcw, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { PressActionButton } from '../../../components/PressActionButton'
import { usePipeline } from '../../context/usePipeline'
import type { ChapterRow } from '../../pipelineTypes'
import { canReviewChapters } from '../../teamRoles'
import {
  useTasksTableColumns,
  getTaskColumnLabel,
  buildSectionTasksGrid,
  type TasksSectionGridLayout,
} from '../../tableColumns'
import ChapterReviewModal from '../ChapterReviewModal'
import DashboardDropdown from '../DashboardDropdown'
import TableColumnsDropdown from '../TableColumnsDropdown'
import TaskSubmitPanel from '../TaskSubmitPanel'

const DEFAULT_TITLE_FILTER = 'all'
const DEFAULT_SORT = 'number-desc'
const DEFAULT_PAGE_SIZE = 5

const pageSizeOptions = [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '15', label: '15' },
  { value: '20', label: '20' },
]

const editSortOptions = [
  { value: 'assigned-desc', label: 'Назначено — новые сверху' },
  { value: 'assigned-asc', label: 'Назначено — старые сверху' },
  { value: 'number-desc', label: 'Номер — по убыванию' },
  { value: 'number-asc', label: 'Номер — по возрастанию' },
]

const reviewSortOptions = [
  { value: 'assigned-desc', label: 'Отправлено — новые сверху' },
  { value: 'assigned-asc', label: 'Отправлено — старые сверху' },
  { value: 'number-desc', label: 'Номер — по убыванию' },
  { value: 'number-asc', label: 'Номер — по возрастанию' },
]

function taskDateValue(task: ChapterRow, mode: 'edit' | 'review') {
  if (mode === 'review') return new Date(task.date).getTime()
  return new Date(task.assignedAt ?? task.updatedAt).getTime()
}

function sortTasks(tasks: ChapterRow[], sortBy: string, mode: 'edit' | 'review') {
  return [...tasks].sort((a, b) => {
    if (sortBy === 'assigned-desc') return taskDateValue(b, mode) - taskDateValue(a, mode)
    if (sortBy === 'assigned-asc') return taskDateValue(a, mode) - taskDateValue(b, mode)
    if (sortBy === 'number-asc') return a.number - b.number
    return b.number - a.number
  })
}

function buildTitleOptions(tasks: ChapterRow[]) {
  const titles = [...new Set(tasks.map((task) => task.title))].sort((a, b) => a.localeCompare(b, 'ru'))
  return [{ value: 'all', label: 'Все' }, ...titles.map((title) => ({ value: title, label: title }))]
}

function filterAndSortTasks(
  tasks: ChapterRow[],
  titleFilter: string,
  sortBy: string,
  mode: 'edit' | 'review',
) {
  const filtered = tasks.filter((task) => titleFilter === 'all' || task.title === titleFilter)
  return sortTasks(filtered, sortBy, mode)
}

function paginateTasks(tasks: ChapterRow[], pageSize: number, pageIndex: number) {
  const totalPages = Math.max(1, Math.ceil(tasks.length / pageSize))
  const safePageIndex = Math.min(pageIndex, totalPages - 1)
  const start = safePageIndex * pageSize
  return {
    items: tasks.slice(start, start + pageSize),
    totalPages,
    safePageIndex,
  }
}

function TasksPage({ title = 'Задачи' }) {
  const { teams, currentTeamId } = useAuth()
  const { editorTasks, reviewChapter } = usePipeline()
  const editColumns = useTasksTableColumns('edit')
  const reviewColumns = useTasksTableColumns('review')
  const [editTitleFilter, setEditTitleFilter] = useState(DEFAULT_TITLE_FILTER)
  const [editSortBy, setEditSortBy] = useState(DEFAULT_SORT)
  const [editPageSize, setEditPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [editPageIndex, setEditPageIndex] = useState(0)
  const [reviewTitleFilter, setReviewTitleFilter] = useState(DEFAULT_TITLE_FILTER)
  const [reviewSortBy, setReviewSortBy] = useState(DEFAULT_SORT)
  const [reviewPageSize, setReviewPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [reviewPageIndex, setReviewPageIndex] = useState(0)
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null)
  const [rejectChapter, setRejectChapter] = useState<ChapterRow | null>(null)
  const [reviewBusyId, setReviewBusyId] = useState<string | null>(null)

  const canModerateReview = useMemo(() => {
    const team = teams.find((t) => t.id === currentTeamId)
    return canReviewChapters(team?.role)
  }, [teams, currentTeamId])

  const editTasks = useMemo(
    () => editorTasks.filter((task) => task.statusCode === 'edit'),
    [editorTasks],
  )

  const reviewTasks = useMemo(
    () => editorTasks.filter((task) => task.statusCode === 'review'),
    [editorTasks],
  )

  const editTitleOptions = useMemo(() => buildTitleOptions(editTasks), [editTasks])
  const reviewTitleOptions = useMemo(() => buildTitleOptions(reviewTasks), [reviewTasks])

  const filteredEditTasks = useMemo(
    () => filterAndSortTasks(editTasks, editTitleFilter, editSortBy, 'edit'),
    [editTasks, editSortBy, editTitleFilter],
  )

  const filteredReviewTasks = useMemo(
    () => filterAndSortTasks(reviewTasks, reviewTitleFilter, reviewSortBy, 'review'),
    [reviewTasks, reviewSortBy, reviewTitleFilter],
  )

  const editPagination = useMemo(
    () => paginateTasks(filteredEditTasks, editPageSize, editPageIndex),
    [filteredEditTasks, editPageIndex, editPageSize],
  )

  const reviewPagination = useMemo(
    () => paginateTasks(filteredReviewTasks, reviewPageSize, reviewPageIndex),
    [filteredReviewTasks, reviewPageIndex, reviewPageSize],
  )

  useEffect(() => {
    setEditPageIndex(0)
  }, [editTitleFilter, editSortBy, editPageSize, editTasks.length])

  useEffect(() => {
    if (editPageIndex > editPagination.totalPages - 1) {
      setEditPageIndex(Math.max(0, editPagination.totalPages - 1))
    }
  }, [editPageIndex, editPagination.totalPages])

  useEffect(() => {
    setReviewPageIndex(0)
  }, [reviewTitleFilter, reviewSortBy, reviewPageSize, reviewTasks.length])

  useEffect(() => {
    if (reviewPageIndex > reviewPagination.totalPages - 1) {
      setReviewPageIndex(Math.max(0, reviewPagination.totalPages - 1))
    }
  }, [reviewPageIndex, reviewPagination.totalPages])

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

  const filtersDisabled = editorTasks.length === 0

  function handleResetEditFilters() {
    setEditTitleFilter(DEFAULT_TITLE_FILTER)
    setEditSortBy(DEFAULT_SORT)
    setEditPageSize(DEFAULT_PAGE_SIZE)
    setEditPageIndex(0)
    setOpenFilterKey(null)
  }

  function handleResetReviewFilters() {
    setReviewTitleFilter(DEFAULT_TITLE_FILTER)
    setReviewSortBy(DEFAULT_SORT)
    setReviewPageSize(DEFAULT_PAGE_SIZE)
    setReviewPageIndex(0)
    setOpenFilterKey(null)
  }

  function renderTaskRow(
    row: ChapterRow,
    slotEntries: TasksSectionGridLayout['slotEntries'],
    gridLayout: TasksSectionGridLayout,
  ) {
    const editorCell = (
      <span className="chapters-editor">
        {row.editorId ? (
          <>
            <div className="chapters-editor-avatar-wrap">
              <div className="chapters-editor-avatar">
                <img
                  src={`https://picsum.photos/seed/mangadesk-team-${row.editorId}/96/96`}
                  alt=""
                  className="chapters-editor-avatar-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
            <span className="chapters-editor-name">{row.editorName ?? '—'}</span>
          </>
        ) : (
          <>
            <User size={12} strokeWidth={2} aria-hidden />
            <span className="chapters-editor-name">Без редактора</span>
          </>
        )}
      </span>
    )

    function renderTaskColumnCell(columnId: string) {
      if (columnId === 'title') {
        return (
          <span className="chapters-title">
            <span className="chapters-title-main">
              {row.title} <strong className="chapters-title-number">№ {row.number}</strong>
            </span>
          </span>
        )
      }
      if (columnId === 'date') {
        return (
          <span className="chapters-date">
            {row.statusCode === 'review' ? row.date : (row.assignedAt ?? row.date)}
          </span>
        )
      }
      if (columnId === 'translate') {
        return (
          <span className="chapters-translate">
            <Link
              className="review-queue-clear projects-link-tag"
              to={`/dashboard/chapters/${row.id}/edit`}
              state={{ fromTasks: true }}
            >
              Открыть
            </Link>
          </span>
        )
      }
      if (columnId === 'editor') {
        return editorCell
      }
      return null
    }

    return (
      <TaskSubmitPanel
        key={row.id}
        chapterId={row.id}
        chapterTitle={row.title}
        chapterNumber={row.number}
        statusCode={row.statusCode}
        reviewFeedback={row.reviewFeedback}
        canModerateReview={canModerateReview}
        reviewBusyId={reviewBusyId}
        onRejectChapter={() => setRejectChapter(row)}
        onApproveChapter={() => {
          setReviewBusyId(row.id)
          void reviewChapter(row.id, 'approve').finally(() => setReviewBusyId(null))
        }}
        gridTemplate={gridLayout.gridTemplate}
        renderCells={() => (
          <>
            {slotEntries.map((entry) => (
              <Fragment key={entry.columnId}>{renderTaskColumnCell(entry.columnId)}</Fragment>
            ))}
          </>
        )}
      />
    )
  }

  function renderTaskSection({
    headingId,
    title: sectionTitle,
    tasks,
    allTasks,
    dateColumnLabel,
    emptyText,
    titleOptions,
    titleFilter,
    onTitleFilterChange,
    sortOptions,
    sortBy,
    onSortChange,
    pageSize,
    onPageSizeChange,
    onPageIndexChange,
    totalPages,
    safePageIndex,
    columns,
    onResetFilters,
    filterKeyPrefix,
    sectionMode,
  }: {
    headingId: string
    title: string
    tasks: ChapterRow[]
    allTasks: ChapterRow[]
    dateColumnLabel: string
    emptyText: string
    titleOptions: { value: string; label: string }[]
    titleFilter: string
    onTitleFilterChange: (value: string) => void
    sortOptions: { value: string; label: string }[]
    sortBy: string
    onSortChange: (value: string) => void
    pageSize: number
    onPageSizeChange: (value: number) => void
    onPageIndexChange: (value: number | ((prev: number) => number)) => void
    totalPages: number
    safePageIndex: number
    columns: ReturnType<typeof useTasksTableColumns>
    onResetFilters: () => void
    filterKeyPrefix: string
    sectionMode: 'edit' | 'review'
  }) {
    const sectionFiltersDisabled = filtersDisabled || allTasks.length === 0
    const gridLayout = buildSectionTasksGrid(sectionMode, columns.isVisible)
    const rowStyle = { gridTemplateColumns: gridLayout.gridTemplate }

    return (
      <section className="tasks-section" aria-labelledby={headingId}>
        <div className="dashboard-toolbar projects-page-toolbar tasks-section-toolbar">
          <h2 id={headingId} className="tasks-section-title">
            {sectionTitle} ({allTasks.length})
          </h2>
          <div className="projects-page-toolbar-actions">
            <div className="dashboard-filters chapters-page-filters tasks-section-filters">
              <DashboardDropdown
                label="Проект"
                options={titleOptions}
                value={titleFilter}
                onChange={onTitleFilterChange}
                ddKey={`${filterKeyPrefix}|title`}
                openKey={openFilterKey}
                onOpenChange={setOpenFilterKey}
                stableTriggerWidth
                truncateOptionLabels
                disabled={sectionFiltersDisabled}
              />
              <DashboardDropdown
                label="Сортировка"
                options={sortOptions}
                value={sortBy}
                onChange={onSortChange}
                ddKey={`${filterKeyPrefix}|sort`}
                openKey={openFilterKey}
                onOpenChange={setOpenFilterKey}
                stableTriggerWidth
                disabled={sectionFiltersDisabled}
              />
              <DashboardDropdown
                label="Число строк"
                options={pageSizeOptions}
                value={String(pageSize)}
                onChange={(value) => onPageSizeChange(Number(value))}
                ddKey={`${filterKeyPrefix}|page-size`}
                openKey={openFilterKey}
                onOpenChange={setOpenFilterKey}
                stableTriggerWidth
                disabled={sectionFiltersDisabled}
              />
              <TableColumnsDropdown
                columns={columns.columns}
                isVisible={columns.isVisible}
                onToggle={columns.toggleColumn}
                ddKey={`${filterKeyPrefix}|columns`}
                openKey={openFilterKey}
                onOpenChange={setOpenFilterKey}
              />
              <div className="chapters-page-pagination">
                <button
                  type="button"
                  className="review-queue-clear chapters-page-pagination-btn"
                  onClick={() => onPageIndexChange((page) => Math.max(0, page - 1))}
                  disabled={safePageIndex <= 0 || sectionFiltersDisabled}
                  aria-label="Предыдущая страница"
                >
                  <ChevronLeft size={16} strokeWidth={1.8} aria-hidden />
                </button>
                <span className="chapters-page-pagination-label">
                  {safePageIndex + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  className="review-queue-clear chapters-page-pagination-btn"
                  onClick={() => onPageIndexChange((page) => Math.min(totalPages - 1, page + 1))}
                  disabled={safePageIndex >= totalPages - 1 || sectionFiltersDisabled}
                  aria-label="Следующая страница"
                >
                  <ChevronRight size={16} strokeWidth={1.8} aria-hidden />
                </button>
              </div>
            </div>
            <PressActionButton onClick={onResetFilters} disabled={sectionFiltersDisabled}>
              <RefreshCcw className="projects-add-project-plus" size={16} strokeWidth={2.2} aria-hidden />
              <span>Сбросить</span>
            </PressActionButton>
          </div>
        </div>
        <div className="chapters-panel article-mini-card">
          {tasks.length === 0 ? (
            <div className="tasks-empty-panel tasks-empty-panel--section">
              <p className="tasks-empty-text">{emptyText}</p>
            </div>
          ) : (
            <div className="chapters-table tasks-table">
              <div className="chapters-row chapters-head chapters-row--tasks" style={rowStyle}>
                {gridLayout.slotEntries.map((entry) => (
                  <span key={entry.columnId}>
                    {getTaskColumnLabel(entry.columnId, sectionMode, dateColumnLabel)}
                  </span>
                ))}
                <span className="chapters-actions-head" aria-hidden="true" />
              </div>
              {tasks.map((row) =>
                renderTaskRow(row, gridLayout.slotEntries, gridLayout),
              )}
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <div className="chapters-page projects-page tasks-page">
      <div className="dashboard-toolbar projects-page-toolbar">
        <h1>{title}</h1>
      </div>

      {editorTasks.length === 0 ? (
        <div className="chapters-panel article-mini-card tasks-empty-panel">
          <p className="tasks-empty-text">Нет активных задач</p>
        </div>
      ) : (
        <div className="tasks-sections">
          {renderTaskSection({
            headingId: 'tasks-edit-heading',
            title: 'В редактуре',
            tasks: editPagination.items,
            allTasks: editTasks,
            dateColumnLabel: 'Назначено',
            emptyText: 'Сейчас ни одна глава не находится в редактуре.',
            titleOptions: editTitleOptions,
            titleFilter: editTitleFilter,
            onTitleFilterChange: setEditTitleFilter,
            sortOptions: editSortOptions,
            sortBy: editSortBy,
            onSortChange: setEditSortBy,
            pageSize: editPageSize,
            onPageSizeChange: setEditPageSize,
            onPageIndexChange: setEditPageIndex,
            totalPages: editPagination.totalPages,
            safePageIndex: editPagination.safePageIndex,
            columns: editColumns,
            onResetFilters: handleResetEditFilters,
            filterKeyPrefix: 'tasks-edit-filter',
            sectionMode: 'edit',
          })}
          {renderTaskSection({
            headingId: 'tasks-review-heading',
            title: 'Ожидает проверки',
            tasks: reviewPagination.items,
            allTasks: reviewTasks,
            dateColumnLabel: 'Отправлено',
            emptyText: 'Сейчас нет глав, ожидающих проверки.',
            titleOptions: reviewTitleOptions,
            titleFilter: reviewTitleFilter,
            onTitleFilterChange: setReviewTitleFilter,
            sortOptions: reviewSortOptions,
            sortBy: reviewSortBy,
            onSortChange: setReviewSortBy,
            pageSize: reviewPageSize,
            onPageSizeChange: setReviewPageSize,
            onPageIndexChange: setReviewPageIndex,
            totalPages: reviewPagination.totalPages,
            safePageIndex: reviewPagination.safePageIndex,
            columns: reviewColumns,
            onResetFilters: handleResetReviewFilters,
            filterKeyPrefix: 'tasks-review-filter',
            sectionMode: 'review',
          })}
        </div>
      )}
      <ChapterReviewModal
        open={!!rejectChapter}
        chapterLabel={rejectChapter ? `${rejectChapter.title} № ${rejectChapter.number}` : ''}
        onClose={() => setRejectChapter(null)}
        submitting={!!rejectChapter && reviewBusyId === rejectChapter.id}
        onConfirm={async (comment) => {
          if (!rejectChapter) return
          setReviewBusyId(rejectChapter.id)
          try {
            await reviewChapter(rejectChapter.id, 'reject', comment)
            setRejectChapter(null)
          } finally {
            setReviewBusyId(null)
          }
        }}
      />
    </div>
  )
}

export default TasksPage
