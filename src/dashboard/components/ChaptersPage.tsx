import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { usePipeline } from '../context/usePipeline'
import ChapterMetadataModal from './ChapterMetadataModal'
import ChapterTable from './ChapterTable'

const DEFAULT_TITLE_FILTER = 'all'
const DEFAULT_STATUS_FILTER = 'all'
const DEFAULT_SORT = 'date-desc'

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

function FilterDropdown({ label, options, value, onChange, isOpen, onToggle }) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? label

  return (
    <div className="dashboard-dropdown">
      <button type="button" className="dashboard-filter-btn" onClick={onToggle} aria-expanded={isOpen}>
        <span className="dashboard-filter-btn-text">
          <span className="dashboard-filter-btn-label">{label}:</span>
          <span className="dashboard-filter-btn-value">{selectedLabel}</span>
        </span>
        <ChevronDown size={12} className="dashboard-filter-chevron" strokeWidth={2.25} />
      </button>
      {isOpen ? (
        <div className="dashboard-dropdown-menu">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`dashboard-dropdown-item ${option.value === value ? 'is-selected' : ''}`}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ChaptersPage({ title }) {
  const [searchParams] = useSearchParams()
  const {
    chapters,
    assignEditor,
    selectedWaitingIds,
    soloMode,
    updateChapterMetadata,
    uploadQueue,
    teamMembers,
    projects,
  } = usePipeline()
  const [titleFilter, setTitleFilter] = useState(DEFAULT_TITLE_FILTER)
  const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS_FILTER)
  const [sortBy, setSortBy] = useState(DEFAULT_SORT)
  const [openDropdown, setOpenDropdown] = useState<'title' | 'status' | 'sort' | null>(null)
  const [assignMenuKey, setAssignMenuKey] = useState<string | null>(null)
  const [metadataChapterId, setMetadataChapterId] = useState<string | null>(null)
  const filtersRef = useRef<HTMLDivElement>(null)
  const pageRootRef = useRef<HTMLDivElement>(null)

  const titleOptions = useMemo(() => {
    const titles = [...new Set(chapters.map((c) => c.title))].sort()
    return [{ value: 'all', label: 'Все' }, ...titles.map((t) => ({ value: t, label: t }))]
  }, [chapters])

  useEffect(() => {
    const projectName = searchParams.get('project')?.trim()
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
    function handleOutsideClick(event) {
      if (!filtersRef.current?.contains(event.target)) {
        setOpenDropdown(null)
      }
      if (!pageRootRef.current?.contains(event.target)) {
        setAssignMenuKey(null)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setOpenDropdown(null)
        setAssignMenuKey(null)
      }
    }

    window.addEventListener('click', handleOutsideClick)
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('click', handleOutsideClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

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

  function handleResetFilters() {
    setTitleFilter(DEFAULT_TITLE_FILTER)
    setStatusFilter(DEFAULT_STATUS_FILTER)
    setSortBy(DEFAULT_SORT)
    setOpenDropdown(null)
  }

  const batchOpen = assignMenuKey === 'batch'

  const metadataChapter =
    metadataChapterId != null ? chapters.find((c) => c.id === metadataChapterId) : undefined

  return (
    <div className="chapters-page projects-page" ref={pageRootRef}>
      <div className="dashboard-toolbar projects-page-toolbar">
        <h1>{title}</h1>
        <div className="dashboard-filters" ref={filtersRef}>
          <FilterDropdown
            label="Тайтл"
            options={titleOptions}
            value={titleFilter}
            onChange={(value) => {
              setTitleFilter(value)
              setOpenDropdown(null)
            }}
            isOpen={openDropdown === 'title'}
            onToggle={(event) => {
              event.stopPropagation()
              setOpenDropdown((prev) => (prev === 'title' ? null : 'title'))
            }}
          />
          <FilterDropdown
            label="Статус"
            options={statusOptions}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value)
              setOpenDropdown(null)
            }}
            isOpen={openDropdown === 'status'}
            onToggle={(event) => {
              event.stopPropagation()
              setOpenDropdown((prev) => (prev === 'status' ? null : 'status'))
            }}
          />
          <FilterDropdown
            label="Сортировка"
            options={sortOptions}
            value={sortBy}
            onChange={(value) => {
              setSortBy(value)
              setOpenDropdown(null)
            }}
            isOpen={openDropdown === 'sort'}
            onToggle={(event) => {
              event.stopPropagation()
              setOpenDropdown((prev) => (prev === 'sort' ? null : 'sort'))
            }}
          />
          <button type="button" className="dashboard-reset-btn" onClick={handleResetFilters}>
            Сбросить
          </button>
        </div>
      </div>
      {!soloMode && batchWaitingSelectedCount >= 2 ? (
        <div className="chapters-batch-bar">
          <span className="chapters-batch-bar-text">Выбрано: {batchWaitingSelectedCount}</span>
          <div className={`dashboard-dropdown chapters-assign-dropdown ${batchOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              className="dashboard-new-btn chapters-batch-assign-btn"
              onClick={(e) => {
                e.stopPropagation()
                setAssignMenuKey((k) => (k === 'batch' ? null : 'batch'))
              }}
              aria-expanded={batchOpen}
            >
              <span>Назначить редактора</span>
            </button>
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
      <div className="chapters-panel">
        <ChapterTable
          rows={filteredChapters}
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
          chapterId={metadataChapter.id}
          projects={projects}
          chapters={chapters}
          uploadQueue={uploadQueue}
          onClose={() => setMetadataChapterId(null)}
          onConfirm={(projectId, number, chapterTitle) =>
            void updateChapterMetadata(metadataChapter.id, projectId, number, chapterTitle)
          }
        />
      ) : null}
    </div>
  )
}

export default ChaptersPage
