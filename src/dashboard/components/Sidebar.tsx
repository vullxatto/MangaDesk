import {
  BookOpen,
  ChartColumnIncreasing,
  Check,
  FileStack,
  LayoutGrid,
  Settings,
  Users,
} from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { reloadHome } from '../../utils/reloadHome'
import { DASHBOARD_MENU_ITEMS } from '../dashboardMenu'

type MenuItem = (typeof DASHBOARD_MENU_ITEMS)[number]

const icons = {
  review: LayoutGrid,
  tasks: Check,
  projects: BookOpen,
  chapters: FileStack,
  team: Users,
  statistics: ChartColumnIncreasing,
  settings: Settings,
}

function Sidebar({ menuItems }: { menuItems: readonly MenuItem[] }) {
  const location = useLocation()

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

      <Link to="/dashboard/account" className="dashboard-user-card">
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
            <div className="dashboard-user-name">Still Rise</div>
            <div className="dashboard-user-role">Руководитель</div>
          </div>
        </div>
        <div className="dashboard-user-meta">
          <div className="dashboard-user-meta-label">Потрачено токенов</div>
          <div className="dashboard-user-meta-value">4 500 / 20 000 000</div>
        </div>
      </Link>
    </aside>
  )
}

export default Sidebar
