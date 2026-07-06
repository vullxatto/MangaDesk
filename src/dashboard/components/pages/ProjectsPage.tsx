import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { PressActionButton } from '../../../components/PressActionButton'
import { usePipeline } from '../../context/usePipeline'
import { getProjectLinks } from '../../projectLinks'
import DashboardDropdown from '../DashboardDropdown'
import ProjectFormModal from '../ProjectFormModal'
import ProjectsTable, { type ProjectRow } from '../ProjectsTable'
import TableColumnsDropdown from '../TableColumnsDropdown'
import { useProjectsTableColumns } from '../../tableColumns'

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_SORT = 'date-desc'

const pageSizeOptions = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
]

const projectsSortOptions = [
  { value: 'date-desc', label: 'Дата создания — новые сверху' },
  { value: 'date-asc', label: 'Дата создания — старые сверху' },
  { value: 'title-asc', label: 'Название — А—Я' },
  { value: 'title-desc', label: 'Название — Я—А' },
]

function parseProjectDate(value: string) {
  return new Date(value).getTime()
}

function ProjectsPage({ title }: { title: string }) {
  const { chapters, projects, removeProject } = usePipeline()
  const navigate = useNavigate()
  const [addOpen, setAddOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectRow | null>(null)
  const [linksVersion, setLinksVersion] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [pageIndex, setPageIndex] = useState(0)
  const [sortBy, setSortBy] = useState(DEFAULT_SORT)
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null)
  const projectsColumns = useProjectsTableColumns()

  const projectsData = useMemo(() => {
    const rows = projects.map((p) => {
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
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }
    })

    return [...rows].sort((a, b) => {
      if (sortBy === 'date-desc') {
        return parseProjectDate(b.createdAt) - parseProjectDate(a.createdAt)
      }
      if (sortBy === 'date-asc') {
        return parseProjectDate(a.createdAt) - parseProjectDate(b.createdAt)
      }
      if (sortBy === 'title-asc') {
        return a.name.localeCompare(b.name, 'ru')
      }
      if (sortBy === 'title-desc') {
        return b.name.localeCompare(a.name, 'ru')
      }
      return 0
    })
  }, [chapters, projects, linksVersion, sortBy])

  const totalPages = Math.max(1, Math.ceil(projectsData.length / pageSize))
  const safePageIndex = Math.min(pageIndex, totalPages - 1)
  const paginatedProjects = useMemo(() => {
    const start = safePageIndex * pageSize
    return projectsData.slice(start, start + pageSize)
  }, [projectsData, pageSize, safePageIndex])

  useEffect(() => {
    setPageIndex(0)
  }, [pageSize, projectsData.length, sortBy])

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
              label="Сортировка"
              options={projectsSortOptions}
              value={sortBy}
              onChange={setSortBy}
              ddKey="projects-filter|sort"
              openKey={openFilterKey}
              onOpenChange={setOpenFilterKey}
              stableTriggerWidth
            />
            <DashboardDropdown
              label="Число строк"
              options={pageSizeOptions}
              value={String(pageSize)}
              onChange={(value) => setPageSize(Number(value))}
              ddKey="projects-filter|page-size"
              openKey={openFilterKey}
              onOpenChange={setOpenFilterKey}
              stableTriggerWidth
            />
            <TableColumnsDropdown
              columns={projectsColumns.columns}
              isVisible={projectsColumns.isVisible}
              onToggle={projectsColumns.toggleColumn}
              ddKey="projects-filter|columns"
              openKey={openFilterKey}
              onOpenChange={setOpenFilterKey}
            />
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
          isColumnVisible={projectsColumns.isVisible}
          gridTemplate={projectsColumns.gridTemplate}
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
          void removeProject(editingProject.projectId).finally(() => {
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
