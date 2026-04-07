import { Plus } from 'lucide-react'
import ProjectsTable from '../ProjectsTable'

const projectsData = [
  {
    id: 1,
    name: 'Тайтл 1',
    chapters: 124,
    glossaryHref: '#',
    glossaryLabel: 'Открыть',
    links: [
      { label: 'ОРИГИНАЛ (JP)', href: '#' },
      { label: 'РЕМАНГА', href: '#' },
      { label: 'BK', href: '#' },
    ],
  },
  {
    id: 2,
    name: 'Тайтл 2',
    chapters: 45,
    glossaryHref: '#',
    glossaryLabel: 'Открыть',
    links: [{ label: 'ОРИГИНАЛ (JP)', href: '#' }, { label: 'РЕМАНГА', href: '#' }],
  },
  {
    id: 3,
    name: 'Тайтл 3',
    chapters: 8,
    glossaryHref: '#',
    glossaryLabel: 'Открыть',
    links: [{ label: 'ОРИГИНАЛ (JP)', href: '#' }],
  },
  {
    id: 4,
    name: 'Тайтл 4',
    chapters: 201,
    glossaryHref: '#',
    glossaryLabel: 'Открыть',
    links: [
      { label: 'ОРИГИНАЛ (JP)', href: '#' },
      { label: 'РЕМАНГА', href: '#' },
    ],
  },
]

function ProjectsPage({ title }) {
  return (
    <div className="chapters-page projects-page">
      <div className="dashboard-toolbar projects-page-toolbar">
        <h1>{title}</h1>
        <button type="button" className="dashboard-new-btn">
          <Plus className="projects-add-project-plus" size={18} strokeWidth={2.5} aria-hidden />
          <span>Добавить проект</span>
        </button>
      </div>
      <div className="chapters-panel">
        <ProjectsTable rows={projectsData} />
      </div>
    </div>
  )
}

export default ProjectsPage
