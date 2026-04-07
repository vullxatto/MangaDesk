import { Clock3, CloudDownload, Pencil } from 'lucide-react'
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
            <Clock3 size={13} strokeWidth={1.9} aria-hidden />
            {row.date}
          </span>
          <span className="chapters-editor">
            <b>{row.editor.replace(/\D/g, '') || '—'}</b>
            <span className="chapters-editor-name">{row.editor}</span>
          </span>
          <span className="chapters-actions">
            <button type="button" aria-label="Скачать">
              <CloudDownload size={14} strokeWidth={1.8} />
            </button>
            <button type="button" aria-label="Редактировать">
              <Pencil size={14} strokeWidth={1.8} />
            </button>
          </span>
        </div>
      ))}
    </div>
  )
}

export default ChapterTable
