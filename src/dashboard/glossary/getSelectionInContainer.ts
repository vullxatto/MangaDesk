/** Возвращает trim-строку выделения, если фокус выделения лежит внутри `root`. */
export function getSelectionTextInContainer(root: Element | null): string {
  if (!root) return ''
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return ''
  const text = sel.toString().trim()
  if (!text) return ''
  const anchor = sel.anchorNode
  if (!anchor) return ''
  const el = anchor.nodeType === Node.TEXT_NODE ? anchor.parentElement : (anchor as Element)
  if (!el || !root.contains(el)) return ''
  return text
}
