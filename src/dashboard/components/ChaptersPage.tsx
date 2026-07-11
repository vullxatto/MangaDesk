import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { PressActionButton } from '../../components/PressActionButton'
import { usePipeline } from '../context/usePipeline'
import ChapterMetadataModal from './ChapterMetadataModal'
import ChapterTable from './ChapterTable'
import DashboardDropdown from './DashboardDropdown'
import TableColumnsDropdown from './TableColumnsDropdown'
import { useChaptersTableColumns } from '../tableColumns'

const DEFAULT_TITLE_FILTER = 'all'
const DEFAULT_STATUS_FILTER = 'all'
const DEFAULT_SORT = 'updated-desc'
const DEFAULT_PAGE_SIZE = 10

const pageSizeOptions = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
]

const sortOptions = [
  { value: 'created-desc', label: 'Дата создания — новые сверху' },
  { value: 'created-asc', label: 'Дата создания — старые сверху' },
  { value: 'updated-desc', label: 'Дата изменения — новые сверху' },
  { value: 'updated-asc', label: 'Дата изменения — старые сверху' },
  { value: 'number-desc', label: 'Номер — по убыванию' },
  { value: 'number-asc', label: 'Номер — по возрастанию' },
]

const statusOptions = [
  { value: 'all', label: 'Все' },
  { value: 'ready', label: 'Готово' },
  { value: 'review', label: 'Ожидает проверки' },
  { value: 'waiting_editor', label: 'Ждёт редактора' },
  { value: 'ai', label: 'Обработка' },
  { value: 'edit', label: 'В редактуре' },
  { value: 'upload', label: 'Загрузка' },
]

function parseChapterDate(iso: string) {
  return new Date(iso).getTime()
}

