import { Sun, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useLandingActiveSection } from '../context/LandingScrollSpy'
import { reloadHome } from '../utils/reloadHome'

export type HeaderVariant = 'full' | 'minimal'

type HeaderProps = {
  /** `minimal` — только логотип и действия, без ссылок по секциям лендинга. */
  variant?: HeaderVariant
}

export function Header({ variant = 'full' }: HeaderProps) {
  const minimal = variant === 'minimal'
  const { pathname } = useLocation()
  const landingActive = useLandingActiveSection()
  const scrollActive = pathname === '/' ? landingActive : null

  return (
    <header className={`site-header${minimal ? ' site-header--minimal' : ''}`}>
      <div className="site-header__inner">
        <div className="site-header__glass">
          <a className="site-logo" href="/" onClick={reloadHome} aria-label="MangaDesk">
            <span className="site-logo-box" aria-hidden>
              <img className="site-logo-icon" src="/favicon.svg" alt="" />
            </span>
            <span className="site-logo-word" aria-hidden>
              <span className="site-logo-char site-logo-char--big">M</span>
              <span className="site-logo-char">anga</span>
              <span className="site-logo-char site-logo-char--big">D</span>
              <span className="site-logo-char">esk</span>
            </span>
          </a>
          {!minimal ? (
            <nav className="site-nav" aria-label="Основная навигация">
              <Link
                to={{ pathname: '/', hash: 'how' }}
                aria-current={scrollActive === 'how' ? 'location' : undefined}
                className={scrollActive === 'how' ? 'site-nav__link--active' : undefined}
              >
                Как это работает
              </Link>
              <Link
                to={{ pathname: '/', hash: 'features' }}
                aria-current={scrollActive === 'features' ? 'location' : undefined}
                className={scrollActive === 'features' ? 'site-nav__link--active' : undefined}
              >
                Возможности
              </Link>
              <Link
                to={{ pathname: '/', hash: 'articles' }}
                aria-current={scrollActive === 'articles' ? 'location' : undefined}
                className={scrollActive === 'articles' ? 'site-nav__link--active' : undefined}
              >
                Статьи
              </Link>
              <Link
                to={{ pathname: '/', hash: 'pricing' }}
                aria-current={scrollActive === 'pricing' ? 'location' : undefined}
                className={scrollActive === 'pricing' ? 'site-nav__link--active' : undefined}
              >
                Тарифы
              </Link>
              <Link
                to={{ pathname: '/', hash: 'faq' }}
                aria-current={scrollActive === 'faq' ? 'location' : undefined}
                className={scrollActive === 'faq' ? 'site-nav__link--active' : undefined}
              >
                Вопросы
              </Link>
            </nav>
          ) : null}
          <div className="header-actions">
            <span className="btn-press-wrap btn-press-wrap--design">
              <button className="btn-icon btn-press" type="button" aria-label="Тема">
                <Sun size={13} strokeWidth={2} />
              </button>
            </span>
            <span className="btn-press-wrap btn-press-wrap--design">
              <Link className="btn-cabinet btn-press" to="/auth">
                <User size={13} strokeWidth={2} aria-hidden />
                Кабинет
              </Link>
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
