import { Plus } from 'lucide-react'
import ProjectsTable from '../ProjectsTable'

const projectsData = [
  {
    id: 1,
    name: 'Атака титанов',
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
    name: 'Клинок, рассекающий демонов',
    chapters: 201,
    glossaryHref: '#',
    glossaryLabel: 'Открыть',
    links: [{ label: 'ОРИГИНАЛ (JP)', href: '#' }, { label: 'РЕМАНГА', href: '#' }],
  },
  {
    id: 3,
    name: 'Человек-бензопила',
    chapters: 8,
    glossaryHref: '#',
    glossaryLabel: 'Открыть',
    links: [{ label: 'ОРИГИНАЛ (JP)', href: '#' }],
  },
  {
    id: 4,
    name: 'Ванпанчмен',
    chapters: 45,
    glossaryHref: '#',
    glossaryLabel: 'Открыть',
    links: [
      { label: 'ОРИГИНАЛ (JP)', href: '#' },
      { label: 'РЕМАНГА', href: '#' },
    ],
  },
  {
    id: 5,
    name: 'Наруто',
    chapters: 700,
    glossaryHref: '#',
    glossaryLabel: 'Открыть',
    links: [{ label: 'ОРИГИНАЛ (JP)', href: '#' }],
  },
  {
    id: 6,
    name: 'Тетрадь смерти',
    chapters: 108,
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
