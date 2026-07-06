import { Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatRuDateTime } from '../projectDates'

export type ProjectRow = {
  projectId: string
  name: string
  chapters: number
  latestChapterId: string | null
  links: { label: string; href: string }[]
  createdAt: string
}

type ProjectsTableProps = {
  rows: ProjectRow[]
  onEditProject: (row: ProjectRow) => void
  onOpenProjectChapters: (row: ProjectRow) => void
  formatCreatedAt?: (value: string) => string
  isColumnVisible: (id: string) => boolean
  gridTemplate: string
}

function ProjectsTable({
  rows,
  onEditProject,
  onOpenProjectChapters,
  formatCreatedAt = formatRuDateTime,
  isColumnVisible,
  gridTemplate,
}: ProjectsTableProps) {
  const rowStyle = { gridTemplateColumns: gridTemplate }

  return (
    <div className="projects-table">
      <div className="projects-row projects-head" style={rowStyle}>
        {isColumnVisible('name') ? <span>Название</span> : null}
        {isColumnVisible('chapters') ? <span>Главы</span> : null}
        {isColumnVisible('glossary') ? <span>Глоссарий</span> : null}
        {isColumnVisible('links') ? <span>Ссылки</span> : null}
        {isColumnVisible('createdAt') ? <span>Дата создания</span> : null}
        <span className="chapters-actions-head" aria-hidden="true" />
      </div>

      {rows.map((row) => (
        <div key={row.projectId} className="projects-row" style={rowStyle}>
          {isColumnVisible('name') ? <span className="projects-name">{row.name}</span> : null}
          {isColumnVisible('chapters') ? (
            <span className="projects-chapters-wrap">
              <button
                type="button"
                className="review-queue-clear projects-chapters-cell projects-chapters-open-btn"
                onClick={() => onOpenProjectChapters(row)}
                aria-label={`Перейти к главам проекта ${row.name}`}
              >
                <span className="projects-chapters-num">{row.chapters}</span>
              </button>
            </span>
          ) : null}
          {isColumnVisible('glossary') ? (
            <span className="projects-glossary">
              <Link className="review-queue-clear projects-link-tag" to={`/dashboard/projects/${row.projectId}/glossary`}>
                Открыть
              </Link>
            </span>
          ) : null}
          {isColumnVisible('links') ? (
            <span className="projects-links">
              {row.links.map((link, index) => (
                <a
                  key={`${row.projectId}-${index}`}
                  className="review-queue-clear projects-link-tag"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              ))}
            </span>
          ) : null}
          {isColumnVisible('createdAt') ? (
            <span className="projects-created-date">{formatCreatedAt(row.createdAt)}</span>
          ) : null}
          <span className="chapters-actions">
            <button
              type="button"
              className="review-queue-clear"
              aria-label="Редактировать проект"
              onClick={() => onEditProject(row)}
            >
              <Pencil size={16} strokeWidth={1.8} aria-hidden />
            </button>
          </span>
        </div>
      ))}
    </div>
  )
}

export default ProjectsTable
