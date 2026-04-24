import { useLayoutEffect, useState } from 'react'

type ViewportScale = {
  scale: number
  isCompactViewport: boolean
}

export function useViewportScale(designWidth: number): ViewportScale {
  const [scale, setScale] = useState(() => {
    if (typeof window === 'undefined') return 1
    return window.innerWidth >= designWidth ? 1 : window.innerWidth / designWidth
  })

  useLayoutEffect(() => {
    function updateScale() {
      const nextScale = window.innerWidth >= designWidth ? 1 : window.innerWidth / designWidth
      setScale((prevScale) => (Math.abs(prevScale - nextScale) < 0.0001 ? prevScale : nextScale))
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    window.addEventListener('load', updateScale)
    document.addEventListener('DOMContentLoaded', updateScale)

    return () => {
      window.removeEventListener('resize', updateScale)
      window.removeEventListener('load', updateScale)
      document.removeEventListener('DOMContentLoaded', updateScale)
    }
  }, [designWidth])

  return {
    scale,
    isCompactViewport: scale < 1,
  }
}
