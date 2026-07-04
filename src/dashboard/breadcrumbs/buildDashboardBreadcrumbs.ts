import type { ChapterRow, DashboardProject } from '../pipelineTypes'

export type DashboardBreadcrumb = {
  label: string
  to?: string
  state?: Record<string, unknown>
}

const PAGE_LABELS: Record<string, string> = {
  review: 'Обзор',
  tasks: 'Задачи',
  projects: 'Проекты',
  chapters: 'Главы',
  team: 'Команда',
  statistics: 'Статистика',
  trash: 'Удалённое',
  settings: 'Настройки',
}

const TRASH_CHAPTERS_LABEL = 'Удалённые главы'
const TRASH_PROJECTS_LABEL = 'Удалённые проекты'

function trashProjectsListPath() {
  return '/dashboard/trash?view=projects'
}

function deletedChapterLabel(projectTitle: string | undefined, chapterNumber: number | undefined, chapter?: ChapterRow) {
  if (chapter) return chapterLabel(chapter)
  const title = projectTitle?.trim() || 'Глава'
  if (typeof chapterNumber === 'number' && chapterNumber > 0) {
    return `${title} № ${chapterNumber}`
  }
  return title
}

function trashChaptersListPath(projectTitle?: string) {
  const title = projectTitle?.trim()
  if (!title || title === 'Глава') return '/dashboard/trash?view=chapters'
  return `/dashboard/trash?view=chapters&project=${encodeURIComponent(title)}`
}

function trashChapterEditorState(
  projectId: string,
  projectTitle: string,
  chapterNumber?: number,
): Record<string, unknown> {
  return {
    fromTrash: true,
    projectId,
    projectTitle,
    ...(typeof chapterNumber === 'number' ? { chapterNumber } : {}),
  }
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
  options?: {
    returnTo?: string
    fromTrash?: boolean
    projectTitle?: string
    chapterNumber?: number
    trashView?: 'projects' | 'chapters'
  },
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

  if (section === 'trash') {
    if (options?.trashView === 'chapters') {
      crumbs.push({ label: TRASH_CHAPTERS_LABEL })
    } else {
      crumbs.push({ label: TRASH_PROJECTS_LABEL })
    }
    return crumbs
  }

  if (section === 'projects') {
    const [projectId, subPage] = rest
    if (!projectId) {
      crumbs.push({ label: PAGE_LABELS.projects })
      return crumbs
    }
    const project = projects.find((p) => p.id === projectId)
    const projectTitle = options?.projectTitle?.trim() || project?.title || 'Проект'
    const fromTrash = options?.fromTrash === true || (projectId != null && project == null)

    if (!fromTrash) {
      crumbs.push({ label: PAGE_LABELS.projects, to: '/dashboard/projects' })
    }

    if (subPage === 'glossary') {
      const chapterEditMatch = options?.returnTo?.match(/^\/dashboard\/chapters\/([^/]+)\/edit$/)

      if (fromTrash && chapterEditMatch) {
        const chapterId = chapterEditMatch[1]
        const chapter = chapters.find((c) => c.id === chapterId)
        const chapterTitle = options?.projectTitle?.trim() || chapter?.title
        const chapterNumber = options?.chapterNumber ?? chapter?.number
        crumbs.push({
          label: TRASH_CHAPTERS_LABEL,
          to: trashChaptersListPath(chapterTitle),
        })
        crumbs.push({
          label: deletedChapterLabel(chapterTitle, chapterNumber, chapter),
          to: `/dashboard/chapters/${chapterId}/edit`,
          state: trashChapterEditorState(projectId, chapterTitle || projectTitle, chapterNumber),
        })
        crumbs.push({ label: 'Глоссарий' })
        return crumbs
      }

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

      if (fromTrash) {
        crumbs.push({ label: TRASH_PROJECTS_LABEL, to: trashProjectsListPath() })
        crumbs.push({ label: projectTitle })
        crumbs.push({ label: 'Глоссарий' })
        return crumbs
      }

      crumbs.push({ label: projectTitle })
      crumbs.push({ label: 'Глоссарий' })
      return crumbs
    }

    if (fromTrash) {
      crumbs.push({ label: TRASH_PROJECTS_LABEL, to: trashProjectsListPath() })
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
    const chapter = chapters.find((c) => c.id === chapterId)
    const fromTrash = options?.fromTrash === true

    if (!fromTrash) {
      crumbs.push({ label: PAGE_LABELS.chapters, to: '/dashboard/chapters' })
    }

    if (subPage === 'edit') {
      if (fromTrash) {
        const title = options?.projectTitle?.trim() || chapter?.title
        const number = options?.chapterNumber ?? chapter?.number
        crumbs.push({
          label: TRASH_CHAPTERS_LABEL,
          to: trashChaptersListPath(title),
        })
        crumbs.push({
          label: deletedChapterLabel(title, number, chapter),
        })
        return crumbs
      }
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
