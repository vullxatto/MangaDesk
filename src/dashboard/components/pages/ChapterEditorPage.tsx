import type { MouseEvent as ReactMouseEvent } from 'react'
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
import { getSelectionTextInContainer } from '../../glossary/getSelectionInContainer'
import { AddGlossaryEntryModal } from '../AddGlossaryEntryModal'
import { GlossaryContextMenu } from '../GlossaryContextMenu'
import {
  bboxToPercentStyle,
  type ChapterEditorApiResponse,
  type ChapterEditorPagePayload,
  type ChapterTranslationSlice,
} from '../../chapterEditorModel'
import { apiDownloadFile, apiFileUrl, apiGet, apiPostJson, apiPutJson } from '../../../lib/api'
import scanPlaceholder from '../../../assets/projects - titles/title.png'

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
  onClick: (e: ReactMouseEvent<HTMLTextAreaElement>) => void
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

const GLASS_FONT_MIN = 5
const GLASS_FONT_MAX_CAP = 520

function glassClearVerticalPadding(textarea: HTMLTextAreaElement) {
  textarea.style.paddingTop = '0px'
  textarea.style.paddingBottom = '0px'
}

function glassApplyVerticalCenterPadding(textarea: HTMLTextAreaElement) {
  glassClearVerticalPadding(textarea)
  void textarea.offsetHeight
  const slack = textarea.clientHeight - textarea.scrollHeight
  if (slack <= 0) return
  const top = Math.floor(slack / 2)
  const bottom = slack - top
  textarea.style.paddingTop = `${top}px`
  textarea.style.paddingBottom = `${bottom}px`
}

function fitGlassTextareaFontSize(textarea: HTMLTextAreaElement) {
  glassClearVerticalPadding(textarea)
  const w = textarea.clientWidth
  const h = textarea.clientHeight
  if (w < 4 || h < 4) return

  const fitsStrict = () =>
    textarea.scrollHeight <= textarea.clientHeight
    && textarea.scrollWidth <= textarea.clientWidth

  if (!textarea.value.trim()) {
    const fs = Math.min(
      GLASS_FONT_MAX_CAP,
      Math.max(GLASS_FONT_MIN, Math.floor(h * 0.72)),
    )
    textarea.style.fontSize = `${fs}px`
    void textarea.offsetHeight
    let cur = fs
    while (!fitsStrict() && cur > GLASS_FONT_MIN) {
      cur -= 1
      textarea.style.fontSize = `${cur}px`
      void textarea.offsetHeight
    }
    glassApplyVerticalCenterPadding(textarea)
    return
  }

  const fitsAt = (px: number) => {
    textarea.style.fontSize = `${px}px`
    void textarea.offsetHeight
    return fitsStrict()
  }

  const hi = Math.min(
    GLASS_FONT_MAX_CAP,
    Math.max(GLASS_FONT_MIN + 1, Math.ceil(Math.hypot(w, h))),
  )

  let best = GLASS_FONT_MIN
  let lo = GLASS_FONT_MIN
  let high = hi
  while (lo <= high) {
    const mid = Math.ceil((lo + high) / 2)
    if (fitsAt(mid)) {
      best = mid
      lo = mid + 1
    } else {
      high = mid - 1
    }
  }
  textarea.style.fontSize = `${best}px`
  void textarea.offsetHeight

  let guard = 0
  while (!fitsStrict() && guard < 64) {
    guard += 1
    const cur = Math.max(
      GLASS_FONT_MIN,
      Math.round(parseFloat(getComputedStyle(textarea).fontSize) || best),
    )
    if (cur <= GLASS_FONT_MIN) break
    textarea.style.fontSize = `${cur - 1}px`
    void textarea.offsetHeight
  }

  glassApplyVerticalCenterPadding(textarea)
  guard = 0
  while (!fitsStrict() && guard < 64) {
    guard += 1
    glassClearVerticalPadding(textarea)
    const cur = Math.max(
      GLASS_FONT_MIN,
      Math.round(parseFloat(getComputedStyle(textarea).fontSize) || GLASS_FONT_MIN),
    )
    if (cur <= GLASS_FONT_MIN) break
    textarea.style.fontSize = `${cur - 1}px`
    void textarea.offsetHeight
    glassApplyVerticalCenterPadding(textarea)
    void textarea.offsetHeight
  }
}

