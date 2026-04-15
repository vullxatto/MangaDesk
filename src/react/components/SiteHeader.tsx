import { Moon, Sun, User } from 'lucide-react';
import { Link } from 'react-router-dom';

type SiteHeaderProps = {
  showNav?: boolean;
  hideCabinetButton?: boolean;
  onToggleTheme: () => void;
};

export function SiteHeader({ showNav = false, hideCabinetButton = false, onToggleTheme }: SiteHeaderProps) {
  return (
    <header className="header-fixed">
      <nav className="container nav-glass">
        <Link to="/" className="logo-group">
          <div className="logo-icon">
            <img src="/favicon.svg" alt="MangaDesk Logo" className="main-logo" />
          </div>
          <span className="logo-text">MangaDesk</span>
        </Link>

        {showNav ? (
          <div className="nav-links">
            <a href="#how-it-works">как это работает</a>
            <a href="#features">возможности</a>
            <a href="#pricing">тарифы</a>
            <a href="#faq">faq</a>
          </div>
        ) : null}

        <div className="header-actions">
          <button id="theme-toggle" className="icon-btn" aria-label="Сменить тему" onClick={onToggleTheme}>
            <Sun className="sun-icon" />
            <Moon className="moon-icon" />
          </button>

          {!hideCabinetButton ? (
            <Link className="btn-primary" to="/auth" role="button">
              <User className="user-icon" />
              <span>кабинет</span>
            </Link>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
