import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePipeline } from '../../context/usePipeline'
import DashboardDropdown from '../DashboardDropdown'
import StatusBadge from '../StatusBadge'
import TaskSubmitPanel from '../TaskSubmitPanel'

const STATUS_LABEL = {
  ready: 'ГОТОВО',
  ai: 'ОБРАБОТКА',
  edit: 'РЕДАКТУРА',
  upload: 'ЗАГРУЗКА',
  waiting_editor: 'ЖДЁТ РЕДАКТОРА',
  review: 'ПРОВЕРКА',
}

const DEFAULT_TITLE_FILTER = 'all'
const DEFAULT_SORT = 'number-desc'

const sortOptions = [
  { value: 'assigned-desc', label: 'Назначено — новые сверху' },
  { value: 'assigned-asc', label: 'Назначено — старые сверху' },
  { value: 'number-desc', label: 'Номер — по убыванию' },
  { value: 'number-asc', label: 'Номер — по возрастанию' },
]

function TasksPage({ title = 'Задачи' }) {
  const navigate = useNavigate()
  const { editorTasks } = usePipeline()
  const [titleFilter, setTitleFilter] = useState(DEFAULT_TITLE_FILTER)
  const [sortBy, setSortBy] = useState(DEFAULT_SORT)
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null)

  const titleOptions = useMemo(() => {
    const titles = [...new Set(editorTasks.map((task) => task.title))].sort((a, b) => a.localeCompare(b, 'ru'))
    return [{ value: 'all', label: 'Все' }, ...titles.map((title) => ({ value: title, label: title }))]
  }, [editorTasks])

  const filteredTasks = useMemo(() => {
    const filtered = editorTasks.filter((task) => titleFilter === 'all' || task.title === titleFilter)
    return [...filtered].sort((a, b) => {
      if (sortBy === 'assigned-desc') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      if (sortBy === 'assigned-asc') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      if (sortBy === 'number-asc') return a.number - b.number
      return b.number - a.number
    })
  }, [editorTasks, sortBy, titleFilter])

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

  if (editorTasks.length === 0) {
    return (
      <div className="chapters-page projects-page tasks-page">
        <div className="dashboard-toolbar projects-page-toolbar">
          <h1>{title}</h1>
          <div className="projects-page-toolbar-actions">
            <div className="dashboard-filters chapters-page-filters">
              <DashboardDropdown
                label="Тайтл"
                options={titleOptions}
                value={titleFilter}
                onChange={setTitleFilter}
                ddKey="tasks-filter|title"
                openKey={openFilterKey}
                onOpenChange={setOpenFilterKey}
                stableTriggerWidth
                truncateOptionLabels
                disabled
              />
              <DashboardDropdown
                label="Сортировка"
                options={sortOptions}
                value={sortBy}
                onChange={setSortBy}
                ddKey="tasks-filter|sort"
                openKey={openFilterKey}
                onOpenChange={setOpenFilterKey}
                stableTriggerWidth
                disabled
              />
            </div>
          </div>
        </div>
        <div className="chapters-panel article-mini-card tasks-empty-panel">
          <p className="tasks-empty-text">Нет активных задач</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chapters-page projects-page tasks-page">
      <div className="dashboard-toolbar projects-page-toolbar">
        <h1>{title}</h1>
        <div className="projects-page-toolbar-actions">
          <div className="dashboard-filters chapters-page-filters">
            <DashboardDropdown
              label="Тайтл"
              options={titleOptions}
              value={titleFilter}
              onChange={setTitleFilter}
              ddKey="tasks-filter|title"
              openKey={openFilterKey}
              onOpenChange={setOpenFilterKey}
              stableTriggerWidth
              truncateOptionLabels
            />
            <DashboardDropdown
              label="Сортировка"
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              ddKey="tasks-filter|sort"
              openKey={openFilterKey}
              onOpenChange={setOpenFilterKey}
              stableTriggerWidth
            />
          </div>
        </div>
      </div>
      <div className="chapters-panel article-mini-card">
        <div className="chapters-table tasks-table">
          <div className="chapters-row chapters-head chapters-row--tasks">
            <span>Проект / №</span>
            <span>Статус</span>
            <span>Назначено</span>
            <span>Действие</span>
          </div>
          {filteredTasks.map((row) => (
            <div key={row.id} className="tasks-table-block">
              <div className="chapters-row chapters-row--tasks">
                <span className="chapters-title">
                  <span className="chapters-title-main">
                    {row.title} <strong className="chapters-title-number">№ {row.number}</strong>
                  </span>
                </span>
                <span>
                  <StatusBadge
                    statusCode={row.statusCode}
                    status={STATUS_LABEL[row.statusCode] ?? row.statusCode}
                  />
                </span>
                <span className="chapters-date">{row.assignedAt ?? row.date}</span>
              </div>
              <TaskSubmitPanel
                chapterId={row.id}
                reviewFeedback={row.reviewFeedback}
                onOpen={() =>
                  navigate(`/dashboard/chapters/${row.id}/edit`, { state: { fromTasks: true } })
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TasksPage
