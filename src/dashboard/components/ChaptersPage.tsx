import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { PressActionButton } from '../../components/PressActionButton'
import { usePipeline } from '../context/usePipeline'
import ChapterMetadataModal from './ChapterMetadataModal'
import ChapterTable from './ChapterTable'
import DashboardDropdown from './DashboardDropdown'

const DEFAULT_TITLE_FILTER = 'all'
const DEFAULT_STATUS_FILTER = 'all'
const DEFAULT_SORT = 'date-desc'
const DEFAULT_PAGE_SIZE = 10

const pageSizeOptions = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
]

const sortOptions = [
  { value: 'date-desc', label: 'Дата — новые сверху' },
  { value: 'date-asc', label: 'Дата — старые сверху' },
  { value: 'number-desc', label: 'Номер — по убыванию' },
  { value: 'number-asc', label: 'Номер — по возрастанию' },
]

const statusOptions = [
  { value: 'all', label: 'Все' },
  { value: 'ready', label: 'Готово' },
  { value: 'waiting_editor', label: 'Ждёт редактора' },
  { value: 'ai', label: 'Обработка' },
  { value: 'edit', label: 'Редактура' },
  { value: 'upload', label: 'Загрузка' },
]

function parseChapterDate(str) {
  const [datePart, timePart] = str.trim().split(/\s+/)
  const [d, m, y] = datePart.split('.').map(Number)
  const [hh, mm] = timePart ? timePart.split(':').map(Number) : [0, 0]
  return new Date(y, m - 1, d, hh, mm, 0, 0).getTime()
}

function ChaptersPage({ title }) {
  const [searchParams] = useSearchParams()
  const {
    chapters,
    assignEditor,
    selectedWaitingIds,
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

  const batchWaitingSelectedCount = useMemo(() => {
    let n = 0
    for (const id of selectedWaitingIds) {
      const row = chapters.find((c) => c.id === id)
      if (row?.statusCode === 'waiting_editor') n += 1
    }
    return n
  }, [chapters, selectedWaitingIds])

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
      if (!pageRootRef.current?.contains(target)) {
        setAssignMenuKey(null)
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
  }, [openFilterKey])

  const filteredChapters = useMemo(() => {
    const filtered = chapters.filter((row) => {
      const byTitle = titleFilter === 'all' || row.title === titleFilter
      const byStatus = statusFilter === 'all' || row.statusCode === statusFilter
      return byTitle && byStatus
    })

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'date-desc') {
        return parseChapterDate(b.date) - parseChapterDate(a.date)
      }
      if (sortBy === 'date-asc') {
        return parseChapterDate(a.date) - parseChapterDate(b.date)
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

  const showPagination = filteredChapters.length > pageSize

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

  const batchOpen = assignMenuKey === 'batch'

  const metadataChapter =
    metadataChapterId != null ? chapters.find((c) => c.id === metadataChapterId) : undefined

  return (
    <div className="chapters-page projects-page" ref={pageRootRef}>
      <div className="dashboard-toolbar projects-page-toolbar">
        <h1>{title}</h1>
        <div className="dashboard-filters chapters-page-filters" ref={filtersRef}>
          <DashboardDropdown
            label="Тайтл"
            options={titleOptions}
            value={titleFilter}
            onChange={setTitleFilter}
            ddKey="chapters-filter|title"
            openKey={openFilterKey}
            onOpenChange={setOpenFilterKey}
          />
          <DashboardDropdown
            label="Статус"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            ddKey="chapters-filter|status"
            openKey={openFilterKey}
            onOpenChange={setOpenFilterKey}
          />
          <DashboardDropdown
            label="Сортировка"
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            ddKey="chapters-filter|sort"
            openKey={openFilterKey}
            onOpenChange={setOpenFilterKey}
          />
          <DashboardDropdown
            label="На странице"
            options={pageSizeOptions}
            value={String(pageSize)}
            onChange={(value) => setPageSize(Number(value))}
            ddKey="chapters-filter|page-size"
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
          <PressActionButton onClick={handleResetFilters}>
            <span>Сбросить</span>
          </PressActionButton>
        </div>
      </div>
      {!soloMode && batchWaitingSelectedCount >= 2 ? (
        <div className="chapters-batch-bar">
          <span className="chapters-batch-bar-text">Выбрано: {batchWaitingSelectedCount}</span>
          <div className={`dashboard-dropdown chapters-assign-dropdown ${batchOpen ? 'is-open' : ''}`}>
            <PressActionButton
              buttonClassName="chapters-batch-assign-btn"
              onClick={(e) => {
                e.stopPropagation()
                setAssignMenuKey((k) => (k === 'batch' ? null : 'batch'))
              }}
              aria-expanded={batchOpen}
            >
              <span>Назначить редактора</span>
            </PressActionButton>
            {batchOpen ? (
              <div className="dashboard-dropdown-menu chapters-assign-menu chapters-assign-menu--batch">
                {teamMembers.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="dashboard-dropdown-item"
                    onClick={() => {
                      const ids = [...selectedWaitingIds].filter((id) => {
                        const row = chapters.find((c) => c.id === id)
                        return row?.statusCode === 'waiting_editor'
                      })
                      void assignEditor(ids, m.id)
                      setAssignMenuKey(null)
                    }}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="chapters-panel article-mini-card">
        <ChapterTable
          rows={paginatedChapters}
          assignMenuKey={assignMenuKey}
          onAssignMenuKey={setAssignMenuKey}
          onOpenMetadataModal={setMetadataChapterId}
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
