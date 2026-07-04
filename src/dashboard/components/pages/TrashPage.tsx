import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, RefreshCcw, Undo2 } from 'lucide-react'
import { PressActionButton } from '../../../components/PressActionButton'
import { apiGet, apiPostJson } from '../../../lib/api'
import { usePipeline } from '../../context/usePipeline'
import { getProjectLinks } from '../../projectLinks'
import { formatRuDateTime, resolveItemCreatedAt, resolveItemUpdatedAt, resolveProjectCreatedAt } from '../../projectDates'
import DashboardDropdown from '../DashboardDropdown'
import StatusBadge from '../StatusBadge'

type TrashProject = {
  id: string
  title: string
  created_at: string
  deleted_at: string
  chapters_count: number
}

type TrashChapter = {
  id: string
  project_id: string
  project_title: string
  chapter_number: number
  chapter_title: string | null
  status_code: string
  editor_id: string | null
  editor_name: string | null
  created_at: string
  updated_at: string
  deleted_at: string
  restored_from_trash: boolean
}

type TrashResponse = {
  projects: TrashProject[]
  chapters: TrashChapter[]
}

type TrashView = 'projects' | 'chapters'

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_PROJECTS_SORT = 'deleted-desc'
const DEFAULT_CHAPTERS_TITLE_FILTER = 'all'
const DEFAULT_CHAPTERS_STATUS_FILTER = 'all'
const DEFAULT_CHAPTERS_SORT = 'deleted-desc'

const pageSizeOptions = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
]

const projectsSortOptions = [
  { value: 'deleted-desc', label: 'Дата удаления — новые сверху' },
  { value: 'deleted-asc', label: 'Дата удаления — старые сверху' },
  { value: 'created-desc', label: 'Дата создания — новые сверху' },
  { value: 'created-asc', label: 'Дата создания — старые сверху' },
  { value: 'title-asc', label: 'Название — А—Я' },
  { value: 'title-desc', label: 'Название — Я—А' },
]

const chaptersSortOptions = [
  { value: 'deleted-desc', label: 'Дата удаления — новые сверху' },
  { value: 'deleted-asc', label: 'Дата удаления — старые сверху' },
  { value: 'updated-desc', label: 'Дата изменения — новые сверху' },
  { value: 'updated-asc', label: 'Дата изменения — старые сверху' },
  { value: 'created-desc', label: 'Дата создания — новые сверху' },
  { value: 'created-asc', label: 'Дата создания — старые сверху' },
  { value: 'number-desc', label: 'Номер — по убыванию' },
  { value: 'number-asc', label: 'Номер — по возрастанию' },
]

const chaptersStatusOptions = [
  { value: 'all', label: 'Все' },
  { value: 'ready', label: 'Готово' },
  { value: 'waiting_editor', label: 'Ждёт редактора' },
  { value: 'ai', label: 'Обработка' },
  { value: 'edit', label: 'Редактура' },
  { value: 'upload', label: 'Загрузка' },
]

const STATUS_LABEL: Record<string, string> = {
  ready: 'ГОТОВО',
  ai: 'ОБРАБОТКА',
  edit: 'РЕДАКТУРА',
  upload: 'ЗАГРУЗКА',
  waiting_editor: 'ЖДЁТ РЕДАКТОРА',
}

function formatDeletedAt(value: string) {
  return formatRuDateTime(value)
}

function parseTrashDate(value: string) {
  return new Date(value).getTime()
}

function TrashTableSection({
  emptyLabel,
  children,
}: {
  emptyLabel: string
  children: ReactNode
}) {
  return (
    <div className="chapters-panel article-mini-card">
      {children ?? <p className="trash-section-empty">{emptyLabel}</p>}
    </div>
  )
}

