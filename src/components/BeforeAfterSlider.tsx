import { ChevronsLeftRight, X } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

export type BeforeAfterSliderProps = {
  beforeSrc: string
  afterSrc: string
  altBefore?: string
  altAfter?: string
  /** Подпись внизу внутри карточки со слайдером */
  caption?: string
  /** Стартовая позиция разделителя, 0–100 (слева «до»). */
  initialPosition?: number
}

/**
 * Сравнение двух изображений: перетаскивание только за центральную ручку со стрелками.
 * Клик по области слайдера (не по ручке) открывает полноэкранный режим с тем же положением разделителя.
 */
export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  altBefore = 'До обработки',
  altAfter = 'После обработки',
  caption,
  initialPosition = 50,
}: BeforeAfterSliderProps) {
  const id = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const fullscreenContainerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const [position, setPosition] = useState(() =>
    Math.min(100, Math.max(0, initialPosition)),
  )
  const [fullscreen, setFullscreen] = useState(false)

  const getActiveContainer = useCallback(() => {
    return fullscreen ? fullscreenContainerRef.current : containerRef.current
  }, [fullscreen])

  const setFromClientX = useCallback((clientX: number) => {
    const el = getActiveContainer()
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = (x / rect.width) * 100
    setPosition(Math.min(100, Math.max(0, pct)))
  }, [getActiveContainer])

  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!draggingRef.current) return
      setFromClientX(e.clientX)
    }
    function onUp() {
      draggingRef.current = false
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [setFromClientX])

  useEffect(() => {
    if (!fullscreen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [fullscreen])

  useEffect(() => {
    if (!fullscreen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreen])

  function onHandlePointerDown(e: React.PointerEvent) {
    e.preventDefault()
    e.stopPropagation()
    draggingRef.current = true
    ;(e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId)
    setFromClientX(e.clientX)
  }

  function onViewportOpenFullscreen(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('.before-after__handle')) return
    setFullscreen(true)
  }

  function renderViewport(
    viewportRef: React.RefObject<HTMLDivElement | null>,
    options: { mode: 'inline' | 'fullscreen' },
  ) {
    const { mode } = options
    const isFs = mode === 'fullscreen'
    return (
      <div
        ref={viewportRef}
        className={
          isFs
            ? 'before-after__viewport before-after__viewport--fullscreen'
            : 'before-after__viewport before-after__viewport--inline'
        }
        aria-hidden={fullscreen && !isFs ? true : undefined}
        aria-label={
          isFs || !fullscreen
            ? `${altBefore} и ${altAfter}. Сравнение: ${Math.round(position)} % слева.`
            : undefined
        }
        onClick={!isFs ? onViewportOpenFullscreen : undefined}
        tabIndex={!isFs ? 0 : undefined}
        onKeyDown={
          !isFs
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setFullscreen(true)
                }
              }
            : undefined
        }
      >
        <img
          className="before-after__img before-after__img--after"
          src={afterSrc}
          alt=""
          draggable={false}
        />
        <div
          className="before-after__before-clip"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <img
            className="before-after__img before-after__img--before"
            src={beforeSrc}
            alt=""
            draggable={false}
          />
        </div>
        <div
          className="before-after__rail"
          style={{ left: `${position}%` }}
          aria-hidden
        >
          <span className="before-after__line" />
          <button
            type="button"
            className="before-after__handle"
            aria-label="Перетащите влево или вправо, чтобы сравнить до и после"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(position)}
            onPointerDown={onHandlePointerDown}
          >
            <ChevronsLeftRight size={18} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>
    )
  }

  function renderCaptionInside(className?: string, captionId?: string) {
    if (!caption) return null
    return (
      <p
        {...(captionId ? { id: captionId } : {})}
        className={['before-after__caption', className].filter(Boolean).join(' ')}
        {...(!captionId ? { 'aria-hidden': true as const } : {})}
      >
        {caption}
      </p>
    )
  }

  const portal =
    fullscreen &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        className="before-after-fs"
        role="dialog"
        aria-modal="true"
        aria-label="Сравнение во весь экран"
      >
        <div
          className="before-after-fs__backdrop"
          onClick={() => setFullscreen(false)}
        />
        <button
          type="button"
          className="before-after-fs__close"
          aria-label="Закрыть полноэкранный просмотр"
          onClick={() => setFullscreen(false)}
        >
          <X size={22} strokeWidth={2.25} aria-hidden />
        </button>
        <div className="before-after-fs__stage">
          <div className="before-after__card before-after__card--fullscreen">
            {renderViewport(fullscreenContainerRef, { mode: 'fullscreen' })}
          </div>
        </div>
      </div>,
      document.body,
    )

  return (
    <figure
      className="before-after"
      aria-labelledby={caption ? `${id}-cap` : undefined}
    >
      <div className="before-after__card">
        {renderViewport(containerRef, { mode: 'inline' })}
        {renderCaptionInside(undefined, `${id}-cap`)}
      </div>
      {portal}
    </figure>
  )
}
