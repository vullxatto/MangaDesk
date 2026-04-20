import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { usePipeline } from '../../context/usePipeline'
import {
  bboxToPercentStyle,
  getMockChapterSlices,
  type ChapterTranslationSlice,
} from '../../chapterEditorModel'
import scanPlaceholder from '../../../assets/projects - titles/title.png'

/**
 * Вертикально центрирует строку в scroll-контейнере; scrollTop ограничен снизу,
 * чтобы при последних строках низ таблицы оставался у нижней границы (без пустоты под контентом).
 */
function scrollTableRowToCenterClamped(
  scrollParent: HTMLElement,
  row: HTMLElement,
  behavior: ScrollBehavior = 'smooth',
) {
  const cRect = scrollParent.getBoundingClientRect()
  const rRect = row.getBoundingClientRect()
  const st = scrollParent.scrollTop
  const rowTopInContent = rRect.top - cRect.top + st
  const rowCenter = rowTopInContent + rRect.height / 2
  const targetScroll = rowCenter - scrollParent.clientHeight / 2
  const maxScroll = Math.max(0, scrollParent.scrollHeight - scrollParent.clientHeight)
  const clamped = Math.min(Math.max(0, targetScroll), maxScroll)
  scrollParent.scrollTo({ top: clamped, behavior })
}

