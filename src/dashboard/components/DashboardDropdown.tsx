import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

export type DashboardDropdownOption = { value: string; label: string }

const DROPDOWN_ROW_HEIGHT = 28
const DROPDOWN_ROW_GAP = 2
const DROPDOWN_MENU_PADDING = 12
const DROPDOWN_FOOTER_HEIGHT = 44
const SORT_MENU_WIDTH_REFERENCE_LABELS = [
  'Дата удаления — новые сверху',
  'Дата изменения — новые сверху',
  'Дата создания — новые сверху',
]

let filterMenuMeasureEl: HTMLSpanElement | null = null

function measureFilterMenuLabelWidth(label: string) {
  if (typeof document === 'undefined') return label.length * 7
  if (!filterMenuMeasureEl) {
    filterMenuMeasureEl = document.createElement('span')
    filterMenuMeasureEl.style.cssText =
      'position:absolute;left:-9999px;top:-9999px;visibility:hidden;white-space:nowrap;pointer-events:none;'
    document.body.appendChild(filterMenuMeasureEl)
  }
  filterMenuMeasureEl.style.fontFamily = 'var(--font-shonen)'
  filterMenuMeasureEl.style.fontSize = '11px'
  filterMenuMeasureEl.style.fontWeight = '400'
  filterMenuMeasureEl.style.letterSpacing = '0.04em'
  filterMenuMeasureEl.style.textTransform = 'uppercase'
  filterMenuMeasureEl.textContent = label.toUpperCase()
  return filterMenuMeasureEl.getBoundingClientRect().width
}

function measureFilterMenuWidth(labels: string[]) {
  const contentWidth = labels.reduce((max, label) => Math.max(max, measureFilterMenuLabelWidth(label)), 0)
  return Math.ceil(contentWidth) + 28
}

function sortFilterMenuWidth() {
  return measureFilterMenuWidth(SORT_MENU_WIDTH_REFERENCE_LABELS)
}

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
  stableTriggerWidth?: boolean
  truncateOptionLabels?: boolean
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
  stableTriggerWidth = false,
  truncateOptionLabels = false,
}: DashboardDropdownProps) {
  const isOpen = openKey === ddKey
  const selectedLabel = options.find((o) => o.value === value)?.label ?? '—'
  const triggerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [menuBox, setMenuBox] = useState<{
    top: number
    left: number
    minWidth: number
    width?: number
    fitContent: boolean
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
      const gap = 4
      const viewportPadding = 12
      const footerHeight = footerAction ? DROPDOWN_FOOTER_HEIGHT : 0
      let scrollMaxHeight: number | undefined
      let maxHeight: number | undefined

      const availableBelow = window.innerHeight - r.bottom - gap - DROPDOWN_MENU_PADDING - footerHeight - viewportPadding
      const availableAbove = r.top - gap - DROPDOWN_MENU_PADDING - footerHeight - viewportPadding

      if (maxVisibleRows) {
        const idealHeight =
          maxVisibleRows * DROPDOWN_ROW_HEIGHT + (maxVisibleRows - 1) * DROPDOWN_ROW_GAP
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
      const maxMenuWidth = Math.min(window.innerWidth - viewportPadding * 2, 420)
      const minWidth = Math.max(r.width, 170)
      const menuWidth = truncateOptionLabels
        ? Math.min(Math.max(minWidth, sortFilterMenuWidth()), maxMenuWidth)
        : undefined
      const left =
        menuAlign === 'right'
          ? Math.max(viewportPadding, r.right - (menuWidth ?? minWidth))
          : Math.min(r.left, window.innerWidth - viewportPadding - (menuWidth ?? minWidth))

      setMenuBox({
        top,
        left,
        minWidth,
        width: menuWidth,
        fitContent: !truncateOptionLabels,
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
  }, [Boolean(footerAction), isOpen, maxVisibleRows, menuAlign, menuPlacement, truncateOptionLabels])

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
      title={truncateOptionLabels ? option.label : undefined}
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
            className={`dashboard-dropdown-menu review-queue-dropdown-portal${maxVisibleRows ? ' dashboard-dropdown-menu--fixed-rows' : ''}${showScrollHint ? ' dashboard-dropdown-menu--scroll-hint' : ''}${truncateOptionLabels ? ' dashboard-dropdown-menu--truncate-options' : ' dashboard-dropdown-menu--fit-content'}`}
            data-review-queue-portal={ddKey}
            style={{
              position: 'fixed',
              top: menuBox.top,
              left: menuBox.left,
              minWidth: menuBox.minWidth,
              ...(menuBox.fitContent
                ? { width: 'max-content' }
                : { width: menuBox.width, maxWidth: 'min(calc(100vw - 24px), 420px)' }),
              ...(menuBox.fitContent ? { maxWidth: 'min(calc(100vw - 24px), 420px)' } : {}),
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
        className={`dashboard-dropdown review-queue-field-dropdown${stableTriggerWidth ? ' dashboard-dropdown--stable-width dashboard-dropdown--label-only' : ''}`}
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
          aria-label={stableTriggerWidth ? `${label}: ${selectedLabel}` : undefined}
        >
          <span className="dashboard-filter-btn-text">
            {stableTriggerWidth ? (
              <span className="dashboard-filter-btn-label">{label}</span>
            ) : (
              <>
                <span className="dashboard-filter-btn-label">{label}:</span>
                <span className="dashboard-filter-btn-value">{selectedLabel}</span>
              </>
            )}
          </span>
          <ChevronDown size={14} className="dashboard-filter-chevron" strokeWidth={2.25} aria-hidden />
        </button>
      </div>
      {menu}
    </>
  )
}
