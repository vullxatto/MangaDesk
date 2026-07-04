import { useMemo } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { buildDashboardBreadcrumbs } from '../breadcrumbs/buildDashboardBreadcrumbs'
import { usePipeline } from '../context/usePipeline'

function resolveTrashView(
  pathname: string,
  viewParam: string | null,
  fromTrash?: boolean,
  returnTo?: string,
): 'projects' | 'chapters' {
  if (pathname.startsWith('/dashboard/trash')) {
    return viewParam === 'chapters' ? 'chapters' : 'projects'
  }
  if (returnTo?.match(/^\/dashboard\/chapters\/[^/]+\/edit$/)) {
    return 'chapters'
  }
  if (fromTrash) {
    return 'projects'
  }
  return 'projects'
}

export default function DashboardBreadcrumbs() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { projects, chapters } = usePipeline()

  const locationState = location.state as {
    returnTo?: string
    fromTrash?: boolean
    projectTitle?: string
    chapterNumber?: number
  } | null
  const returnTo = locationState?.returnTo
  const fromTrash = locationState?.fromTrash
  const projectTitle = locationState?.projectTitle
  const chapterNumber = locationState?.chapterNumber
  const trashView = resolveTrashView(
    location.pathname,
    searchParams.get('view'),
    fromTrash,
    returnTo,
  )

  const crumbs = useMemo(
    () =>
      buildDashboardBreadcrumbs(location.pathname, projects, chapters, {
        returnTo,
        fromTrash,
        projectTitle,
        chapterNumber,
        trashView,
      }),
    [location.pathname, projects, chapters, returnTo, fromTrash, projectTitle, chapterNumber, trashView],
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
                <Link to={crumb.to!} state={crumb.state} className="dashboard-breadcrumbs-link">
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
