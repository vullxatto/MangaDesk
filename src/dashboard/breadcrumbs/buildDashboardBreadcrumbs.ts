import type { ChapterRow, DashboardProject } from '../pipelineTypes'

export type DashboardBreadcrumb = {
  label: string
  to?: string
}

const PAGE_LABELS: Record<string, string> = {
  review: 'Обзор',
  tasks: 'Задачи',
  projects: 'Проекты',
  chapters: 'Главы',
  team: 'Команда',
  account: 'Личный кабинет',
  statistics: 'Статистика',
  trash: 'Корзина',
  settings: 'Настройки',
}

function chapterLabel(chapter: ChapterRow | undefined): string {
  if (!chapter) return 'Глава'
  const title = chapter.title.trim() || 'Глава'
  return `${title} № ${chapter.number}`
}

export function buildDashboardBreadcrumbs(
  pathname: string,
  projects: DashboardProject[],
  chapters: ChapterRow[],
  options?: { returnTo?: string },
): DashboardBreadcrumb[] {
  const crumbs: DashboardBreadcrumb[] = [{ label: 'Кабинет' }]

  const normalized = pathname.replace(/\/+$/, '')
  const tail = normalized.replace(/^\/dashboard\/?/, '')
  const segments = tail ? tail.split('/') : []

  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'review')) {
    crumbs.push({ label: PAGE_LABELS.review })
    return crumbs
  }

  const [section, ...rest] = segments

  if (section === 'projects') {
    const [projectId, subPage] = rest
    if (!projectId) {
      crumbs.push({ label: PAGE_LABELS.projects })
      return crumbs
    }
    crumbs.push({ label: PAGE_LABELS.projects, to: '/dashboard/projects' })
    const project = projects.find((p) => p.id === projectId)
    const projectTitle = project?.title ?? 'Проект'
    if (subPage === 'glossary') {
      const chapterEditMatch = options?.returnTo?.match(/^\/dashboard\/chapters\/([^/]+)\/edit$/)
      if (chapterEditMatch) {
        const chapterId = chapterEditMatch[1]
        const chapter = chapters.find((c) => c.id === chapterId)
        crumbs.push({ label: PAGE_LABELS.chapters, to: '/dashboard/chapters' })
        crumbs.push({
          label: chapterLabel(chapter),
          to: `/dashboard/chapters/${chapterId}/edit`,
        })
        crumbs.push({ label: 'Глоссарий' })
        return crumbs
      }

      crumbs.push({ label: projectTitle })
      crumbs.push({ label: 'Глоссарий' })
      return crumbs
    }
    crumbs.push({ label: projectTitle })
    return crumbs
  }

  if (section === 'chapters') {
    const [chapterId, subPage] = rest
    if (!chapterId) {
      crumbs.push({ label: PAGE_LABELS.chapters })
      return crumbs
    }
    crumbs.push({ label: PAGE_LABELS.chapters, to: '/dashboard/chapters' })
    const chapter = chapters.find((c) => c.id === chapterId)
    if (subPage === 'edit') {
      crumbs.push({ label: chapterLabel(chapter) })
      return crumbs
    }
    crumbs.push({ label: chapterLabel(chapter) })
    return crumbs
  }

  const pageLabel = PAGE_LABELS[section]
  if (pageLabel) {
    crumbs.push({ label: pageLabel })
    return crumbs
  }

  crumbs.push({ label: 'Кабинет' })
  return crumbs
}
