import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { Header, type HeaderVariant } from './Header'
import { HeroComicFrameBorder } from './HeroComicFrameBorder'
import { PageScaler } from './PageScaler'
import { useViewportScale } from '../hooks/useViewportScale'

type LayoutProps = {
  hero?: ReactNode
  children?: ReactNode
  headerVariant?: HeaderVariant
}

export function Layout({ hero, children, headerVariant = 'full' }: LayoutProps) {
  const HEADER_SCREEN_OFFSET = 15
  const { pathname } = useLocation()
  const { scale } = useViewportScale(1400)
  const headerMeasureRef = useRef<HTMLDivElement | null>(null)
  const [headerDesignHeight, setHeaderDesignHeight] = useState(58)
  const headerMode = pathname === '/' ? 'sticky' : 'fixed'
  const headerVisualHeight = headerDesignHeight * scale

  useLayoutEffect(() => {
    function updateHeight() {
      const el = headerMeasureRef.current
      if (!el) return
      setHeaderDesignHeight(el.offsetHeight || 58)
    }
    const target = headerMeasureRef.current
    if (!target) return
    updateHeight()
    const ro = new ResizeObserver(updateHeight)
    ro.observe(target)
    return () => ro.disconnect()
  }, [])

  const contentStyle = useMemo<CSSProperties>(() => {
    const occupiedHeaderHeight = headerVisualHeight + HEADER_SCREEN_OFFSET
    if (headerMode === 'sticky' && hero != null) {
      return { marginTop: `${-occupiedHeaderHeight}px` }
    }
    if (headerMode === 'fixed') {
      return { paddingTop: `${occupiedHeaderHeight}px` }
    }
    return {}
  }, [headerMode, hero, headerVisualHeight])

  return (
    <>
      <div className={`global-page-header global-page-header--${headerMode}`}>
        <div className="global-page-header__flow" style={{ height: `${headerVisualHeight + HEADER_SCREEN_OFFSET}px` }} />
        <div
          className="global-page-header__scaled"
          style={{ top: `${HEADER_SCREEN_OFFSET}px`, transform: scale === 1 ? 'scale(1)' : `scale(${scale})` }}
        >
          <div ref={headerMeasureRef} className="global-page-header__inner">
            <Header variant={headerVariant} />
          </div>
        </div>
      </div>
      <PageScaler className="layout-page-scaler" style={contentStyle}>
        <div className={`app-shell${hero != null ? ' app-shell--with-hero' : ''}`}>
        <div className="app-shell__body">
          {hero != null ? (
            <div className="hero-section-frame">
              <HeroComicFrameBorder />
              <div className="hero-header-slot" style={{ height: `${headerDesignHeight}px` }} aria-hidden />
              <main className="app-main">{hero}</main>
            </div>
          ) : null}
          {children ? <div className="app-sections">{children}</div> : null}
          <Footer />
        </div>
        </div>
      </PageScaler>
    </>
  )
}
