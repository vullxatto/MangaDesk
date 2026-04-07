import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import ChapterTable from './ChapterTable'

const chaptersData = [
  { id: 1, title: 'ПРОЕКТ 1', number: 12, status: 'ГОТОВО', statusCode: 'ready', date: '05.03.2025 14:49', editor: 'Редактор 1' },
  { id: 2, title: 'ПРОЕКТ 1', number: 13, status: 'Обработка', statusCode: 'ai', date: '13.02.2024 14:49', editor: 'Редактор 2' },
  { id: 3, title: 'ПРОЕКТ 2', number: 105, status: 'РЕДАКТУРА', statusCode: 'edit', date: '05.03.2024 14:49', editor: 'Редактор 3' },
  { id: 4, title: 'ПРОЕКТ 3', number: 1, status: 'ЗАГРУЗКА', statusCode: 'upload', date: '01.03.2024 14:49', editor: 'Редактор 4' },
]

const titleOptions = [
  { value: 'all', label: 'Все' },
  { value: 'ПРОЕКТ 1', label: 'ПРОЕКТ 1' },
  { value: 'ПРОЕКТ 2', label: 'ПРОЕКТ 2' },
  { value: 'ПРОЕКТ 3', label: 'ПРОЕКТ 3' },
]

const statusOptions = [
  { value: 'all', label: 'Все' },
  { value: 'ready', label: 'Готово' },
  { value: 'ai', label: 'Обработка' },
  { value: 'edit', label: 'Редактура' },
  { value: 'upload', label: 'Загружена' },
]

const DEFAULT_TITLE_FILTER = 'all'
const DEFAULT_STATUS_FILTER = 'all'
const DEFAULT_SORT = 'date-desc'

const sortOptions = [
  { value: 'date-desc', label: 'Дата — новые сверху' },
  { value: 'date-asc', label: 'Дата — старые сверху' },
  { value: 'number-desc', label: 'Номер — по убыванию' },
  { value: 'number-asc', label: 'Номер — по возрастанию' },
]

/** DD.MM.YYYY HH:mm */
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
  const [titleFilter, setTitleFilter] = useState(DEFAULT_TITLE_FILTER)
  const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS_FILTER)
  const [sortBy, setSortBy] = useState(DEFAULT_SORT)
  const [openDropdown, setOpenDropdown] = useState(null)
  const filtersRef = useRef(null)

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!filtersRef.current?.contains(event.target)) {
        setOpenDropdown(null)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setOpenDropdown(null)
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
    const filtered = chaptersData.filter((row) => {
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
  }, [sortBy, statusFilter, titleFilter])

  function handleResetFilters() {
    setTitleFilter(DEFAULT_TITLE_FILTER)
    setStatusFilter(DEFAULT_STATUS_FILTER)
    setSortBy(DEFAULT_SORT)
    setOpenDropdown(null)
  }

  return (
    <div className="chapters-page projects-page">
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
              setOpenDropdown((value) => (value === 'title' ? null : 'title'))
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
              setOpenDropdown((value) => (value === 'status' ? null : 'status'))
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
              setOpenDropdown((value) => (value === 'sort' ? null : 'sort'))
            }}
          />
          <button type="button" className="dashboard-reset-btn" onClick={handleResetFilters}>
            Сбросить
          </button>
          <button type="button" className="dashboard-new-btn">
            <Plus className="projects-add-project-plus" size={18} strokeWidth={2.5} aria-hidden />
            <span>Загрузить главу</span>
          </button>
        </div>
      </div>
      <div className="chapters-panel">
        <ChapterTable rows={filteredChapters} />
      </div>
    </div>
  )
}

export default ChaptersPage