function ChapterEditorAutosizeTextarea({
  value,
  onChange,
  onClick,
  onFocus,
  ariaLabel,
  className,
}: {
  value: string
  onChange: (value: string) => void
  onClick: (e: React.MouseEvent<HTMLTextAreaElement>) => void
  onFocus?: () => void
  ariaLabel: string
  className: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useLayoutEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => adjustHeight())
    ro.observe(el)
    return () => ro.disconnect()
  }, [adjustHeight])

  useEffect(() => {
    window.addEventListener('resize', adjustHeight)
    return () => window.removeEventListener('resize', adjustHeight)
  }, [adjustHeight])

  return (
    <textarea
      ref={ref}
      className={className}
      value={value}
      rows={1}
      spellCheck
      aria-label={ariaLabel}
      onClick={onClick}
      onFocus={onFocus}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export default function ChapterEditorPage() {
  const { chapterId: chapterIdParam } = useParams<{ chapterId: string }>()
  const chapterId = chapterIdParam ? parseInt(chapterIdParam, 10) : NaN
  const { chapters } = usePipeline()

  const chapter = useMemo(() => {
    if (!Number.isFinite(chapterId)) return undefined
    return chapters.find((c) => c.id === chapterId)
  }, [chapters, chapterId])

  const [slices, setSlices] = useState<ChapterTranslationSlice[]>(() => getMockChapterSlices())
  const [selectedSliceId, setSelectedSliceId] = useState<number | null>(null)
  const [imgNatural, setImgNatural] = useState<{ w: number; h: number }>({ w: 0, h: 0 })

  const tableWrapRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map())
  const overlayRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const setRowRef = useCallback((sliceId: number, el: HTMLTableRowElement | null) => {
    if (el) rowRefs.current.set(sliceId, el)
    else rowRefs.current.delete(sliceId)
  }, [])

  const setOverlayRef = useCallback((sliceId: number, el: HTMLDivElement | null) => {
    if (el) overlayRefs.current.set(sliceId, el)
    else overlayRefs.current.delete(sliceId)
  }, [])

  const updateTranslated = useCallback((sliceId: number, value: string) => {
    setSlices((prev) =>
      prev.map((s) => (s.slice_id === sliceId ? { ...s, translated: value } : s)),
    )
  }, [])

  const scrollToOverlay = useCallback((sliceId: number) => {
    requestAnimationFrame(() => {
      overlayRefs.current.get(sliceId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      })
    })
  }, [])

  const scrollToTableRow = useCallback((sliceId: number) => {
    requestAnimationFrame(() => {
      const container = tableWrapRef.current
      const row = rowRefs.current.get(sliceId)
      if (!container || !row) return
      scrollTableRowToCenterClamped(container, row, 'smooth')
    })
  }, [])

  const onGlassOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, sliceId: number) => {
      if ((e.target as HTMLElement).closest('textarea')) return
      setSelectedSliceId(sliceId)
      scrollToTableRow(sliceId)
    },
    [scrollToTableRow],
  )

  const onGlassTextareaFocus = useCallback(
    (sliceId: number) => {
      setSelectedSliceId(sliceId)
      scrollToTableRow(sliceId)
    },
    [scrollToTableRow],
  )

  const onTableRowClick = useCallback(
    (e: React.MouseEvent<HTMLTableRowElement>, sliceId: number) => {
      if ((e.target as HTMLElement).closest('textarea')) return
      setSelectedSliceId(sliceId)
      scrollToOverlay(sliceId)
    },
    [scrollToOverlay],
  )

  const onTranslationChange = useCallback(
    (sliceId: number, value: string) => {
      updateTranslated(sliceId, value)
    },
    [updateTranslated],
  )

  const onTableTranslationFocus = useCallback(
    (sliceId: number) => {
      setSelectedSliceId(sliceId)
      scrollToOverlay(sliceId)
    },
    [scrollToOverlay],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedSliceId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!Number.isFinite(chapterId) || !chapter) {
    return <Navigate to="/dashboard/chapters" replace />
  }

  const nw = imgNatural.w
  const nh = imgNatural.h

  return (
    <div className="chapter-editor-page">
      <header className="chapter-editor-header">
        <Link to="/dashboard/chapters" className="chapter-editor-back">
          ← К списку глав
        </Link>
        <h1 className="chapter-editor-title">
          {chapter.title} № {chapter.number}
        </h1>
      </header>

      <div className="chapter-editor-split">
        <div className="chapter-editor-pane chapter-editor-pane--left">
          <div ref={tableWrapRef} className="chapter-editor-table-wrap">
            <table className="chapter-editor-table">
              <thead>
                <tr>
                  <th scope="col">Оригинал</th>
                  <th scope="col">Перевод</th>
                </tr>
              </thead>
              <tbody>
                {slices.map((row) => (
                  <tr
                    key={row.slice_id}
                    ref={(el) => setRowRef(row.slice_id, el)}
                    className={
                      selectedSliceId === row.slice_id
                        ? 'chapter-editor-table-row chapter-editor-table-row--selected'
                        : 'chapter-editor-table-row'
                    }
                    onClick={(e) => onTableRowClick(e, row.slice_id)}
                  >
                    <td className="chapter-editor-table-cell chapter-editor-table-cell--original">
                      <span className="chapter-editor-original-text">{row.text}</span>
                    </td>
                    <td className="chapter-editor-table-cell chapter-editor-table-cell--translation">
                      <ChapterEditorAutosizeTextarea
                        className="chapter-editor-translation-input"
                        value={row.translated}
                        onChange={(v) => onTranslationChange(row.slice_id, v)}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={() => onTableTranslationFocus(row.slice_id)}
                        ariaLabel={`Перевод для фрагмента ${row.slice_id}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="chapter-editor-divider" aria-hidden />
        <div className="chapter-editor-pane chapter-editor-pane--right">
          <div className="chapter-editor-scan-viewport">
            <div className="chapter-editor-scan-stack">
              <img
                src={scanPlaceholder}
                alt={`Скан: ${chapter.title}, глава ${chapter.number}`}
                className="chapter-editor-scan-img"
                decoding="async"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                onLoad={(e) => {
                  const im = e.currentTarget
                  setImgNatural({ w: im.naturalWidth, h: im.naturalHeight })
                }}
              />
              {nw > 0 &&
                nh > 0 &&
                slices.map((row) => {
                  const pos = bboxToPercentStyle(row.bbox, nw, nh)
                  return (
                    <div
                      key={row.slice_id}
                      ref={(el) => setOverlayRef(row.slice_id, el)}
                      className={
                        selectedSliceId === row.slice_id
                          ? 'chapter-editor-glass chapter-editor-glass--selected'
                          : 'chapter-editor-glass'
                      }
                      style={{
                        left: pos.left,
                        top: pos.top,
                        width: pos.width,
                        height: pos.height,
                      }}
                      role="group"
                      aria-label={`Фрагмент ${row.slice_id} на скане`}
                      onClick={(e) => onGlassOverlayClick(e, row.slice_id)}
                    >
                      <textarea
                        className="chapter-editor-glass-textarea"
                        value={row.translated}
                        onChange={(e) => onTranslationChange(row.slice_id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={() => onGlassTextareaFocus(row.slice_id)}
                        spellCheck
                        aria-label={`Перевод фрагмента ${row.slice_id} на скане`}
                      />
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
