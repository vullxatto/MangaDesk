import { useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type GlossaryContextMenuProps = {
  x: number
  y: number
  onAdd: () => void
  onClose: () => void
}

export function GlossaryContextMenu({ x, y, onAdd, onClose }: GlossaryContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    function onDocClick(e: MouseEvent) {
      const el = ref.current
      if (el && e.target instanceof Node && el.contains(e.target)) return
      onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDocClick, true)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDocClick, true)
    }
  }, [onClose])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const pad = 8
    const vw = window.innerWidth
    const vh = window.innerHeight
    let left = x
    let top = y
    el.style.left = `${left}px`
    el.style.top = `${top}px`
    const r = el.getBoundingClientRect()
    if (left + r.width > vw - pad) left = vw - r.width - pad
    if (top + r.height > vh - pad) top = vh - r.height - pad
    if (left < pad) left = pad
    if (top < pad) top = pad
    el.style.left = `${left}px`
    el.style.top = `${top}px`
  }, [x, y])

  return createPortal(
    <div ref={ref} className="glossary-context-menu" style={{ position: 'fixed', zIndex: 10050 }} role="menu">
      <button type="button" className="glossary-context-menu-item" role="menuitem" onClick={onAdd}>
        Добавить в глоссарий…
      </button>
    </div>,
    document.body,
  )
}
