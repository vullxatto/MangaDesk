import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { useViewportScale } from '../hooks/useViewportScale'

const DESIGN_WIDTH = 1400

type PageScalerProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
  designWidth?: number
}

export function PageScaler({ children, className, style, designWidth = DESIGN_WIDTH }: PageScalerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const { scale, isCompactViewport } = useViewportScale(designWidth)

  useLayoutEffect(() => {
    const root = document.documentElement
    if (isCompactViewport) {
      root.classList.add('viewport-le-1400')
    } else {
      root.classList.remove('viewport-le-1400')
    }

    return () => {
      root.classList.remove('viewport-le-1400')
    }
  }, [isCompactViewport])

  useLayoutEffect(() => {
    const container = containerRef.current
    const wrapper = wrapperRef.current
    if (!container || !wrapper) return

    function syncScaleLayout() {
      const el = wrapperRef.current
      const box = containerRef.current
      if (!el || !box) return
      el.style.transform = scale === 1 ? 'scale(1)' : `scale(${scale})`
      const naturalHeight = el.offsetHeight
      box.style.height = `${naturalHeight * scale}px`
    }

    syncScaleLayout()
    const ro = new ResizeObserver(syncScaleLayout)
    ro.observe(wrapper)

    return () => {
      ro.disconnect()
    }
  }, [scale])

  return (
    <div
      ref={containerRef}
      className={className ? `page-scale-container ${className}` : 'page-scale-container'}
      style={style}
    >
      <div ref={wrapperRef} className="page-scale-wrapper" style={{ ['--page-scale-width' as string]: `${designWidth}px` }}>
        {children}
      </div>
    </div>
  )
}
