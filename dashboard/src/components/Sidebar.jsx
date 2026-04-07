import {
  BookOpen,
  ChartColumnIncreasing,
  Check,
  FileStack,
  LayoutGrid,
  Settings,
  Users,
} from 'lucide-react'

const icons = {
  review: LayoutGrid,
  tasks: Check,
  projects: BookOpen,
  chapters: FileStack,
  team: Users,
  statistics: ChartColumnIncreasing,
  settings: Settings,
}

function Sidebar({ menuItems, activePage, onPageChange }) {
  return (
    <aside className="dashboard-sidebar">
      <a className="dashboard-brand" href={`${import.meta.env.BASE_URL}index.html`}>
        <span className="dashboard-brand-logo">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="MangaDesk logo" className="dashboard-brand-image" />
        </span>
        <span className="dashboard-brand-text">MangaDesk</span>
      </a>

      <nav className="dashboard-nav">
        {menuItems.map((item) => (
          (() => {
            const Icon = icons[item.key]
            return (
              <button
                key={item.key}
                type="button"
                className={`dashboard-nav-item ${activePage === item.key ? 'is-active' : ''}`}
                onClick={() => onPageChange(item.key)}
              >
                <Icon size={14} />
                {item.label}
              </button>
            )
          })()
        ))}
      </nav>

      <div className="dashboard-user-card">
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
      </div>
    </aside>
  )
}

export default Sidebar
