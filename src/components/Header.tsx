import { Sun, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { reloadHome } from '../utils/reloadHome'

export type HeaderVariant = 'full' | 'minimal'

type HeaderProps = {
  /** `minimal` — только логотип и действия, без ссылок по секциям лендинга. */
  variant?: HeaderVariant
}

export function Header({ variant = 'full' }: HeaderProps) {
  const minimal = variant === 'minimal'

  return (
    <header className={`site-header${minimal ? ' site-header--minimal' : ''}`}>
      <div className="site-header__inner">
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
            <Link to={{ pathname: '/', hash: 'how' }}>Как это работает</Link>
            <Link to={{ pathname: '/', hash: 'features' }}>Возможности</Link>
            <Link to={{ pathname: '/', hash: 'articles' }}>Статьи</Link>
            <Link to={{ pathname: '/', hash: 'pricing' }}>Тарифы</Link>
            <Link to={{ pathname: '/', hash: 'faq' }}>Вопросы</Link>
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
    </header>
  )
}
