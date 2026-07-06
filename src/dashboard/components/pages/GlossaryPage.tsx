import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { BookOpen, ChevronLeft, ChevronRight, Pencil, Plus } from 'lucide-react'
import { PressActionButton } from '../../../components/PressActionButton'
import { apiGet } from '../../../lib/api'
import { getProjectGlossary } from '../../projectGlossary'
import { usePipeline } from '../../context/usePipeline'
import type { GlossaryEntry } from '../../glossary/glossaryTypes'
import { AddGlossaryEntryModal } from '../AddGlossaryEntryModal'
import DashboardDropdown from '../DashboardDropdown'
import TableColumnsDropdown from '../TableColumnsDropdown'
import { useGlossaryTableColumns } from '../../tableColumns'

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_SORT = 'source-asc'

const pageSizeOptions = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
]

const sortOptions = [
  { value: 'source-asc', label: 'Оригинал А—Я' },
  { value: 'source-desc', label: 'Оригинал Я—А' },
]

function compareGlossarySource(a: GlossaryEntry, b: GlossaryEntry) {
  return a.source.localeCompare(b.source, 'ru', { sensitivity: 'base' })
}

function formatGlossaryChapterNumber(value: number | null | undefined) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return `№ ${value}`
  }
  return '—'
}

type TrashProjectRef = { id: string; title: string }

