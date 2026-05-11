import { useMemo } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePipeline } from './context/usePipeline'
import Sidebar from './components/Sidebar'
import TeamSwitcher from './components/TeamSwitcher'
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
  const { soloMode, dashboardError } = usePipeline()
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

  const segment = segmentFromPath(location.pathname)

  if (hideTasks && segment === 'tasks') {
    return <Navigate to="/dashboard/review" replace />
  }

  return (
    <div className="dashboard-root" data-dashboard-segment={segment}>
      <div className="dashboard-top-bar">
        <TeamSwitcher />
      </div>
      <div className="dashboard-layout dashboard-body-row">
        <Sidebar menuItems={visibleMenuItems} />

        <main className="dashboard-main">
        {dashboardError ? (
          <div
            className="dashboard-content"
            style={{
              padding: '10px 16px',
              background: 'rgba(180,40,40,0.12)',
              color: '#b91c1c',
              fontSize: 14,
            }}
            role="alert"
          >
            {dashboardError}
          </div>
        ) : null}
        <section className="dashboard-content">
          <Outlet />
        </section>
      </main>
      </div>
    </div>
  )
}
