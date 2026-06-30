import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { buildDashboardBreadcrumbs } from '../breadcrumbs/buildDashboardBreadcrumbs'
import { usePipeline } from '../context/usePipeline'

export default function DashboardBreadcrumbs() {
  const location = useLocation()
  const { projects, chapters } = usePipeline()

  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo

  const crumbs = useMemo(
    () => buildDashboardBreadcrumbs(location.pathname, projects, chapters, { returnTo }),
    [location.pathname, projects, chapters, returnTo],
  )

  if (crumbs.length === 0) return null

  return (
    <nav className="dashboard-breadcrumbs" aria-label="Навигация по кабинету">
      <ol className="dashboard-breadcrumbs-list">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          const isLink = !isLast && crumb.to

          return (
            <li key={`${crumb.label}-${index}`}>
              {index > 0 ? (
                <span className="dashboard-breadcrumbs-sep" aria-hidden>
                  /
                </span>
              ) : null}
              {isLink ? (
                <Link to={crumb.to!} className="dashboard-breadcrumbs-link">
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast ? 'dashboard-breadcrumbs-current' : 'dashboard-breadcrumbs-static'
                  }
                  aria-current={isLast ? 'page' : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
