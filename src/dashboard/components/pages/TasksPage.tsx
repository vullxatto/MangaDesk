import { useNavigate } from 'react-router-dom'
import { usePipeline } from '../../context/usePipeline'
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

function TasksPage({ title = 'Задачи' }) {
  const navigate = useNavigate()
  const { editorTasks } = usePipeline()

  if (editorTasks.length === 0) {
    return (
      <div className="chapters-page projects-page tasks-page">
        <div className="dashboard-placeholder">
          <h2>{title}</h2>
          <p>НЕТ АКТИВНЫХ ЗАДАЧ</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chapters-page projects-page tasks-page">
      <div className="dashboard-toolbar projects-page-toolbar">
        <h1>{title}</h1>
      </div>
      <div className="chapters-panel article-mini-card">
        <div className="chapters-table tasks-table">
          <div className="chapters-row chapters-head chapters-row--tasks">
            <span>Проект / №</span>
            <span>Статус</span>
            <span>Назначено</span>
            <span>Действие</span>
          </div>
          {editorTasks.map((row) => (
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
