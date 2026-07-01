export type ProjectLink = { label: string; href: string }

export const EMPTY_PROJECT_LINKS: ProjectLink[] = []

const STORAGE_KEY = 'mangadesk-project-links'

function readAll(): Record<string, ProjectLink[]> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, ProjectLink[]>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAll(data: Record<string, ProjectLink[]>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getProjectLinks(projectId: string): ProjectLink[] {
  return readAll()[projectId] ?? EMPTY_PROJECT_LINKS
}

export function setProjectLinks(projectId: string, links: ProjectLink[]) {
  const all = readAll()
  if (links.length === 0) {
    delete all[projectId]
  } else {
    all[projectId] = links
  }
  writeAll(all)
}

export function removeProjectLinks(projectId: string) {
  const all = readAll()
  delete all[projectId]
  writeAll(all)
}

export function normalizeProjectLinks(links: ProjectLink[]): ProjectLink[] {
  return links
    .map((link) => ({ label: link.label.trim(), href: link.href.trim() }))
    .filter((link) => link.label && link.href)
}
