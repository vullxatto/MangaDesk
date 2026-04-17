// @ts-nocheck
import { ChevronDown, CloudDownload, Pencil } from 'lucide-react'
import { TEAM_MEMBERS } from '../context/pipelineConstants'
import { usePipeline } from '../context/PipelineContext'
import StatusBadge from './StatusBadge'

const STATUS_LABEL = {
  ready: 'ГОТОВО',
  ai: 'ОБРАБОТКА',
  edit: 'РЕДАКТУРА',
  upload: 'ЗАГРУЗКА',
  waiting_editor: 'ЖДЁТ РЕДАКТОРА',
}

function editorInitial(name) {
  if (!name || !name.trim()) return '—'
  return name.trim().charAt(0).toUpperCase()
}

function AssignEditorControl({ assignMenuKey, rowId, onAssignMenuKey, onPick }) {
  const open = assignMenuKey === rowId
  return (
    <div className={`dashboard-dropdown chapters-assign-dropdown ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="dashboard-filter-btn chapters-assign-btn"
        onClick={(e) => {
          e.stopPropagation()
          onAssignMenuKey((k) => (k === rowId ? null : rowId))
        }}
        aria-expanded={open}
      >
        <span className="dashboard-filter-btn-text">
          <span className="dashboard-filter-btn-value">Назначить</span>
        </span>
        <ChevronDown size={12} className="dashboard-filter-chevron" strokeWidth={2.25} />
      </button>
      {open ? (
        <div className="dashboard-dropdown-menu chapters-assign-menu">
          {TEAM_MEMBERS.map((m) => (
            <button
              key={m.id}
              type="button"
              className="dashboard-dropdown-item"
              onClick={() => {
                onPick(m.id)
                onAssignMenuKey(null)
              }}
            >
              {m.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ChapterTable({ rows, assignMenuKey, onAssignMenuKey: setAssignMenuKey }) {
  const { soloMode, assignEditor, selectedWaitingIds, toggleWaitingSelected } = usePipeline()

  return (
    <div className="chapters-table">
      <div
        className={`chapters-row chapters-head ${soloMode ? 'chapters-row--solo' : 'chapters-row--with-select'}`}
      >
        {!soloMode ? <span className="chapters-select-head" aria-hidden="true" /> : null}
        <span>Проект / №</span>
        <span>Статус</span>
        <span>Дата изменения</span>
        {!soloMode ? <span>Редактор</span> : null}
        <span className="chapters-actions-head" aria-hidden="true" />
      </div>

      {rows.map((row) => {
        const label = STATUS_LABEL[row.statusCode] ?? row.status
        const showCheckbox = !soloMode && row.statusCode === 'waiting_editor'
        const checked = selectedWaitingIds.has(row.id)

        return (
          <div
            key={row.id}
            className={`chapters-row ${soloMode ? 'chapters-row--solo' : 'chapters-row--with-select'}`}
          >
            {!soloMode ? (
              <span className="chapters-select-cell">
                {showCheckbox ? (
                  <input
                    type="checkbox"
                    className="chapters-select-checkbox"
                    checked={checked}
                    onChange={() => toggleWaitingSelected(row.id)}
                    aria-label={`Выбрать главу № ${row.number}`}
                  />
                ) : null}
              </span>
            ) : null}
            <span className="chapters-title">
              <small>{row.title}</small>
              <strong>№ {row.number}</strong>
            </span>
            <span>
              <StatusBadge statusCode={row.statusCode} status={label} />
            </span>
            <span className="chapters-date">{row.date}</span>
            {!soloMode ? (
              <span className="chapters-editor">
                {row.statusCode === 'waiting_editor' ? (
                  <AssignEditorControl
                    assignMenuKey={assignMenuKey}
                    rowId={row.id}
                    onAssignMenuKey={setAssignMenuKey}
                    onPick={(editorId) => assignEditor([row.id], editorId)}
                  />
                ) : (
                  <>
                    <b>{editorInitial(row.editorName)}</b>
                    <span className="chapters-editor-name">{row.editorName ?? '—'}</span>
                  </>
                )}
              </span>
            ) : null}
            <span className="chapters-actions">
              {row.statusCode === 'ready' ? (
                <button
                  type="button"
                  className="team-card-details-btn chapters-row-download"
                  aria-label={`Скачать главу ${row.title}, № ${row.number}`}
                >
                  <CloudDownload size={16} strokeWidth={2} aria-hidden />
                  <span>Скачать</span>
                </button>
              ) : null}
              <button type="button" aria-label="Редактировать">
                <Pencil size={15} strokeWidth={1.8} />
              </button>
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default ChapterTable
