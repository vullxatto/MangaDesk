import type { ReactNode } from 'react'
import { Footer } from './Footer'
import { Header, type HeaderVariant } from './Header'
import { HeroComicFrameBorder } from './HeroComicFrameBorder'

type LayoutProps = {
  hero?: ReactNode
  children?: ReactNode
  headerVariant?: HeaderVariant
}

export function Layout({ hero, children, headerVariant = 'full' }: LayoutProps) {
  return (
    <div className="app-shell">
      <div className="site-header-bar">
        <Header variant={headerVariant} />
      </div>
      <div className="app-shell__body">
        {hero != null ? (
          <div className="hero-section-frame">
            <HeroComicFrameBorder />
            <main className="app-main">{hero}</main>
          </div>
        ) : null}
        {children ? <div className="app-sections">{children}</div> : null}
        <Footer />
      </div>
    </div>
  )
}
