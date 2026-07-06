import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import type { TableColumnConfig } from '../tableColumns'

type TableColumnsDropdownProps<T extends string> = {
  label?: string
  columns: TableColumnConfig<T>[]
  isVisible: (id: T) => boolean
  onToggle: (id: T) => void
  ddKey: string
  openKey: string | null
  onOpenChange: (key: string | null) => void
}

export default function TableColumnsDropdown<T extends string>({
  label = 'Столбцы',
  columns,
  isVisible,
  onToggle,
  ddKey,
  openKey,
  onOpenChange,
}: TableColumnsDropdownProps<T>) {
  const isOpen = openKey === ddKey
  const triggerRef = useRef<HTMLDivElement>(null)
  const [menuBox, setMenuBox] = useState<{ top: number; left: number; minWidth: number } | null>(null)
  const visibleCount = columns.filter((column) => isVisible(column.id)).length

  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuBox(null)
      return
    }
    const el = triggerRef.current
    if (!el) return

    function place() {
      const r = el!.getBoundingClientRect()
      const gap = 4
      const viewportPadding = 12
      const minWidth = Math.max(r.width, 200)
      const left = Math.min(r.left, window.innerWidth - viewportPadding - minWidth)
      setMenuBox({
        top: r.bottom + gap,
        left: Math.max(viewportPadding, left),
        minWidth,
      })
    }

    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [isOpen])

  const menu =
    isOpen && menuBox
      ? createPortal(
          <div
            className="dashboard-dropdown-menu review-queue-dropdown-portal dashboard-dropdown-menu--fit-content table-columns-dropdown-menu"
            data-review-queue-portal={ddKey}
            style={{
              position: 'fixed',
              top: menuBox.top,
              left: menuBox.left,
              minWidth: menuBox.minWidth,
              width: 'max-content',
              maxWidth: 'min(calc(100vw - 24px), 320px)',
              zIndex: 4000,
            }}
            role="group"
            aria-label={label}
          >
            {columns.map((column) => {
              const checked = isVisible(column.id)
              const isLastVisible = checked && visibleCount <= 1
              return (
                <label
                  key={column.id}
                  className={`table-columns-dropdown-row${isLastVisible ? ' table-columns-dropdown-row--disabled' : ''}`}
                  title={isLastVisible ? 'Должен остаться хотя бы один столбец' : undefined}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className="review-submit-modal-checkbox"
                    checked={checked}
                    disabled={isLastVisible}
                    onChange={() => onToggle(column.id)}
                  />
                  <span className="table-columns-dropdown-label">{column.label}</span>
                </label>
              )
            })}
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <div
        ref={triggerRef}
        className="dashboard-dropdown review-queue-field-dropdown dashboard-dropdown--stable-width dashboard-dropdown--label-only"
        data-review-queue-dd={ddKey}
      >
        <button
          type="button"
          className="dashboard-filter-btn"
          onClick={(e) => {
            e.stopPropagation()
            onOpenChange(isOpen ? null : ddKey)
          }}
          aria-expanded={isOpen}
          aria-label={`${label}: ${visibleCount} из ${columns.length}`}
        >
          <span className="dashboard-filter-btn-text">
            <span className="dashboard-filter-btn-label">{label}</span>
          </span>
          <ChevronDown size={14} className="dashboard-filter-chevron" strokeWidth={2.25} aria-hidden />
        </button>
      </div>
      {menu}
    </>
  )
}
