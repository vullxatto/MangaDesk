import { usePipeline } from '../../context/PipelineContext'
import StatusBadge from '../StatusBadge'

const STATUS_LABEL = {
  ready: 'ГОТОВО',
  ai: 'ОБРАБОТКА',
  edit: 'РЕДАКТУРА',
  upload: 'ЗАГРУЗКА',
  waiting_editor: 'ЖДЁТ РЕДАКТОРА',
}

function TasksPage({ title = 'Задачи' }) {
  const { editorTasks, completeEditorTask } = usePipeline()

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
      <div className="chapters-panel">
        <div className="chapters-table tasks-table">
          <div className="chapters-row chapters-head chapters-row--tasks">
            <span>Проект / №</span>
            <span>Статус</span>
            <span>Назначено</span>
            <span>Действие</span>
          </div>
          {editorTasks.map((row) => (
            <div key={row.id} className="chapters-row chapters-row--tasks">
              <span className="chapters-title">
                <small>{row.title}</small>
                <strong>№ {row.number}</strong>
              </span>
              <span>
                <StatusBadge
                  statusCode={row.statusCode}
                  status={STATUS_LABEL[row.statusCode] ?? row.statusCode}
                />
              </span>
              <span className="chapters-date">{row.assignedAt ?? row.date}</span>
              <span className="tasks-actions-cell">
                <button type="button" className="projects-link-tag tasks-open-btn">
                  Открыть
                </button>
                <button
                  type="button"
                  className="dashboard-new-btn tasks-complete-btn"
                  onClick={() => completeEditorTask(row.id)}
                >
                  <span>Завершить</span>
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TasksPage