export default function GlossaryPage() {
  const { projectId: projectIdParam } = useParams<{ projectId: string }>()
  const location = useLocation()
  const locationState = location.state as { projectTitle?: string; fromTrash?: boolean } | null
  const {
    projects,
    glossaryByProjectId,
    loadGlossaryForProject,
    removeGlossaryEntry,
    addGlossaryEntry,
    updateGlossaryEntry,
  } = usePipeline()

  const project = useMemo(
    () => (projectIdParam ? projects.find((p) => p.id === projectIdParam) : undefined),
    [projectIdParam, projects],
  )

  const [deletedProjectTitle, setDeletedProjectTitle] = useState<string | null>(
    locationState?.projectTitle?.trim() || null,
  )
  const [projectResolving, setProjectResolving] = useState(!project && !!projectIdParam && !locationState?.projectTitle)
  const [addOpen, setAddOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<GlossaryEntry | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [pageIndex, setPageIndex] = useState(0)
  const [sortBy, setSortBy] = useState(DEFAULT_SORT)
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null)
  const [glossaryLoading, setGlossaryLoading] = useState(false)
  const [glossaryLoadError, setGlossaryLoadError] = useState<string | null>(null)
  const glossaryColumns = useGlossaryTableColumns()

  const entries = projectIdParam
    ? glossaryByProjectId[projectIdParam] ?? getProjectGlossary(projectIdParam)
    : []

  const sortedEntries = useMemo(() => {
    const rows = [...entries]
    rows.sort((a, b) => {
      if (sortBy === 'source-desc') {
        return compareGlossarySource(b, a)
      }
      return compareGlossarySource(a, b)
    })
    return rows
  }, [entries, sortBy])

  const totalPages = Math.max(1, Math.ceil(sortedEntries.length / pageSize))
  const safePageIndex = Math.min(pageIndex, totalPages - 1)
  const paginatedEntries = useMemo(() => {
    const start = safePageIndex * pageSize
    return sortedEntries.slice(start, start + pageSize)
  }, [sortedEntries, pageSize, safePageIndex])

  useEffect(() => {
    setPageIndex(0)
  }, [pageSize, sortedEntries.length, sortBy])

  useEffect(() => {
    if (pageIndex > totalPages - 1) {
      setPageIndex(Math.max(0, totalPages - 1))
    }
  }, [pageIndex, totalPages])

  const glossaryRowStyle = { gridTemplateColumns: glossaryColumns.gridTemplate }

  useEffect(() => {
    if (!projectIdParam) return
    setGlossaryLoading(true)
    setGlossaryLoadError(null)
    void loadGlossaryForProject(projectIdParam)
      .catch(() => {
        if (getProjectGlossary(projectIdParam).length === 0) {
          setGlossaryLoadError('Не удалось загрузить глоссарий')
        }
      })
      .finally(() => setGlossaryLoading(false))
  }, [projectIdParam, loadGlossaryForProject])

  useEffect(() => {
    if (!projectIdParam || project) {
      setProjectResolving(false)
      return
    }
    if (deletedProjectTitle) {
      setProjectResolving(false)
      return
    }

    let cancelled = false
    setProjectResolving(true)
    void apiGet<{ projects: TrashProjectRef[] }>('/trash')
      .then((data) => {
        if (cancelled) return
        const found = data.projects.find((p) => p.id === projectIdParam)
        setDeletedProjectTitle(found?.title ?? null)
      })
      .catch(() => {
        if (!cancelled) setDeletedProjectTitle(null)
      })
      .finally(() => {
        if (!cancelled) setProjectResolving(false)
      })

    return () => {
      cancelled = true
    }
  }, [deletedProjectTitle, project, projectIdParam])

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

  const projectTitle = project?.title ?? deletedProjectTitle

  if (!projectIdParam) {
    return <Navigate to="/dashboard/projects" replace />
  }

  if (projectResolving) {
    return (
      <div className="chapters-page projects-page glossary-page">
        <div className="chapters-panel article-mini-card">
          <p className="glossary-empty">Загрузка…</p>
        </div>
      </div>
    )
  }

  if (!projectTitle) {
    return <Navigate to="/dashboard/projects" replace />
  }

  return (
    <div className="chapters-page projects-page glossary-page">
      <div className="dashboard-toolbar projects-page-toolbar glossary-page-toolbar">
        <div className="glossary-page-heading">
          <h1>
            <BookOpen className="glossary-page-title-icon" size={22} strokeWidth={2} aria-hidden />
            <span className="glossary-page-title-text">Глоссарий: {projectTitle}</span>
          </h1>
        </div>
        <div className="projects-page-toolbar-actions">
          <div className="dashboard-filters chapters-page-filters">
            <DashboardDropdown
              label="Сортировка"
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              ddKey="glossary-filter|sort"
              openKey={openFilterKey}
              onOpenChange={setOpenFilterKey}
              stableTriggerWidth
            />
            <DashboardDropdown
              label="Число строк"
              options={pageSizeOptions}
              value={String(pageSize)}
              onChange={(value) => setPageSize(Number(value))}
              ddKey="glossary-filter|page-size"
              openKey={openFilterKey}
              onOpenChange={setOpenFilterKey}
              stableTriggerWidth
            />
            <TableColumnsDropdown
              columns={glossaryColumns.columns}
              isVisible={glossaryColumns.isVisible}
              onToggle={glossaryColumns.toggleColumn}
              ddKey="glossary-filter|columns"
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
          <PressActionButton
            onClick={() => {
              setFormKey((n) => n + 1)
              setEditingEntry(null)
              setAddOpen(true)
            }}
          >
            <Plus className="projects-add-project-plus" size={18} strokeWidth={2.5} aria-hidden />
            <span>Добавить термин</span>
          </PressActionButton>
        </div>
      </div>

      <div className="chapters-panel article-mini-card">
        <div className="glossary-table">
          <div className="glossary-table-row glossary-table-row--head" style={glossaryRowStyle}>
            {glossaryColumns.isVisible('source') ? <span>Оригинал</span> : null}
            {glossaryColumns.isVisible('target') ? <span>Перевод</span> : null}
            {glossaryColumns.isVisible('chapterNumber') ? <span>Глава добавления</span> : null}
            <span className="glossary-table-actions-head" aria-hidden />
          </div>
          {glossaryLoading && entries.length === 0 ? (
            <div className="glossary-table-empty">
              <p className="glossary-empty">Загрузка…</p>
            </div>
          ) : glossaryLoadError && entries.length === 0 ? (
            <div className="glossary-table-empty">
              <p className="glossary-empty">{glossaryLoadError}</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="glossary-table-empty">
              <p className="glossary-empty">Термины отсутствуют. Добавьте вручную или из редактора главы.</p>
            </div>
          ) : (
            paginatedEntries.map((e) => (
              <div key={e.id} className="glossary-table-row" style={glossaryRowStyle}>
                {glossaryColumns.isVisible('source') ? (
                  <span className="glossary-table-cell glossary-table-cell--source">{e.source}</span>
                ) : null}
                {glossaryColumns.isVisible('target') ? (
                  <span className="glossary-table-cell glossary-table-cell--target">{e.target}</span>
                ) : null}
                {glossaryColumns.isVisible('chapterNumber') ? (
                  <span className="glossary-table-cell glossary-table-cell--chapter">
                    {formatGlossaryChapterNumber(e.chapterNumber)}
                  </span>
                ) : null}
                <span className="glossary-table-actions">
                  <button
                    type="button"
                    className="review-queue-clear"
                    aria-label="Редактировать термин"
                    onClick={() => {
                      setFormKey((n) => n + 1)
                      setEditingEntry(e)
                      setAddOpen(true)
                    }}
                  >
                    <Pencil size={16} strokeWidth={2} aria-hidden />
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <AddGlossaryEntryModal
        key={formKey}
        open={addOpen}
        mode={editingEntry ? 'edit' : 'add'}
        projectLabel={projectTitle}
        initialSource={editingEntry?.source ?? ''}
        initialTarget={editingEntry?.target ?? ''}
        onClose={() => {
          setAddOpen(false)
          setEditingEntry(null)
        }}
        onDelete={() => {
          if (!editingEntry) return
          void removeGlossaryEntry(projectIdParam, editingEntry.id)
          setAddOpen(false)
          setEditingEntry(null)
        }}
        onSubmit={(source, target) => {
          if (editingEntry) {
            void updateGlossaryEntry(projectIdParam, editingEntry.id, { source, target })
          } else {
            void addGlossaryEntry(projectIdParam, { source, target })
          }
        }}
      />
    </div>
  )
}