function ChaptersPage({ title }) {
  const [searchParams] = useSearchParams()
  const {
    chapters,
    soloMode,
    updateChapterMetadata,
    removeChapter,
    uploadQueue,
    teamMembers,
    projects,
  } = usePipeline()
  const [titleFilter, setTitleFilter] = useState(DEFAULT_TITLE_FILTER)
  const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS_FILTER)
  const [sortBy, setSortBy] = useState(DEFAULT_SORT)
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [pageIndex, setPageIndex] = useState(0)
  const [assignMenuKey, setAssignMenuKey] = useState<string | null>(null)
  const [metadataChapterId, setMetadataChapterId] = useState<string | null>(null)
  const filtersRef = useRef<HTMLDivElement>(null)
  const pageRootRef = useRef<HTMLDivElement>(null)
  const appliedUrlProjectRef = useRef<string | null>(null)
  const chaptersColumns = useChaptersTableColumns(soloMode)

  const titleOptions = useMemo(() => {
    const titles = [...new Set(chapters.map((c) => c.title))].sort()
    return [{ value: 'all', label: 'Все' }, ...titles.map((t) => ({ value: t, label: t }))]
  }, [chapters])

  useEffect(() => {
    const projectName = searchParams.get('project')?.trim() ?? ''
    if (projectName === appliedUrlProjectRef.current) return
    appliedUrlProjectRef.current = projectName || null
    if (!projectName) return
    const exists = titleOptions.some((option) => option.value === projectName)
    if (exists) {
      setTitleFilter(projectName)
    }
  }, [searchParams, titleOptions])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node
      if (openFilterKey) {
        const trigger = document.querySelector(`[data-review-queue-dd="${CSS.escape(openFilterKey)}"]`)
        const portalMenu = document.querySelector(`[data-review-queue-portal="${CSS.escape(openFilterKey)}"]`)
        if (!trigger?.contains(target) && !portalMenu?.contains(target)) {
          setOpenFilterKey(null)
        }
      }
      if (assignMenuKey) {
        const trigger = document.querySelector(`[data-review-queue-dd="${CSS.escape(assignMenuKey)}"]`)
        const portalMenu = document.querySelector(`[data-review-queue-portal="${CSS.escape(assignMenuKey)}"]`)
        if (!trigger?.contains(target) && !portalMenu?.contains(target)) {
          setAssignMenuKey(null)
        }
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenFilterKey(null)
        setAssignMenuKey(null)
      }
    }

    window.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [assignMenuKey, openFilterKey])

  const filteredChapters = useMemo(() => {
    const filtered = chapters.filter((row) => {
      const byTitle = titleFilter === 'all' || row.title === titleFilter
      const byStatus = statusFilter === 'all' || row.statusCode === statusFilter
      return byTitle && byStatus
    })

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'updated-desc') {
        return parseChapterDate(b.updatedAt) - parseChapterDate(a.updatedAt)
      }
      if (sortBy === 'updated-asc') {
        return parseChapterDate(a.updatedAt) - parseChapterDate(b.updatedAt)
      }
      if (sortBy === 'created-desc') {
        return parseChapterDate(b.createdAt) - parseChapterDate(a.createdAt)
      }
      if (sortBy === 'created-asc') {
        return parseChapterDate(a.createdAt) - parseChapterDate(b.createdAt)
      }
      if (sortBy === 'number-desc') {
        return b.number - a.number
      }
      if (sortBy === 'number-asc') {
        return a.number - b.number
      }
      return 0
    })

    return sorted
  }, [chapters, sortBy, statusFilter, titleFilter])

  const totalPages = Math.max(1, Math.ceil(filteredChapters.length / pageSize))
  const safePageIndex = Math.min(pageIndex, totalPages - 1)
  const paginatedChapters = useMemo(() => {
    const start = safePageIndex * pageSize
    return filteredChapters.slice(start, start + pageSize)
  }, [filteredChapters, pageSize, safePageIndex])

  useEffect(() => {
    setPageIndex(0)
  }, [titleFilter, statusFilter, sortBy, pageSize])

  useEffect(() => {
    if (pageIndex > totalPages - 1) {
      setPageIndex(Math.max(0, totalPages - 1))
    }
  }, [pageIndex, totalPages])

  function handleResetFilters() {
    setTitleFilter(DEFAULT_TITLE_FILTER)
    setStatusFilter(DEFAULT_STATUS_FILTER)
    setSortBy(DEFAULT_SORT)
    setPageSize(DEFAULT_PAGE_SIZE)
    setPageIndex(0)
    setOpenFilterKey(null)
  }

  const metadataChapter =
    metadataChapterId != null ? chapters.find((c) => c.id === metadataChapterId) : undefined

  return (
    <div className="chapters-page projects-page" ref={pageRootRef}>
      <div className="dashboard-toolbar projects-page-toolbar">
        <h1>{title}</h1>
        <div className="dashboard-filters chapters-page-filters" ref={filtersRef}>
          <DashboardDropdown
            label="Проект"
            options={titleOptions}
            value={titleFilter}
            onChange={setTitleFilter}
            ddKey="chapters-filter|title"
            openKey={openFilterKey}
            onOpenChange={setOpenFilterKey}
            stableTriggerWidth
            truncateOptionLabels
          />
          <DashboardDropdown
            label="Статус"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            ddKey="chapters-filter|status"
            openKey={openFilterKey}
            onOpenChange={setOpenFilterKey}
            stableTriggerWidth
          />
          <DashboardDropdown
            label="Сортировка"
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            ddKey="chapters-filter|sort"
            openKey={openFilterKey}
            onOpenChange={setOpenFilterKey}
            stableTriggerWidth
          />
          <DashboardDropdown
            label="Число строк"
            options={pageSizeOptions}
            value={String(pageSize)}
            onChange={(value) => setPageSize(Number(value))}
            ddKey="chapters-filter|page-size"
            openKey={openFilterKey}
            onOpenChange={setOpenFilterKey}
            stableTriggerWidth
          />
          <TableColumnsDropdown
            columns={chaptersColumns.columns}
            isVisible={chaptersColumns.isVisible}
            onToggle={chaptersColumns.toggleColumn}
            ddKey="chapters-filter|columns"
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
          <PressActionButton onClick={handleResetFilters}>
            <RefreshCcw className="projects-add-project-plus" size={16} strokeWidth={2.2} aria-hidden />
            <span>Сбросить</span>
          </PressActionButton>
        </div>
      </div>
      <div className="chapters-panel article-mini-card">
        <ChapterTable
          rows={paginatedChapters}
          assignMenuKey={assignMenuKey}
          onAssignMenuKey={setAssignMenuKey}
          onOpenMetadataModal={setMetadataChapterId}
          isColumnVisible={chaptersColumns.isVisible}
          gridTemplate={chaptersColumns.gridTemplate}
        />
      </div>
      {metadataChapter ? (
        <ChapterMetadataModal
          key={metadataChapter.id}
          initialProjectId={metadataChapter.projectId}
          initialNumber={metadataChapter.number}
          initialEditorId={metadataChapter.editorId}
          chapterId={metadataChapter.id}
          projects={projects}
          chapters={chapters}
          uploadQueue={uploadQueue}
          teamMembers={teamMembers}
          soloMode={soloMode}
          onClose={() => setMetadataChapterId(null)}
          onConfirm={(projectId, number, chapterTitle, editorId) =>
            void updateChapterMetadata(metadataChapter.id, projectId, number, chapterTitle, editorId)
          }
          onDelete={() => {
            const label = `«${metadataChapter.title}», № ${metadataChapter.number}`
            const ok = window.confirm(`Удалить ${label}?`)
            if (!ok) return
            void removeChapter(metadataChapter.id).finally(() => setMetadataChapterId(null))
          }}
        />
      ) : null}
    </div>
  )
}

export default ChaptersPage
