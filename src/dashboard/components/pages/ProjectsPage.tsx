import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { usePipeline } from '../../context/usePipeline'
import ProjectFormModal from '../ProjectFormModal'
import ProjectsTable, { type ProjectRow } from '../ProjectsTable'

const PROJECT_LINKS: Record<string, { label: string; href: string }[]> = {}

function ProjectsPage({ title }: { title: string }) {
  const { chapters, projects, removeProject } = usePipeline()
  const navigate = useNavigate()
  const [addOpen, setAddOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectRow | null>(null)

  const projectsData = useMemo(
    () =>
      projects.map((p) => {
        const chapterRows = chapters.filter((c) => c.projectId === p.id)
        const latestChapter = chapterRows.reduce(
          (acc, row) => (acc == null || row.number > acc.number ? row : acc),
          null as (typeof chapterRows)[number] | null,
        )
        return {
          projectId: p.id,
          name: p.title,
          chapters: chapterRows.length,
          latestChapterId: latestChapter?.id ?? null,
          links: PROJECT_LINKS[p.id] ?? [{ label: 'ОРИГИНАЛ (JP)', href: '#' }],
        } satisfies ProjectRow
      }),
    [chapters, projects],
  )

  return (
    <div className="chapters-page projects-page">
      <div className="dashboard-toolbar projects-page-toolbar">
        <h1>{title}</h1>
        <button type="button" className="dashboard-new-btn" onClick={() => setAddOpen(true)}>
          <Plus className="projects-add-project-plus" size={18} strokeWidth={2.5} aria-hidden />
          <span>Добавить проект</span>
        </button>
      </div>
      <div className="chapters-panel">
        <ProjectsTable
          rows={projectsData}
          onEditProject={setEditingProject}
          onOpenProjectChapters={(row) => {
            const params = new URLSearchParams({ project: row.name })
            navigate(`/dashboard/chapters?${params.toString()}`)
          }}
        />
      </div>

      <ProjectFormModal open={addOpen} mode="add" onClose={() => setAddOpen(false)} />
      <ProjectFormModal
        open={editingProject !== null}
        mode="edit"
        projectId={editingProject?.projectId}
        initialName={editingProject?.name}
        onDelete={() => {
          if (!editingProject) return
          const ok = window.confirm(`Удалить проект «${editingProject.name}»?`)
          if (!ok) return
          void removeProject(editingProject.projectId).finally(() => setEditingProject(null))
        }}
        onClose={() => setEditingProject(null)}
      />
    </div>
  )
}

export default ProjectsPage
