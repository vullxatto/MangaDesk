import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ControlPressButton } from './ControlPressButton'

export type ArticleCarouselSlide = {
  src: string
  alt: string
}

type ArticleImageCarouselProps = {
  slides: readonly ArticleCarouselSlide[]
  label: string
}

function CarouselSlide({
  slide,
  onOpenFullscreen,
  interactive,
}: {
  slide: ArticleCarouselSlide
  onOpenFullscreen?: () => void
  interactive?: boolean
}) {
  if (interactive && onOpenFullscreen) {
    return (
      <button
        type="button"
        className="article-mini-card article-carousel__frame article-carousel__frame--interactive"
        aria-label={`Открыть «${slide.alt}» во весь экран`}
        onClick={onOpenFullscreen}
      >
        <img className="article-carousel__image" src={slide.src} alt={slide.alt} draggable={false} />
      </button>
    )
  }

  return (
    <div className="article-mini-card article-carousel__frame">
      <img className="article-carousel__image" src={slide.src} alt={slide.alt} draggable={false} />
    </div>
  )
}

export function ArticleImageCarousel({ slides, label }: ArticleImageCarouselProps) {
  const [index, setIndex] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const count = slides.length
  const slide = slides[index]

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + count) % count)
  }, [count])

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % count)
  }, [count])

  useEffect(() => {
    if (!fullscreen) return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setFullscreen(false)
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }

    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [fullscreen, goPrev, goNext])

  if (!slide) return null

  const portal =
    fullscreen &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        className="before-after-fs article-carousel-fs"
        role="dialog"
        aria-modal="true"
        aria-label={`${label}. Слайд ${index + 1} из ${count}`}
      >
        <div className="before-after-fs__backdrop" onClick={() => setFullscreen(false)} />
        <ControlPressButton
          wrapClassName="before-after-fs__close-wrap"
          buttonClassName="before-after-fs__close"
          ariaLabel="Закрыть полноэкранный просмотр"
          onClick={() => setFullscreen(false)}
        >
          <X size={20} strokeWidth={2.25} aria-hidden />
        </ControlPressButton>
        <div className="before-after-fs__stage">
          <div className="article-carousel article-carousel--fullscreen" aria-hidden>
            <ControlPressButton
              wrapClassName="article-carousel__nav-wrap"
              buttonClassName="article-carousel__nav"
              ariaLabel="Предыдущий слайд"
              onClick={goPrev}
            >
              <ChevronLeft size={20} strokeWidth={2.25} aria-hidden />
            </ControlPressButton>
            <CarouselSlide slide={slide} />
            <ControlPressButton
              wrapClassName="article-carousel__nav-wrap"
              buttonClassName="article-carousel__nav"
              ariaLabel="Следующий слайд"
              onClick={goNext}
            >
              <ChevronRight size={20} strokeWidth={2.25} aria-hidden />
            </ControlPressButton>
          </div>
        </div>
      </div>,
      document.body,
    )

  return (
    <>
      <div className="article-carousel" aria-roledescription="carousel" aria-label={label}>
        <ControlPressButton
          wrapClassName="article-carousel__nav-wrap"
          buttonClassName="article-carousel__nav"
          ariaLabel="Предыдущий слайд"
          onClick={goPrev}
        >
          <ChevronLeft size={20} strokeWidth={2.25} aria-hidden />
        </ControlPressButton>

        <CarouselSlide slide={slide} interactive onOpenFullscreen={() => setFullscreen(true)} />

        <ControlPressButton
          wrapClassName="article-carousel__nav-wrap"
          buttonClassName="article-carousel__nav"
          ariaLabel="Следующий слайд"
          onClick={goNext}
        >
          <ChevronRight size={20} strokeWidth={2.25} aria-hidden />
        </ControlPressButton>
      </div>
      {portal}
    </>
  )
}
