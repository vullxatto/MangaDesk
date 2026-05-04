import { useLayoutEffect, useState } from 'react'

type ViewportScale = {
  scale: number
  isCompactViewport: boolean
}

/** Ширина layout viewport без типичных скачков `innerWidth` из‑за скроллбара. */
function readLayoutViewportWidth(): number {
  if (typeof document === 'undefined') return 0
  const doc = document.documentElement
  const w = doc.clientWidth
  return w > 0 ? w : window.innerWidth
}

function computeScale(designWidth: number): number {
  const w = readLayoutViewportWidth()
  if (w <= 0) return 1
  const raw = w >= designWidth ? 1 : w / designWidth
  return Math.round(raw * 10000) / 10000
}

export function useViewportScale(designWidth: number): ViewportScale {
  const [scale, setScale] = useState(() =>
    typeof window === 'undefined' ? 1 : computeScale(designWidth),
  )

  useLayoutEffect(() => {
    let raf = 0

    const commit = () => {
      const next = computeScale(designWidth)
      setScale((prev) => (prev === next ? prev : next))
    }

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        raf = 0
        commit()
      })
    }

    commit()

    window.addEventListener('resize', schedule)
    window.addEventListener('orientationchange', schedule)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('orientationchange', schedule)
    }
  }, [designWidth])

  return {
    scale,
    isCompactViewport: scale < 1,
  }
}
