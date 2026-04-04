import { Clock3, Pencil, RotateCcw } from 'lucide-react'
import StatusBadge from './StatusBadge'

function ChapterTable({ rows }) {
  return (
    <div className="chapters-table">
      <div className="chapters-row chapters-head">
        <span>Проект / №</span>
        <span>Статус</span>
        <span>Дата изменения</span>
        <span>Редактор</span>
        <span className="chapters-actions-head">Действия</span>
      </div>

      {rows.map((row) => (
        <div key={row.id} className="chapters-row">
          <span className="chapters-title">
            <small>{row.title}</small>
            <strong>№ {row.number}</strong>
          </span>
          <span>
            <StatusBadge statusCode={row.statusCode} status={row.status} />
          </span>
          <span className="chapters-date">
            <Clock3 size={12} />
            {row.date}
          </span>
          <span className="chapters-editor">
            <b>{row.editor.slice(-1)}</b>
            {row.editor}
          </span>
          <span className="chapters-actions">
            <button type="button" aria-label="Rollback">
              <RotateCcw size={13} />
            </button>
            <button type="button" aria-label="Edit">
              <Pencil size={13} />
            </button>
          </span>
        </div>
      ))}
    </div>
  )
}

export default ChapterTable
