import { useMemo } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePipeline } from './context/usePipeline'
import DashboardBreadcrumbs from './components/DashboardBreadcrumbs'
import DashboardLoadError from './components/DashboardLoadError'
import Sidebar from './components/Sidebar'
import TeamSwitcher from './components/TeamSwitcher'
import { DASHBOARD_MENU_ITEMS } from './dashboardMenu'

function segmentFromPath(pathname: string, fromTasks?: boolean): string {
  const normalized = pathname.replace(/\/+$/, '')
  if (/\/chapters\/[^/]+\/edit$/.test(normalized)) return fromTasks ? 'tasks' : 'chapters'
  if (/\/projects\/[^/]+\/glossary\/?$/.test(normalized)) return fromTasks ? 'tasks' : 'projects'
  const parts = normalized.split('/')
  const last = parts[parts.length - 1] ?? 'review'
  return last === 'dashboard' ? 'review' : last
}

export default function DashboardLayout() {
  const { soloMode, dashboardError, dashboardLoading, refreshDashboard, clearDashboardError } = usePipeline()
  const { teams, currentTeamId } = useAuth()
  const location = useLocation()

  const isPersonalTeam = useMemo(() => {
    const t = teams.find((x) => x.id === currentTeamId)
    return !!t?.is_personal
  }, [teams, currentTeamId])

  const hideTasks = soloMode || isPersonalTeam

  const visibleMenuItems = useMemo(
    () => DASHBOARD_MENU_ITEMS.filter((item) => item.key !== 'tasks' || !hideTasks),
    [hideTasks],
  )

  const fromTasks = (location.state as { fromTasks?: boolean } | null)?.fromTasks === true
  const segment = segmentFromPath(location.pathname, fromTasks)

  if (hideTasks && segment === 'tasks') {
    return <Navigate to="/dashboard/review" replace />
  }

  return (
    <div className="dashboard-root" data-dashboard-segment={segment}>
      <div className="dashboard-layout">
        <Sidebar menuItems={visibleMenuItems} />

        <div className="dashboard-main-column">
          <div className="dashboard-top-bar">
            <TeamSwitcher />
            <DashboardBreadcrumbs />
          </div>
          <main className="dashboard-main">
            <section className="dashboard-content">
              {dashboardError ? (
                <DashboardLoadError
                  message={dashboardError}
                  onRetry={() => void refreshDashboard()}
                  onClose={clearDashboardError}
                  retrying={dashboardLoading}
                />
              ) : (
                <Outlet />
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
