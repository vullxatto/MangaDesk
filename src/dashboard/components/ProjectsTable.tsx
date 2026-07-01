import { Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'

export type ProjectRow = {
  projectId: string
  name: string
  chapters: number
  latestChapterId: string | null
  links: { label: string; href: string }[]
}

type ProjectsTableProps = {
  rows: ProjectRow[]
  onEditProject: (row: ProjectRow) => void
  onOpenProjectChapters: (row: ProjectRow) => void
}

function ProjectsTable({ rows, onEditProject, onOpenProjectChapters }: ProjectsTableProps) {
  return (
    <div className="projects-table">
      <div className="projects-row projects-head">
        <span>Название</span>
        <span>Главы</span>
        <span>Глоссарий</span>
        <span>Ссылки</span>
        <span className="chapters-actions-head" aria-hidden="true" />
      </div>

      {rows.map((row) => (
        <div key={row.projectId} className="projects-row">
          <span className="projects-name">{row.name}</span>
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
          <span className="projects-glossary">
            <Link className="review-queue-clear projects-link-tag" to={`/dashboard/projects/${row.projectId}/glossary`}>
              Открыть
            </Link>
          </span>
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
