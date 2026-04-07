import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import ChapterTable from './ChapterTable'

const chaptersData = [
  { id: 1, title: 'ПРОЕКТ 1', number: 12, status: 'ГОТОВО', statusCode: 'ready', date: '05.03.2025 14:49', editor: 'Редактор 1' },
  { id: 2, title: 'ПРОЕКТ 1', number: 13, status: 'AI-ОБРАБОТКА', statusCode: 'ai', date: '13.02.2024 14:49', editor: 'Редактор 2' },
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
  { value: 'ready', label: 'Готова' },
  { value: 'ai', label: 'AI-Обработка' },
  { value: 'edit', label: 'Редактура' },
  { value: 'upload', label: 'Загружена' },
]

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
  const [titleFilter, setTitleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
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
    return chaptersData.filter((row) => {
      const byTitle = titleFilter === 'all' || row.title === titleFilter
      const byStatus = statusFilter === 'all' || row.statusCode === statusFilter
      return byTitle && byStatus
    })
  }, [statusFilter, titleFilter])

  return (
    <div className="chapters-page">
      <div className="chapters-panel">
        <div className="dashboard-toolbar">
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
            <button type="button" className="dashboard-new-btn">
              + Новая глава
            </button>
          </div>
        </div>
        <ChapterTable rows={filteredChapters} />
      </div>
    </div>
  )
}

export default ChaptersPage