export default function TrashPage({ title = 'Удалённое' }: { title?: string }) {
  const { refreshDashboard, soloMode } = usePipeline()
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState<TrashResponse>({ projects: [], chapters: [] })
  const [loading, setLoading] = useState(true)
  const [restoreProjectId, setRestoreProjectId] = useState<string | null>(null)
  const [view, setView] = useState<TrashView>('projects')
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null)

  const [projectsSort, setProjectsSort] = useState(DEFAULT_PROJECTS_SORT)
  const [projectsPageSize, setProjectsPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [projectsPageIndex, setProjectsPageIndex] = useState(0)

  const [chaptersTitleFilter, setChaptersTitleFilter] = useState(DEFAULT_CHAPTERS_TITLE_FILTER)
  const [chaptersStatusFilter, setChaptersStatusFilter] = useState(DEFAULT_CHAPTERS_STATUS_FILTER)
  const [chaptersSort, setChaptersSort] = useState(DEFAULT_CHAPTERS_SORT)
  const [chaptersPageSize, setChaptersPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [chaptersPageIndex, setChaptersPageIndex] = useState(0)

  const loadTrash = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<TrashResponse>('/trash')
      setItems(data)
    } catch (e) {
      console.error(e)
      setItems({ projects: [], chapters: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTrash()
  }, [loadTrash])

  useEffect(() => {
    const viewParam = searchParams.get('view')
    if (viewParam === 'chapters') {
      setView('chapters')
    } else if (viewParam === 'projects') {
      setView('projects')
    }

    const projectName = searchParams.get('project')?.trim() ?? ''
    if (projectName) {
      setChaptersTitleFilter(projectName)
    }
  }, [searchParams])

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

  const chaptersTitleOptions = useMemo(() => {
    const titles = [...new Set(items.chapters.map((c) => c.project_title))].sort((a, b) =>
      a.localeCompare(b, 'ru'),
    )
    return [{ value: 'all', label: 'Все' }, ...titles.map((t) => ({ value: t, label: t }))]
  }, [items.chapters])

  const deletedChaptersCountByProjectId = useMemo(() => {
    const counts = new Map<string, number>()
    for (const chapter of items.chapters) {
      counts.set(chapter.project_id, (counts.get(chapter.project_id) ?? 0) + 1)
    }
    return counts
  }, [items.chapters])

  function getDeletedProjectChaptersCount(project: TrashProject) {
    return deletedChaptersCountByProjectId.get(project.id) ?? project.chapters_count ?? 0
  }

  const sortedProjects = useMemo(() => {
    const rows = [...items.projects]
    rows.sort((a, b) => {
      if (projectsSort === 'deleted-desc') {
        return parseTrashDate(b.deleted_at) - parseTrashDate(a.deleted_at)
      }
      if (projectsSort === 'deleted-asc') {
        return parseTrashDate(a.deleted_at) - parseTrashDate(b.deleted_at)
      }
      if (projectsSort === 'created-desc') {
        return (
          parseTrashDate(resolveProjectCreatedAt(b.id, b.created_at)) -
          parseTrashDate(resolveProjectCreatedAt(a.id, a.created_at))
        )
      }
      if (projectsSort === 'created-asc') {
        return (
          parseTrashDate(resolveProjectCreatedAt(a.id, a.created_at)) -
          parseTrashDate(resolveProjectCreatedAt(b.id, b.created_at))
        )
      }
      if (projectsSort === 'title-asc') {
        return a.title.localeCompare(b.title, 'ru')
      }
      if (projectsSort === 'title-desc') {
        return b.title.localeCompare(a.title, 'ru')
      }
      return 0
    })
    return rows
  }, [items.projects, projectsSort])

  const filteredChapters = useMemo(() => {
    const filtered = items.chapters.filter((row) => {
      const byTitle = chaptersTitleFilter === 'all' || row.project_title === chaptersTitleFilter
      const byStatus = chaptersStatusFilter === 'all' || row.status_code === chaptersStatusFilter
      return byTitle && byStatus
    })

    return [...filtered].sort((a, b) => {
      if (chaptersSort === 'deleted-desc') {
        return parseTrashDate(b.deleted_at) - parseTrashDate(a.deleted_at)
      }
      if (chaptersSort === 'deleted-asc') {
        return parseTrashDate(a.deleted_at) - parseTrashDate(b.deleted_at)
      }
      if (chaptersSort === 'created-desc') {
        return (
          parseTrashDate(resolveItemCreatedAt(b.id, b.created_at)) -
          parseTrashDate(resolveItemCreatedAt(a.id, a.created_at))
        )
      }
      if (chaptersSort === 'created-asc') {
        return (
          parseTrashDate(resolveItemCreatedAt(a.id, a.created_at)) -
          parseTrashDate(resolveItemCreatedAt(b.id, b.created_at))
        )
      }
      if (chaptersSort === 'updated-desc') {
        return (
          parseTrashDate(resolveItemUpdatedAt(b.id, b.updated_at, b.created_at)) -
          parseTrashDate(resolveItemUpdatedAt(a.id, a.updated_at, a.created_at))
        )
      }
      if (chaptersSort === 'updated-asc') {
        return (
          parseTrashDate(resolveItemUpdatedAt(a.id, a.updated_at, a.created_at)) -
          parseTrashDate(resolveItemUpdatedAt(b.id, b.updated_at, b.created_at))
        )
      }
      if (chaptersSort === 'number-desc') {
        return b.chapter_number - a.chapter_number
      }
      if (chaptersSort === 'number-asc') {
        return a.chapter_number - b.chapter_number
      }
      return 0
    })
  }, [chaptersSort, chaptersStatusFilter, chaptersTitleFilter, items.chapters])

  const projectsTotalPages = Math.max(1, Math.ceil(sortedProjects.length / projectsPageSize))
  const projectsSafePageIndex = Math.min(projectsPageIndex, projectsTotalPages - 1)
  const paginatedProjects = useMemo(() => {
    const start = projectsSafePageIndex * projectsPageSize
    return sortedProjects.slice(start, start + projectsPageSize)
  }, [projectsPageSize, projectsSafePageIndex, sortedProjects])

  const chaptersTotalPages = Math.max(1, Math.ceil(filteredChapters.length / chaptersPageSize))
  const chaptersSafePageIndex = Math.min(chaptersPageIndex, chaptersTotalPages - 1)
  const paginatedChapters = useMemo(() => {
    const start = chaptersSafePageIndex * chaptersPageSize
    return filteredChapters.slice(start, start + chaptersPageSize)
  }, [chaptersPageSize, chaptersSafePageIndex, filteredChapters])

  useEffect(() => {
    setProjectsPageIndex(0)
  }, [projectsSort, projectsPageSize, sortedProjects.length])

  useEffect(() => {
    if (projectsPageIndex > projectsTotalPages - 1) {
      setProjectsPageIndex(Math.max(0, projectsTotalPages - 1))
    }
  }, [projectsPageIndex, projectsTotalPages])

  useEffect(() => {
    setChaptersPageIndex(0)
  }, [chaptersStatusFilter, chaptersTitleFilter, chaptersSort, chaptersPageSize, filteredChapters.length])

  useEffect(() => {
    if (chaptersPageIndex > chaptersTotalPages - 1) {
      setChaptersPageIndex(Math.max(0, chaptersTotalPages - 1))
    }
  }, [chaptersPageIndex, chaptersTotalPages])

  async function restoreChapter(id: string) {
    try {
      await apiPostJson(`/chapters/${id}/restore`, {})
      await Promise.all([loadTrash(), refreshDashboard()])
    } catch (e) {
      console.error(e)
    }
  }

  async function restoreProject(id: string, withChapters: boolean) {
    try {
      await apiPostJson(`/projects/${id}/restore`, { restore_chapters: withChapters })
      setRestoreProjectId(null)
      await Promise.all([loadTrash(), refreshDashboard()])
    } catch (e) {
      console.error(e)
    }
  }

  function setTrashView(next: TrashView, projectTitle?: string) {
    setView(next)
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        params.set('view', next)
        if (next === 'projects') {
          params.delete('project')
        } else if (projectTitle) {
          params.set('project', projectTitle)
        }
        return params
      },
      { replace: true },
    )
    setOpenFilterKey(null)
  }

  function handleResetProjectsFilters() {
    setProjectsSort(DEFAULT_PROJECTS_SORT)
    setProjectsPageSize(DEFAULT_PAGE_SIZE)
    setProjectsPageIndex(0)
    setOpenFilterKey(null)
  }

  function handleResetChaptersFilters() {
    setChaptersTitleFilter(DEFAULT_CHAPTERS_TITLE_FILTER)
    setChaptersStatusFilter(DEFAULT_CHAPTERS_STATUS_FILTER)
    setChaptersSort(DEFAULT_CHAPTERS_SORT)
    setChaptersPageSize(DEFAULT_PAGE_SIZE)
    setChaptersPageIndex(0)
    setOpenFilterKey(null)
  }

  function openDeletedProjectChapters(projectTitle: string) {
    setChaptersTitleFilter(projectTitle)
    setChaptersSort('deleted-desc')
    setChaptersPageIndex(0)
    setTrashView('chapters', projectTitle)
  }

  const selectedProject = items.projects.find((p) => p.id === restoreProjectId) ?? null
  const isEmpty = !loading && items.projects.length === 0 && items.chapters.length === 0
  const showProjects = view === 'projects'
  const showChapters = view === 'chapters'

  return (
    <div className="chapters-page projects-page trash-page">
      <div className="dashboard-toolbar projects-page-toolbar">
        <h1>{title}</h1>
        {!loading && !isEmpty ? (
          <div className="projects-page-toolbar-actions trash-page-toolbar-actions">
            <div className="trash-view-switch" role="tablist" aria-label="Тип удалённых элементов">
              <button
                type="button"
                role="tab"
                className={`trash-view-switch-btn${showProjects ? ' is-active' : ''}`}
                aria-selected={showProjects}
                onClick={() => setTrashView('projects')}
              >
                Удалённые проекты
              </button>
              <button
                type="button"
                role="tab"
                className={`trash-view-switch-btn${showChapters ? ' is-active' : ''}`}
                aria-selected={showChapters}
                onClick={() => setTrashView('chapters')}
              >
                Удалённые главы
              </button>
            </div>
            <div className="dashboard-filters chapters-page-filters">
              {showProjects ? (
                <>
                  <DashboardDropdown
                    label="Сортировка"
                    options={projectsSortOptions}
                    value={projectsSort}
                    onChange={setProjectsSort}
                    ddKey="trash-projects-filter|sort"
                    openKey={openFilterKey}
                    onOpenChange={setOpenFilterKey}
                    stableTriggerWidth
                  />
                  <DashboardDropdown
                    label="Число строк"
                    options={pageSizeOptions}
                    value={String(projectsPageSize)}
                    onChange={(value) => setProjectsPageSize(Number(value))}
                    ddKey="trash-projects-filter|page-size"
                    openKey={openFilterKey}
                    onOpenChange={setOpenFilterKey}
                    stableTriggerWidth
                  />
                  <div className="chapters-page-pagination">
                    <button
                      type="button"
                      className="review-queue-clear chapters-page-pagination-btn"
                      onClick={() => setProjectsPageIndex((p) => Math.max(0, p - 1))}
                      disabled={projectsSafePageIndex <= 0}
                      aria-label="Предыдущая страница"
                    >
                      <ChevronLeft size={16} strokeWidth={1.8} aria-hidden />
                    </button>
                    <span className="chapters-page-pagination-label">
                      {projectsSafePageIndex + 1} / {projectsTotalPages}
                    </span>
                    <button
                      type="button"
                      className="review-queue-clear chapters-page-pagination-btn"
                      onClick={() => setProjectsPageIndex((p) => Math.min(projectsTotalPages - 1, p + 1))}
                      disabled={projectsSafePageIndex >= projectsTotalPages - 1}
                      aria-label="Следующая страница"
                    >
                      <ChevronRight size={16} strokeWidth={1.8} aria-hidden />
                    </button>
                  </div>
                  <PressActionButton onClick={handleResetProjectsFilters}>
                    <RefreshCcw className="projects-add-project-plus" size={16} strokeWidth={2.2} aria-hidden />
                    <span>Сбросить</span>
                  </PressActionButton>
                </>
              ) : (
                <>
                  <DashboardDropdown
                    label="Тайтл"
                    options={chaptersTitleOptions}
                    value={chaptersTitleFilter}
                    onChange={setChaptersTitleFilter}
                    ddKey="trash-chapters-filter|title"
                    openKey={openFilterKey}
                    onOpenChange={setOpenFilterKey}
                    stableTriggerWidth
                    truncateOptionLabels
                  />
                  <DashboardDropdown
                    label="Статус"
                    options={chaptersStatusOptions}
                    value={chaptersStatusFilter}
                    onChange={setChaptersStatusFilter}
                    ddKey="trash-chapters-filter|status"
                    openKey={openFilterKey}
                    onOpenChange={setOpenFilterKey}
                    stableTriggerWidth
                  />
                  <DashboardDropdown
                    label="Сортировка"
                    options={chaptersSortOptions}
                    value={chaptersSort}
                    onChange={setChaptersSort}
                    ddKey="trash-chapters-filter|sort"
                    openKey={openFilterKey}
                    onOpenChange={setOpenFilterKey}
                    stableTriggerWidth
                  />
                  <DashboardDropdown
                    label="Число строк"
                    options={pageSizeOptions}
                    value={String(chaptersPageSize)}
                    onChange={(value) => setChaptersPageSize(Number(value))}
                    ddKey="trash-chapters-filter|page-size"
                    openKey={openFilterKey}
                    onOpenChange={setOpenFilterKey}
                    stableTriggerWidth
                  />
                  <div className="chapters-page-pagination">
                    <button
                      type="button"
                      className="review-queue-clear chapters-page-pagination-btn"
                      onClick={() => setChaptersPageIndex((p) => Math.max(0, p - 1))}
                      disabled={chaptersSafePageIndex <= 0}
                      aria-label="Предыдущая страница"
                    >
                      <ChevronLeft size={16} strokeWidth={1.8} aria-hidden />
                    </button>
                    <span className="chapters-page-pagination-label">
                      {chaptersSafePageIndex + 1} / {chaptersTotalPages}
                    </span>
                    <button
                      type="button"
                      className="review-queue-clear chapters-page-pagination-btn"
                      onClick={() => setChaptersPageIndex((p) => Math.min(chaptersTotalPages - 1, p + 1))}
                      disabled={chaptersSafePageIndex >= chaptersTotalPages - 1}
                      aria-label="Следующая страница"
                    >
                      <ChevronRight size={16} strokeWidth={1.8} aria-hidden />
                    </button>
                  </div>
                  <PressActionButton onClick={handleResetChaptersFilters}>
                    <RefreshCcw className="projects-add-project-plus" size={16} strokeWidth={2.2} aria-hidden />
                    <span>Сбросить</span>
                  </PressActionButton>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="chapters-panel article-mini-card">
          <p className="trash-empty-text">Загрузка…</p>
        </div>
      ) : null}

      {!loading && isEmpty ? (
        <div className="chapters-panel article-mini-card">
          <p className="trash-empty-text">Нет удалённых элементов</p>
        </div>
      ) : null}

      {!loading && !isEmpty && showProjects ? (
        <TrashTableSection emptyLabel="Нет удалённых проектов">
          {sortedProjects.length > 0 ? (
            <div className="projects-table trash-projects-table">
              <div className="projects-row projects-head">
                <span>Название</span>
                <span>Главы</span>
                <span>Глоссарий</span>
                <span>Ссылки</span>
                <span>Дата создания</span>
                <span>Дата удаления</span>
                <span className="chapters-actions-head" aria-hidden="true" />
              </div>
              {paginatedProjects.map((p) => {
                const links = getProjectLinks(p.id)
                const chaptersCount = getDeletedProjectChaptersCount(p)
                return (
                  <div key={p.id} className="projects-row">
                    <span className="projects-name">{p.title}</span>
                    <span className="projects-chapters-wrap">
                      <button
                        type="button"
                        className="review-queue-clear projects-chapters-cell projects-chapters-open-btn"
                        onClick={() => openDeletedProjectChapters(p.title)}
                        aria-label={`Перейти к удалённым главам проекта ${p.title}`}
                      >
                        <span className="projects-chapters-num">{chaptersCount}</span>
                      </button>
                    </span>
                    <span className="projects-glossary">
                      <Link
                        className="review-queue-clear projects-link-tag"
                        to={`/dashboard/projects/${p.id}/glossary`}
                        state={{ projectTitle: p.title, fromTrash: true }}
                      >
                        Открыть
                      </Link>
                    </span>
                    <span className="projects-links">
                      {links.map((link, index) => (
                        <a
                          key={`${p.id}-${index}`}
                          className="review-queue-clear projects-link-tag"
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.label}
                        </a>
                      ))}
                    </span>
                    <span className="projects-created-date">
                      {formatDeletedAt(resolveProjectCreatedAt(p.id, p.created_at))}
                    </span>
                    <span className="trash-date">{formatDeletedAt(p.deleted_at)}</span>
                    <span className="chapters-actions">
                      <button
                        type="button"
                        className="review-queue-clear"
                        onClick={() => setRestoreProjectId(p.id)}
                        aria-label={`Восстановить проект ${p.title}`}
                      >
                        <Undo2 size={16} strokeWidth={1.8} aria-hidden />
                      </button>
                    </span>
                  </div>
                )
              })}
            </div>
          ) : null}
        </TrashTableSection>
      ) : null}

      {!loading && !isEmpty && showChapters ? (
        <TrashTableSection emptyLabel="Нет удалённых глав">
          {filteredChapters.length > 0 ? (
            <div className="chapters-table trash-chapters-table">
              <div className={`chapters-row chapters-head${soloMode ? ' chapters-row--solo' : ''}`}>
                <span>Проект / №</span>
                <span>Статус</span>
                <span>Перевод</span>
                <span>Дата создания</span>
                <span>Дата изменения</span>
                <span>Дата удаления</span>
                {!soloMode ? <span>Редактор</span> : null}
                <span className="chapters-actions-head" aria-hidden="true" />
              </div>
              {paginatedChapters.map((c) => {
                const statusLabel = STATUS_LABEL[c.status_code] ?? c.status_code
                return (
                  <div key={c.id} className={`chapters-row${soloMode ? ' chapters-row--solo' : ''}`}>
                    <span className="chapters-title">
                      <span className="chapters-title-main">
                        {c.project_title} <strong className="chapters-title-number">№ {c.chapter_number}</strong>
                      </span>
                      {c.restored_from_trash ? <span className="chapters-title-note">(восстановленная)</span> : null}
                    </span>
                    <span>
                      <StatusBadge statusCode={c.status_code} status={statusLabel} />
                    </span>
                    <span className="chapters-translate">
                      <Link
                        className="review-queue-clear projects-link-tag"
                        to={`/dashboard/chapters/${c.id}/edit`}
                        state={{
                          fromTrash: true,
                          projectId: c.project_id,
                          projectTitle: c.project_title,
                          chapterNumber: c.chapter_number,
                        }}
                      >
                        Открыть
                      </Link>
                    </span>
                    <span className="projects-created-date">
                      {formatDeletedAt(resolveItemCreatedAt(c.id, c.created_at))}
                    </span>
                    <span className="chapters-date">
                      {formatDeletedAt(resolveItemUpdatedAt(c.id, c.updated_at, c.created_at))}
                    </span>
                    <span className="trash-date">{formatDeletedAt(c.deleted_at)}</span>
                    {!soloMode ? (
                      <span className="chapters-editor">
                        {c.editor_id ? (
                          <>
                            <div className="chapters-editor-avatar-wrap">
                              <div className="chapters-editor-avatar">
                                <img
                                  src={`https://picsum.photos/seed/mangadesk-team-${c.editor_id}/96/96`}
                                  alt=""
                                  className="chapters-editor-avatar-img"
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>
                            </div>
                            <span className="chapters-editor-name">{c.editor_name ?? '—'}</span>
                          </>
                        ) : (
                          <span className="chapters-editor-name">Не назначен</span>
                        )}
                      </span>
                    ) : null}
                    <span className="chapters-actions">
                      <button
                        type="button"
                        className="review-queue-clear"
                        onClick={() => void restoreChapter(c.id)}
                        aria-label={`Восстановить ${c.project_title}, № ${c.chapter_number}`}
                      >
                        <Undo2 size={16} strokeWidth={1.8} aria-hidden />
                      </button>
                    </span>
                  </div>
                )
              })}
            </div>
          ) : null}
        </TrashTableSection>
      ) : null}

      {selectedProject
        ? createPortal(
            <div className="team-modal-backdrop" role="presentation" onClick={() => setRestoreProjectId(null)}>
              <div className="team-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                <div className="team-modal-header">
                  <h2 className="team-modal-title">Восстановление проекта</h2>
                </div>
                <div className="project-form-body">
                  <p>Восстановить главы, привязанные к проекту?</p>
                </div>
                <div className="project-form-footer">
                  <button
                    type="button"
                    className="dashboard-reset-btn"
                    onClick={() => void restoreProject(selectedProject.id, false)}
                  >
                    Нет
                  </button>
                  <PressActionButton onClick={() => void restoreProject(selectedProject.id, true)}>Да</PressActionButton>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
