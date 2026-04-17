import type { ReactNode } from 'react'
import { Footer } from './Footer'
import { Header, type HeaderVariant } from './Header'

type LayoutProps = {
  /** Если не передан — без верхнего hero-блока (только шапка сайта и контент). */
  hero?: ReactNode
  children?: ReactNode
  /** `minimal` — шапка как на лендинге, но без ссылок на секции (статьи, вопросы и т.д.). */
  headerVariant?: HeaderVariant
}

export function Layout({ hero, children, headerVariant = 'full' }: LayoutProps) {
  return (
    <div className="app-shell">
      <div className="site-header-bar">
        <Header variant={headerVariant} />
      </div>
      {hero != null ? (
        <div className="hero-section-frame">
          <main className="app-main">{hero}</main>
        </div>
      ) : null}
      {children ? <div className="app-sections">{children}</div> : null}
      <Footer />
    </div>
  )
}