function ChapterEditorGlassTextarea({
  value,
  onChange,
  onClick,
  onFocus,
  ariaLabel,
  className,
}: {
  value: string
  onChange: (value: string) => void
  onClick: (e: ReactMouseEvent<HTMLTextAreaElement>) => void
  onFocus?: () => void
  ariaLabel: string
  className: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const refit = useCallback(() => {
    const ta = ref.current
    if (!ta) return
    fitGlassTextareaFontSize(ta)
  }, [value])

  useLayoutEffect(() => {
    refit()
  }, [refit])

  useEffect(() => {
    const ta = ref.current
    if (!ta) return
    const glass = ta.parentElement
    if (!glass || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => refit())
    ro.observe(glass)
    return () => ro.disconnect()
  }, [refit])

  useEffect(() => {
    const p = document.fonts?.ready
    if (p && typeof p.then === 'function') void p.then(() => refit())
  }, [refit])

  useEffect(() => {
    window.addEventListener('resize', refit)
    return () => window.removeEventListener('resize', refit)
  }, [refit])

  return (
    <textarea
      ref={ref}
      className={className}
      value={value}
      spellCheck
      aria-label={ariaLabel}
      onClick={onClick}
      onFocus={onFocus}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function normalizeSlice(s: ChapterTranslationSlice): ChapterTranslationSlice {
  return {
    id: s.id,
    slice_id: s.slice_id,
    type: s.type ?? 'bubble',
    text: s.text ?? '',
    bbox: (s.bbox?.length === 4
      ? [s.bbox[0], s.bbox[1], s.bbox[2], s.bbox[3]]
      : [0, 0, 0, 0]) as [number, number, number, number],
    confidence: s.confidence ?? undefined,
    translated: s.translated ?? '',
    page_order: typeof s.page_order === 'number' ? s.page_order : undefined,
  }
}

export default function ChapterEditorPage() {
  const { chapterId: chapterIdParam } = useParams<{ chapterId: string }>()
  const chapterId = chapterIdParam?.trim() ?? ''
  const { chapters, addGlossaryEntry } = usePipeline()

  const chapter = useMemo(() => {
    if (!chapterId) return undefined
    return chapters.find((c) => c.id === chapterId)
  }, [chapters, chapterId])

  const [slices, setSlices] = useState<ChapterTranslationSlice[]>([])
  const [layout, setLayout] = useState<'flat' | 'multi'>('flat')
  const [editorPages, setEditorPages] = useState<ChapterEditorPagePayload[]>([])
  const [pageDims, setPageDims] = useState<Record<number, { w: number; h: number }>>({})
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null)
  const [imgNatural, setImgNatural] = useState<{ w: number; h: number }>({ w: 0, h: 0 })
  const [scanSrc, setScanSrc] = useState<string>(scanPlaceholder)
  const [editorLoading, setEditorLoading] = useState(true)
  const [editorError, setEditorError] = useState<string | null>(null)
  const [editorHead, setEditorHead] = useState<{
    chapter_number: number
    chapter_title: string | null
    project_id: string | null
  } | null>(null)

  const tableWrapRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map())
  const overlayRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const [glossaryMenu, setGlossaryMenu] = useState<{
    x: number
    y: number
    source: string
  } | null>(null)
  const [glossaryModal, setGlossaryModal] = useState<{ open: boolean; initialSource: string }>({
    open: false,
    initialSource: '',
  })
  const [glossaryModalInstance, setGlossaryModalInstance] = useState(0)
  const [psdExporting, setPsdExporting] = useState(false)
  const [psdBanner, setPsdBanner] = useState<string | null>(null)

  const setRowRef = useCallback((rowId: number, el: HTMLTableRowElement | null) => {
    if (el) rowRefs.current.set(rowId, el)
    else rowRefs.current.delete(rowId)
  }, [])

  const setOverlayRef = useCallback((rowId: number, el: HTMLDivElement | null) => {
    if (el) overlayRefs.current.set(rowId, el)
    else overlayRefs.current.delete(rowId)
  }, [])

  const updateTranslated = useCallback((rowId: number, value: string) => {
    setSlices((prev) => prev.map((s) => (s.id === rowId ? { ...s, translated: value } : s)))
  }, [])

  const scrollToOverlay = useCallback((rowId: number) => {
    requestAnimationFrame(() => {
      overlayRefs.current.get(rowId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      })
    })
  }, [])

  const scrollToTableRow = useCallback((rowId: number) => {
    requestAnimationFrame(() => {
      const container = tableWrapRef.current
      const row = rowRefs.current.get(rowId)
      if (!container || !row) return
      scrollTableRowToCenterClamped(container, row, 'smooth')
    })
  }, [])

  const onGlassOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, rowId: number) => {
      if ((e.target as HTMLElement).closest('textarea')) return
      setSelectedRowId(rowId)
      scrollToTableRow(rowId)
    },
    [scrollToTableRow],
  )

  const onGlassTextareaFocus = useCallback(
    (rowId: number) => {
      setSelectedRowId(rowId)
      scrollToTableRow(rowId)
    },
    [scrollToTableRow],
  )

  const onTableRowClick = useCallback(
    (e: React.MouseEvent<HTMLTableRowElement>, rowId: number) => {
      if ((e.target as HTMLElement).closest('textarea')) return
      setSelectedRowId(rowId)
      scrollToOverlay(rowId)
    },
    [scrollToOverlay],
  )

  const onTranslationChange = useCallback(
    (rowId: number, value: string) => {
      updateTranslated(rowId, value)
    },
    [updateTranslated],
  )

  const onTableTranslationFocus = useCallback(
    (rowId: number) => {
      setSelectedRowId(rowId)
      scrollToOverlay(rowId)
    },
    [scrollToOverlay],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedRowId(null)
        setGlossaryMenu(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const resolvedProjectId = useMemo(
    () => chapter?.projectId ?? editorHead?.project_id ?? null,
    [chapter?.projectId, editorHead?.project_id],
  )

  const onGlossaryPaneContextMenu = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!resolvedProjectId) return
      const root = e.currentTarget
      const text = getSelectionTextInContainer(root)
      if (!text) return
      e.preventDefault()
      setGlossaryMenu({ x: e.clientX, y: e.clientY, source: text })
    },
    [resolvedProjectId],
  )

  const handleDownloadPsd = useCallback(async () => {
    if (!chapterId) return
    setPsdBanner(null)
    setPsdExporting(true)
    try {
      await apiPutJson(`/chapters/${chapterId}/editor/translation`, {
        slices: slices.map((s) => ({ id: s.id, translated: s.translated })),
      })
      const start = await apiPostJson<{ job_id: string }>(
        `/chapters/${chapterId}/photopea-export/start`,
        {},
      )
      const jid = start.job_id
      // GIMP первый запуск занимает до 3–5 минут; даём 12 минут с запасом.
      const TIMEOUT_MS = 720_000
      const startedAt = Date.now()
      const deadline = startedAt + TIMEOUT_MS

      type JobSt = {
        state: string
        error?: string | null
        storage_key?: string | null
      }
      let last: JobSt = { state: 'queued' }

      while (Date.now() < deadline) {
        last = await apiGet<JobSt>(`/chapters/${chapterId}/photopea-export/jobs/${jid}`)
        if (last.state === 'done' || last.state === 'failed') break

        const elapsed = Math.floor((Date.now() - startedAt) / 1000)
        const stateRu = last.state === 'running' ? 'выполняется' : 'в очереди'
        setPsdBanner(`Экспорт PSD ${stateRu}… ${elapsed}с`)

        // Опрос каждые 2 с — снижаем нагрузку на API
        await new Promise<void>((r) => setTimeout(r, 2000))
      }

      if (last.state === 'done' && last.storage_key) {
        try {
          await apiDownloadFile(last.storage_key, 'chapter.psd')
          setPsdBanner('Файл PSD сохранён в папку загрузок браузера.')
        } catch {
          window.open(apiFileUrl(last.storage_key), '_blank', 'noopener,noreferrer')
          setPsdBanner('Открыта вкладка с файлом — при блокировке загрузок проверьте настройки браузера.')
        }
      } else if (last.state === 'failed') {
        setPsdBanner(last.error?.trim() || 'Не удалось собрать PSD.')
      } else {
        // Превышен лимит ожидания на стороне браузера — сервер может ещё работать
        setPsdBanner(
          `Экспорт PSD занял больше ${Math.round(TIMEOUT_MS / 60000)} мин. ` +
            'Обновите страницу и попробуйте снова; при первом запуске GIMP инициализируется дольше обычного.',
        )
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Ошибка запроса'
      setPsdBanner(msg)
    } finally {
      setPsdExporting(false)
    }
  }, [chapterId, slices])

  const applyEditorPayload = useCallback((data: ChapterEditorApiResponse) => {
    setEditorHead({
      chapter_number: data.chapter_number,
      chapter_title: data.chapter_title,
      project_id: data.project_id,
    })
    setPageDims({})
    const list = Array.isArray(data.slices) ? data.slices : []
    const normalized = list.map((s) => normalizeSlice(s as ChapterTranslationSlice))
    setSlices(normalized)

    if (data.layout === 'multi' && Array.isArray(data.pages) && data.pages.length > 0) {
      setLayout('multi')
      setEditorPages(
        data.pages.map((p) => ({
          order_index: p.order_index,
          storage_key: p.storage_key,
          image_width: p.image_width,
          image_height: p.image_height,
          slices: [],
        })),
      )
      const p0 = data.pages[0]
      setScanSrc(p0.storage_key ? apiFileUrl(p0.storage_key) : scanPlaceholder)
      if (p0.image_width > 0 && p0.image_height > 0) {
        setImgNatural({ w: p0.image_width, h: p0.image_height })
      } else {
        setImgNatural({ w: 0, h: 0 })
      }
    } else {
      setLayout('flat')
      setEditorPages([])
      if (data.storage_key) {
        setScanSrc(apiFileUrl(data.storage_key))
      } else {
        setScanSrc(scanPlaceholder)
      }
      if (typeof data.image_width === 'number' && typeof data.image_height === 'number' && data.image_width > 0) {
        setImgNatural({ w: data.image_width, h: data.image_height })
      } else {
        setImgNatural({ w: 0, h: 0 })
      }
    }
  }, [])

  useEffect(() => {
    if (!chapterId) return
    let cancelled = false
    setEditorLoading(true)
    setEditorError(null)
    void (async () => {
      try {
        const data = await apiGet<ChapterEditorApiResponse>(`/chapters/${chapterId}/editor`)
        if (cancelled) return
        applyEditorPayload(data)
      } catch (e) {
        if (!cancelled) {
          setEditorError(e instanceof Error ? e.message : 'Не удалось загрузить редактор')
          setSlices([])
          setEditorPages([])
          setLayout('flat')
          setScanSrc(scanPlaceholder)
        }
      } finally {
        if (!cancelled) setEditorLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [chapterId, applyEditorPayload])

  if (!chapterId) {
    return <Navigate to="/dashboard/chapters" replace />
  }

  const displayTitle = (chapter?.title ?? editorHead?.chapter_title ?? '').trim() || 'Глава'
  const displayNumber = chapter?.number ?? editorHead?.chapter_number ?? 0

  const nw = imgNatural.w
  const nh = imgNatural.h

  const slicesForPage = useCallback((orderIndex: number) => {
    return slices.filter((s) => (s.page_order ?? 0) === orderIndex)
  }, [slices])

  return (
    <div className="chapter-editor-page">
      <header className="chapter-editor-header">
        <Link to="/dashboard/chapters" className="chapter-editor-back">
          ← К списку глав
        </Link>
        <div className="chapter-editor-title-row">
          <h1 className="chapter-editor-title">
            {displayTitle} № {displayNumber}
          </h1>
          <div className="chapter-editor-header-actions">
            {resolvedProjectId ? (
              <Link
                className="chapter-editor-glossary-btn"
                to={`/dashboard/projects/${resolvedProjectId}/glossary`}
                state={{ returnTo: `/dashboard/chapters/${chapterId}/edit` }}
              >
                Глоссарий
              </Link>
            ) : null}
          </div>
        </div>
        {editorError ? <p className="chapter-editor-banner chapter-editor-banner--error">{editorError}</p> : null}
        {editorLoading ? <p className="chapter-editor-banner">Загрузка…</p> : null}
      </header>

      <div className="chapter-editor-split">
        <div
          className="chapter-editor-pane chapter-editor-pane--left"
          onContextMenu={onGlossaryPaneContextMenu}
        >
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
                    key={row.id}
                    ref={(el) => setRowRef(row.id, el)}
                    className={
                      selectedRowId === row.id
                        ? 'chapter-editor-table-row chapter-editor-table-row--selected'
                        : 'chapter-editor-table-row'
                    }
                    onClick={(e) => onTableRowClick(e, row.id)}
                  >
                    <td className="chapter-editor-table-cell chapter-editor-table-cell--original">
                      <span className="chapter-editor-original-text">
                        {layout === 'multi' ? (
                          <span className="chapter-editor-page-badge">
                            Стр. {(row.page_order ?? 0) + 1}
                            <span className="chapter-editor-page-badge-sep"> · </span>
                          </span>
                        ) : null}
                        {row.text}
                      </span>
                    </td>
                    <td className="chapter-editor-table-cell chapter-editor-table-cell--translation">
                      <ChapterEditorAutosizeTextarea
                        className="chapter-editor-translation-input"
                        value={row.translated}
                        onChange={(v) => onTranslationChange(row.id, v)}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={() => onTableTranslationFocus(row.id)}
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
        <div
          className="chapter-editor-pane chapter-editor-pane--right"
          onContextMenu={onGlossaryPaneContextMenu}
        >
          <div className="chapter-editor-right-toolbar">
            <button
              type="button"
              className="chapter-editor-psd-btn"
              disabled={editorLoading || psdExporting || !chapterId}
              onClick={() => void handleDownloadPsd()}
            >
              {psdExporting ? 'Сборка PSD…' : 'Скачать PSD'}
            </button>
          </div>
          {psdBanner ? (
            <p className="chapter-editor-banner chapter-editor-banner--ok chapter-editor-psd-banner">{psdBanner}</p>
          ) : null}
          <div
            className={
              layout === 'multi'
                ? 'chapter-editor-scan-viewport chapter-editor-scan-viewport--multi'
                : 'chapter-editor-scan-viewport'
            }
          >
            {layout === 'multi' && editorPages.length > 0 ? (
              editorPages.map((page) => {
                const dim = pageDims[page.order_index]
                const pw = dim?.w || page.image_width || 0
                const ph = dim?.h || page.image_height || 0
                const pageRows = slicesForPage(page.order_index)
                return (
                  <div
                    key={page.order_index}
                    className="chapter-editor-scan-stack chapter-editor-scan-stack--page"
                  >
                    <img
                      src={apiFileUrl(page.storage_key)}
                      alt={`${displayTitle}, глава ${displayNumber}, стр. ${page.order_index + 1}`}
                      className="chapter-editor-scan-img"
                      decoding="async"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      onLoad={(e) => {
                        const im = e.currentTarget
                        setPageDims((prev) => ({
                          ...prev,
                          [page.order_index]: { w: im.naturalWidth, h: im.naturalHeight },
                        }))
                      }}
                    />
                    {pw > 0 &&
                      ph > 0 &&
                      pageRows.map((row) => {
                        const pos = bboxToPercentStyle(row.bbox, pw, ph)
                        return (
                          <div
                            key={row.id}
                            ref={(el) => setOverlayRef(row.id, el)}
                            className={
                              selectedRowId === row.id
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
                            aria-label={`Фрагмент ${row.slice_id}, стр. ${page.order_index + 1}`}
                            onClick={(e) => onGlassOverlayClick(e, row.id)}
                          >
                            <ChapterEditorGlassTextarea
                              className="chapter-editor-glass-textarea"
                              value={row.translated}
                              onChange={(v) => onTranslationChange(row.id, v)}
                              onClick={(e) => e.stopPropagation()}
                              onFocus={() => onGlassTextareaFocus(row.id)}
                              ariaLabel={`Перевод фрагмента ${row.slice_id}`}
                            />
                          </div>
                        )
                      })}
                  </div>
                )
              })
            ) : (
              <div className="chapter-editor-scan-stack">
                <img
                  src={scanSrc}
                  alt={`Скан: ${displayTitle}, глава ${displayNumber}`}
                  className="chapter-editor-scan-img"
                  decoding="async"
                  draggable={false}
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
                        key={row.id}
                        ref={(el) => setOverlayRef(row.id, el)}
                        className={
                          selectedRowId === row.id
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
                        onClick={(e) => onGlassOverlayClick(e, row.id)}
                      >
                        <ChapterEditorGlassTextarea
                          className="chapter-editor-glass-textarea"
                          value={row.translated}
                          onChange={(v) => onTranslationChange(row.id, v)}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={() => onGlassTextareaFocus(row.id)}
                          ariaLabel={`Перевод фрагмента ${row.slice_id} на скане`}
                        />
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {resolvedProjectId ? (
        <AddGlossaryEntryModal
          key={glossaryModalInstance}
          open={glossaryModal.open}
          projectLabel={displayTitle}
          initialSource={glossaryModal.initialSource}
          onClose={() => setGlossaryModal({ open: false, initialSource: '' })}
          onSubmit={(source, target) => {
            void addGlossaryEntry(resolvedProjectId, { source, target })
          }}
        />
      ) : null}
      {glossaryMenu && resolvedProjectId ? (
        <GlossaryContextMenu
          x={glossaryMenu.x}
          y={glossaryMenu.y}
          onClose={() => setGlossaryMenu(null)}
          onAdd={() => {
            setGlossaryModalInstance((n) => n + 1)
            setGlossaryModal({ open: true, initialSource: glossaryMenu.source })
            setGlossaryMenu(null)
          }}
        />
      ) : null}
    </div>
  )
}
