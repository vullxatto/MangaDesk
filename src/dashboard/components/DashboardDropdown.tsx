import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

export type DashboardDropdownOption = { value: string; label: string }

type DashboardDropdownProps = {
  label: string
  options: DashboardDropdownOption[]
  value: string
  onChange: (value: string) => void
  ddKey: string
  openKey: string | null
  onOpenChange: (key: string | null) => void
  footerAction?: { label: string; icon?: ReactNode; onClick: () => void }
}

export default function DashboardDropdown({
  label,
  options,
  value,
  onChange,
  ddKey,
  openKey,
  onOpenChange,
  footerAction,
}: DashboardDropdownProps) {
  const isOpen = openKey === ddKey
  const selectedLabel = options.find((o) => o.value === value)?.label ?? '—'
  const triggerRef = useRef<HTMLDivElement>(null)
  const [menuBox, setMenuBox] = useState<{ top: number; left: number; width: number } | null>(null)

  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuBox(null)
      return
    }
    const el = triggerRef.current
    if (!el) return

    function place() {
      const r = el!.getBoundingClientRect()
      setMenuBox({
        top: r.bottom + 4,
        left: r.left,
        width: Math.max(r.width, 170),
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
            className="dashboard-dropdown-menu review-queue-dropdown-portal"
            data-review-queue-portal={ddKey}
            style={{
              position: 'fixed',
              top: menuBox.top,
              left: menuBox.left,
              width: menuBox.width,
              zIndex: 4000,
            }}
            role="listbox"
          >
            {options.map((option) => (
              <button
                key={option.value === '' ? `${ddKey}-empty` : option.value}
                type="button"
                className={`dashboard-dropdown-item ${option.value === value ? 'is-selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(option.value)
                  onOpenChange(null)
                }}
              >
                {option.label}
              </button>
            ))}
            {footerAction ? (
              <div className="dashboard-dropdown-menu-footer">
                <button
                  type="button"
                  className="dashboard-dropdown-item dashboard-dropdown-item--action"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenChange(null)
                    footerAction.onClick()
                  }}
                >
                  {footerAction.icon}
                  <span>{footerAction.label}</span>
                </button>
              </div>
            ) : null}
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <div
        ref={triggerRef}
        className="dashboard-dropdown review-queue-field-dropdown"
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
        >
          <span className="dashboard-filter-btn-text">
            <span className="dashboard-filter-btn-label">{label}:</span>
            <span className="dashboard-filter-btn-value">{selectedLabel}</span>
          </span>
          <ChevronDown size={14} className="dashboard-filter-chevron" strokeWidth={2.25} aria-hidden />
        </button>
      </div>
      {menu}
    </>
  )
}
