import { ChevronDown, CloudDownload, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePipeline } from '../context/usePipeline'
import type { ChapterRow } from '../pipelineTypes'
import StatusBadge from './StatusBadge'

const STATUS_LABEL = {
  ready: 'ГОТОВО',
  ai: 'ОБРАБОТКА',
  edit: 'РЕДАКТУРА',
  upload: 'ЗАГРУЗКА',
  waiting_editor: 'ЖДЁТ РЕДАКТОРА',
}

function editorInitial(name: string | null | undefined) {
  if (!name || !name.trim()) return '—'
  return name.trim().charAt(0).toUpperCase()
}

function AssignEditorControl({
  assignMenuKey,
  rowId,
  onAssignMenuKey,
  onPick,
  teamMembers,
}: {
  assignMenuKey: string | null
  rowId: string
  onAssignMenuKey: (key: string | null | ((prev: string | null) => string | null)) => void
  onPick: (editorId: string) => void
  teamMembers: { id: string; name: string }[]
}) {
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
          {teamMembers.map((m) => (
            <button
              key={m.id}
              type="button"
              className="dashboard-dropdown-item"
              onClick={() => {
                void onPick(m.id)
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

function ChapterTable({
  rows,
  assignMenuKey,
  onAssignMenuKey: setAssignMenuKey,
  onOpenMetadataModal,
}: {
  rows: ChapterRow[]
  assignMenuKey: string | null
  onAssignMenuKey: (key: string | null | ((prev: string | null) => string | null)) => void
  onOpenMetadataModal: (chapterId: string) => void
}) {
  const navigate = useNavigate()
  const { soloMode, assignEditor, selectedWaitingIds, toggleWaitingSelected, teamMembers } = usePipeline()

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
        const label = STATUS_LABEL[row.statusCode] ?? row.statusCode
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
              <strong>
                № {row.number} {row.restoredFromTrash ? '(восстановленная)' : ''}
              </strong>
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
                    onPick={(editorId) => void assignEditor([row.id], editorId)}
                    teamMembers={teamMembers}
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
                  className="chapters-row-icon-btn chapters-row-download-icon"
                  aria-label={`Скачать главу ${row.title}, № ${row.number}`}
                >
                  <CloudDownload size={16} strokeWidth={2} aria-hidden />
                </button>
              ) : null}
              <button
                type="button"
                className="dashboard-reset-btn chapters-row-translate"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/dashboard/chapters/${row.id}/edit`)
                }}
              >
                Перевод
              </button>
              <button
                type="button"
                className="chapters-row-icon-btn chapters-row-edit-icon"
                aria-label={`Изменить проект и номер: ${row.title}, № ${row.number}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenMetadataModal(row.id)
                }}
              >
                <Pencil size={16} strokeWidth={1.8} aria-hidden />
              </button>
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default ChapterTable
