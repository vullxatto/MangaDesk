import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { PressActionButton } from '../../../components/PressActionButton'
import { usePipeline } from '../../context/usePipeline'
import { getProjectLinks, removeProjectLinks } from '../../projectLinks'
import DashboardDropdown from '../DashboardDropdown'
import ProjectFormModal from '../ProjectFormModal'
import ProjectsTable, { type ProjectRow } from '../ProjectsTable'

const DEFAULT_PAGE_SIZE = 10

const pageSizeOptions = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
]

function ProjectsPage({ title }: { title: string }) {
  const { chapters, projects, removeProject } = usePipeline()
  const navigate = useNavigate()
  const [addOpen, setAddOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectRow | null>(null)
  const [linksVersion, setLinksVersion] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [pageIndex, setPageIndex] = useState(0)
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null)

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
          links: getProjectLinks(p.id),
        } satisfies ProjectRow
      }),
    [chapters, projects, linksVersion],
  )

  const totalPages = Math.max(1, Math.ceil(projectsData.length / pageSize))
  const safePageIndex = Math.min(pageIndex, totalPages - 1)
  const paginatedProjects = useMemo(() => {
    const start = safePageIndex * pageSize
    return projectsData.slice(start, start + pageSize)
  }, [projectsData, pageSize, safePageIndex])

  const showPagination = projectsData.length > pageSize

  useEffect(() => {
    setPageIndex(0)
  }, [pageSize, projectsData.length])

  useEffect(() => {
    if (pageIndex > totalPages - 1) {
      setPageIndex(Math.max(0, totalPages - 1))
    }
  }, [pageIndex, totalPages])

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (!openFilterKey) return
      const t = e.target as Node
      const trigger = document.querySelector(`[data-review-queue-dd="${CSS.escape(openFilterKey)}"]`)
      const portalMenu = document.querySelector(`[data-review-queue-portal="${CSS.escape(openFilterKey)}"]`)
      if (trigger?.contains(t) || portalMenu?.contains(t)) return
      setOpenFilterKey(null)
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenFilterKey(null)
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openFilterKey])

  return (
    <div className="chapters-page projects-page">
      <div className="dashboard-toolbar projects-page-toolbar">
        <h1>{title}</h1>
        <div className="projects-page-toolbar-actions">
          <div className="dashboard-filters chapters-page-filters">
            <DashboardDropdown
              label="На странице"
              options={pageSizeOptions}
              value={String(pageSize)}
              onChange={(value) => setPageSize(Number(value))}
              ddKey="projects-filter|page-size"
              openKey={openFilterKey}
              onOpenChange={setOpenFilterKey}
            />
            {showPagination ? (
              <div className="chapters-page-pagination">
                <button
                  type="button"
                  className="review-queue-clear chapters-page-pagination-btn"
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                  disabled={safePageIndex <= 0}
                  aria-label="Предыдущая страница"
                >
                  <ChevronLeft size={16} strokeWidth={1.8} aria-hidden />
                </button>
                <span className="chapters-page-pagination-label">
                  {safePageIndex + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  className="review-queue-clear chapters-page-pagination-btn"
                  onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={safePageIndex >= totalPages - 1}
                  aria-label="Следующая страница"
                >
                  <ChevronRight size={16} strokeWidth={1.8} aria-hidden />
                </button>
              </div>
            ) : null}
          </div>
          <PressActionButton onClick={() => setAddOpen(true)}>
            <BookPlus className="projects-add-project-plus" size={18} strokeWidth={2.5} aria-hidden />
            <span>Добавить проект</span>
          </PressActionButton>
        </div>
      </div>
      <div className="chapters-panel article-mini-card">
        <ProjectsTable
          rows={paginatedProjects}
          onEditProject={setEditingProject}
          onOpenProjectChapters={(row) => {
            const params = new URLSearchParams({ project: row.name })
            navigate(`/dashboard/chapters?${params.toString()}`)
          }}
        />
      </div>

      <ProjectFormModal
        open={addOpen}
        mode="add"
        onClose={() => setAddOpen(false)}
        onSaved={() => setLinksVersion((v) => v + 1)}
      />
      <ProjectFormModal
        open={editingProject !== null}
        mode="edit"
        projectId={editingProject?.projectId}
        initialName={editingProject?.name}
        initialLinks={editingProject?.links}
        onDelete={() => {
          if (!editingProject) return
          const ok = window.confirm(`Удалить проект «${editingProject.name}»?`)
          if (!ok) return
          void removeProject(editingProject.projectId)
            .then(() => removeProjectLinks(editingProject.projectId))
            .finally(() => {
              setEditingProject(null)
              setLinksVersion((v) => v + 1)
            })
        }}
        onClose={() => setEditingProject(null)}
        onSaved={() => setLinksVersion((v) => v + 1)}
      />
    </div>
  )
}

export default ProjectsPage
