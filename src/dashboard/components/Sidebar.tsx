import {
  BookOpen,
  Check,
  FileStack,
  LayoutGrid,
  LogOut,
  ShoppingBasket,
  SlidersHorizontal,
  UserCircle2,
  Users,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { reloadHome } from '../../utils/reloadHome'
import { DASHBOARD_MENU_ITEMS } from '../dashboardMenu'

type MenuItem = (typeof DASHBOARD_MENU_ITEMS)[number]

const icons = {
  review: LayoutGrid,
  tasks: Check,
  projects: BookOpen,
  chapters: FileStack,
  team: Users,
}

function Sidebar({ menuItems }: { menuItems: readonly MenuItem[] }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  function handleLogout() {
    logout()
    setMenuOpen(false)
    void navigate('/auth', { replace: true })
  }

  return (
    <aside className="dashboard-sidebar">
      <Link className="site-logo dashboard-sidebar-brand" to="/" onClick={reloadHome} aria-label="MangaDesk">
        <span className="site-logo-box" aria-hidden>
          <img className="site-logo-icon" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" />
        </span>
        <span className="site-logo-word" aria-hidden>
          <span className="site-logo-char site-logo-char--big">M</span>
          <span className="site-logo-char">anga</span>
          <span className="site-logo-char site-logo-char--big">D</span>
          <span className="site-logo-char">esk</span>
        </span>
      </Link>

      <nav className="dashboard-nav">
        {menuItems.map((item) => {
          const Icon = icons[item.key]
          return (
            <NavLink
              key={item.key}
              to={`/dashboard/${item.key}`}
              className={({ isActive }) => {
                const chaptersNested =
                  item.key === 'chapters' && location.pathname.startsWith('/dashboard/chapters/')
                const projectsNested =
                  item.key === 'projects' && location.pathname.startsWith('/dashboard/projects/')
                const active = isActive || chaptersNested || projectsNested
                return `dashboard-nav-item${active ? ' is-active' : ''}`
              }}
            >
              <Icon size={14} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="dashboard-user-card dashboard-user-menu-wrap" ref={menuRef}>
        {menuOpen ? (
          <div className="dashboard-user-menu" role="menu">
            <Link className="dashboard-user-menu-item" to="/dashboard/account" onClick={() => setMenuOpen(false)}>
              <UserCircle2 size={15} strokeWidth={1.9} aria-hidden /> Кабинет
            </Link>
            <Link className="dashboard-user-menu-item" to="/dashboard/statistics" onClick={() => setMenuOpen(false)}>
              <SlidersHorizontal size={15} strokeWidth={1.9} aria-hidden /> Статистика
            </Link>
            <Link className="dashboard-user-menu-item" to="/dashboard/trash" onClick={() => setMenuOpen(false)}>
              <ShoppingBasket size={15} strokeWidth={1.9} aria-hidden /> Корзина
            </Link>
            <Link className="dashboard-user-menu-item" to="/dashboard/settings" onClick={() => setMenuOpen(false)}>
              <SlidersHorizontal size={15} strokeWidth={1.9} aria-hidden /> Настройки
            </Link>
            <button type="button" className="dashboard-user-menu-item" onClick={handleLogout}>
              <LogOut size={15} strokeWidth={1.9} aria-hidden /> Выйти
            </button>
          </div>
        ) : null}
        <button
          type="button"
          className="dashboard-user-card-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label="Открыть меню профиля"
        >
        <div className="dashboard-user-top">
          <div className="dashboard-user-avatar-wrap">
            <div className="dashboard-user-avatar">
              <img
                src="https://picsum.photos/seed/mangadesk-sidebar-user/80/80"
                alt=""
                className="dashboard-user-avatar-img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <span className="dashboard-user-avatar-dot" role="img" aria-label="В сети" />
          </div>
          <div>
            <div className="dashboard-user-name">{user?.username ?? 'Пользователь'}</div>
            <div className="dashboard-user-role">Руководитель</div>
          </div>
        </div>
        <div className="dashboard-user-meta">
          <div className="dashboard-user-meta-label">Потрачено токенов</div>
          <div className="dashboard-user-meta-value">4 500 / 20 000 000</div>
        </div>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
