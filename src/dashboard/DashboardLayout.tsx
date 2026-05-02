import { useMemo } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { usePipeline } from './context/usePipeline'
import Sidebar from './components/Sidebar'
import { DASHBOARD_MENU_ITEMS } from './dashboardMenu'

function segmentFromPath(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, '')
  if (/\/chapters\/[^/]+\/edit$/.test(normalized)) return 'chapters'
  if (/\/projects\/[^/]+\/glossary\/?$/.test(normalized)) return 'projects'
  const parts = normalized.split('/')
  const last = parts[parts.length - 1] ?? 'review'
  return last === 'dashboard' ? 'review' : last
}

export default function DashboardLayout() {
  const { soloMode } = usePipeline()
  const location = useLocation()

  const visibleMenuItems = useMemo(
    () => DASHBOARD_MENU_ITEMS.filter((item) => item.key !== 'tasks' || !soloMode),
    [soloMode],
  )

  const segment = segmentFromPath(location.pathname)

  if (soloMode && segment === 'tasks') {
    return <Navigate to="/dashboard/review" replace />
  }

  return (
    <div className="dashboard-root dashboard-layout" data-dashboard-segment={segment}>
      <Sidebar menuItems={visibleMenuItems} />

      <main className="dashboard-main">
        <section className="dashboard-content">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
