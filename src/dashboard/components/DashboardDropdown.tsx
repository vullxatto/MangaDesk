import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

export type DashboardDropdownOption = { value: string; label: string }

const DROPDOWN_ROW_HEIGHT = 28
const DROPDOWN_ROW_GAP = 2
const DROPDOWN_MENU_PADDING = 12
const DROPDOWN_FOOTER_HEIGHT = 44

type DashboardDropdownProps = {
  label: string
  options: DashboardDropdownOption[]
  value: string
  onChange: (value: string) => void
  ddKey: string
  openKey: string | null
  onOpenChange: (key: string | null) => void
  footerAction?: { label: string; icon?: ReactNode; onClick: () => void }
  maxVisibleRows?: number
  menuPlacement?: 'bottom' | 'top'
  menuAlign?: 'left' | 'right'
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
  maxVisibleRows,
  menuPlacement = 'bottom',
  menuAlign = 'left',
}: DashboardDropdownProps) {
  const isOpen = openKey === ddKey
  const selectedLabel = options.find((o) => o.value === value)?.label ?? '—'
  const triggerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [menuBox, setMenuBox] = useState<{
    top: number
    left: number
    width: number
    scrollMaxHeight?: number
    maxHeight?: number
  } | null>(null)
  const [showScrollHint, setShowScrollHint] = useState(false)

  const updateScrollHint = useCallback(() => {
    const el = scrollRef.current
    if (!el || !maxVisibleRows || options.length < maxVisibleRows) {
      setShowScrollHint(false)
      return
    }
    const hasOverflow = el.scrollHeight > el.clientHeight + 1
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8
    setShowScrollHint(hasOverflow && !atBottom)
  }, [maxVisibleRows, options.length])

  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuBox(null)
      return
    }
    const el = triggerRef.current
    if (!el) return

    function place() {
      const r = el!.getBoundingClientRect()
      const width = Math.max(r.width, 170)
      const gap = 4
      const viewportPadding = 12
      const footerHeight = footerAction ? DROPDOWN_FOOTER_HEIGHT : 0
      const idealHeight = maxVisibleRows
        ? maxVisibleRows * DROPDOWN_ROW_HEIGHT + (maxVisibleRows - 1) * DROPDOWN_ROW_GAP
        : undefined
      let scrollMaxHeight: number | undefined
      let maxHeight: number | undefined

      const availableBelow = window.innerHeight - r.bottom - gap - DROPDOWN_MENU_PADDING - footerHeight - viewportPadding
      const availableAbove = r.top - gap - DROPDOWN_MENU_PADDING - footerHeight - viewportPadding

      if (maxVisibleRows) {
        const availableHeight = menuPlacement === 'top' ? availableAbove : availableBelow
        scrollMaxHeight = Math.min(idealHeight, Math.max(availableHeight, DROPDOWN_ROW_HEIGHT))
      } else {
        const availableHeight = menuPlacement === 'top' ? availableAbove : availableBelow
        maxHeight = Math.max(availableHeight, DROPDOWN_ROW_HEIGHT)
      }

      const contentHeight = maxVisibleRows
        ? scrollMaxHeight ?? DROPDOWN_ROW_HEIGHT
        : maxHeight ?? DROPDOWN_ROW_HEIGHT
      const top =
        menuPlacement === 'top'
          ? Math.max(viewportPadding, r.top - gap - DROPDOWN_MENU_PADDING - footerHeight - contentHeight)
          : r.bottom + gap
      const maxWidth = Math.min(window.innerWidth - viewportPadding * 2, 420)
      const left =
        menuAlign === 'right'
          ? Math.max(viewportPadding, r.right - Math.min(width, maxWidth))
          : Math.min(r.left, window.innerWidth - viewportPadding - width)

      setMenuBox({
        top,
        left,
        width,
        scrollMaxHeight,
        maxHeight,
      })
    }

    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [Boolean(footerAction), isOpen, maxVisibleRows, menuAlign, menuPlacement])

  useEffect(() => {
    if (!isOpen || !maxVisibleRows) {
      setShowScrollHint(false)
      return undefined
    }
    const frame = window.requestAnimationFrame(updateScrollHint)
    window.addEventListener('resize', updateScrollHint)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateScrollHint)
    }
  }, [isOpen, maxVisibleRows, menuBox?.scrollMaxHeight, options.length, updateScrollHint])

  const optionButtons = options.map((option) => (
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
  ))

  const menu =
    isOpen && menuBox
      ? createPortal(
          <div
            className={`dashboard-dropdown-menu review-queue-dropdown-portal${maxVisibleRows ? ' dashboard-dropdown-menu--fixed-rows' : ''}${showScrollHint ? ' dashboard-dropdown-menu--scroll-hint' : ''}`}
            data-review-queue-portal={ddKey}
            style={{
              position: 'fixed',
              top: menuBox.top,
              left: menuBox.left,
              minWidth: menuBox.width,
              width: 'max-content',
              maxWidth: 'min(calc(100vw - 24px), 420px)',
              ...(maxVisibleRows ? ({ ['--dropdown-row-height' as string]: `${DROPDOWN_ROW_HEIGHT}px` } as CSSProperties) : {}),
              ...(maxVisibleRows
                ? {}
                : {
                    maxHeight: menuBox.maxHeight,
                  }),
              zIndex: 4000,
            }}
            role="listbox"
          >
            {maxVisibleRows ? (
              <div
                ref={scrollRef}
                className="dashboard-dropdown-menu-scroll"
                style={menuBox.scrollMaxHeight ? { maxHeight: menuBox.scrollMaxHeight } : undefined}
                onScroll={updateScrollHint}
              >
                {optionButtons}
              </div>
            ) : (
              optionButtons
            )}
            {showScrollHint ? (
              <div className="dashboard-dropdown-scroll-hint" aria-hidden>
                <ChevronDown size={18} strokeWidth={2.25} />
              </div>
            ) : null}
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
