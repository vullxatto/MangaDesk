// @ts-nocheck
import { Pencil } from 'lucide-react'

function ProjectsTable({ rows }) {
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
        <div key={row.id} className="projects-row">
          <span className="projects-name">{row.name}</span>
          <span className="projects-chapters-wrap">
            <span className="projects-chapters-cell">
              <span className="projects-chapters-num">{row.chapters}</span>
            </span>
          </span>
          <span className="projects-glossary">
            <a
              className="projects-link-tag"
              href={row.glossaryHref ?? '#'}
            >
              {row.glossaryLabel ?? 'Открыть'}
            </a>
          </span>
          <span className="projects-links">
            {row.links.map((link, index) => (
              <a
                key={`${row.id}-${index}`}
                className="projects-link-tag"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </span>
          <span className="chapters-actions">
            <button type="button" aria-label="Редактировать проект">
              <Pencil size={15} strokeWidth={1.8} />
            </button>
          </span>
        </div>
      ))}
    </div>
  )
}

export default ProjectsTable
