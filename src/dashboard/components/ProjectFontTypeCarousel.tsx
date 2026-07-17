import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, type ReactNode } from 'react'
import { ControlPressButton } from '../../components/ControlPressButton'
import type { ProjectFontTypeSlide } from '../projectFonts'

type ProjectFontTypeCarouselProps = {
  slides: readonly ProjectFontTypeSlide[]
  index: number
  onIndexChange: (index: number) => void
  children: ReactNode
}

export default function ProjectFontTypeCarousel({
  slides,
  index,
  onIndexChange,
  children,
}: ProjectFontTypeCarouselProps) {
  const count = slides.length
  const slide = slides[index]

  const goPrev = useCallback(() => {
    onIndexChange((index - 1 + count) % count)
  }, [count, index, onIndexChange])

  const goNext = useCallback(() => {
    onIndexChange((index + 1) % count)
  }, [count, index, onIndexChange])

  if (!slide) return null

  return (
    <div className="project-font-carousel" aria-roledescription="carousel" aria-label="Шрифты по типу">
      <ControlPressButton
        wrapClassName="article-carousel__nav-wrap project-font-carousel__nav-wrap"
        buttonClassName="article-carousel__nav"
        ariaLabel="Предыдущий тип"
        onClick={goPrev}
      >
        <ChevronLeft size={20} strokeWidth={2.25} aria-hidden />
      </ControlPressButton>

      <div className="project-font-carousel__slide">
        <div className="project-font-carousel__type-head">
          <span className="project-font-carousel__type-label">{slide.label}</span>
          <span className="project-font-carousel__counter" aria-live="polite">
            {index + 1}/{count}
          </span>
        </div>
        {children}
      </div>

      <ControlPressButton
        wrapClassName="article-carousel__nav-wrap project-font-carousel__nav-wrap"
        buttonClassName="article-carousel__nav"
        ariaLabel="Следующий тип"
        onClick={goNext}
      >
        <ChevronRight size={20} strokeWidth={2.25} aria-hidden />
      </ControlPressButton>
    </div>
  )
}
