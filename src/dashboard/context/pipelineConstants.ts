import type { ChapterRow, DashboardProject } from '../pipelineTypes'

export { CURRENT_USER } from '../../lib/auth'

export const SOLO_KEY = 'mangadesk-solo-translator'

export function getNextFreeChapterNumberForProject(
  chapters: ChapterRow[],
  uploadQueue: { id: string; projectId: string; chapterNumber: string }[],
  projects: DashboardProject[],
  projectId: string,
  excludeQueueItemId: string,
) {
  const project = projects.find((p) => p.id === projectId)
  const projectTitle = project?.title ?? ''
  const used = new Set<number>()
  for (const c of chapters) {
    if (c.projectId === projectId) used.add(c.number)
  }
  for (const q of uploadQueue) {
    if (q.id === excludeQueueItemId) continue
    const qp = projects.find((m) => m.id === q.projectId)
    if (!qp || qp.title !== projectTitle) continue
    const qn = parseInt(String(q.chapterNumber).trim(), 10)
    if (Number.isFinite(qn) && qn >= 1) used.add(qn)
  }
  let n = 1
  while (used.has(n)) n += 1
  return n
}

export function isDuplicateChapterNumber(
  projectId: string,
  rawNum: number | string,
  chapters: ChapterRow[],
  uploadQueue: { id: string; projectId: string; chapterNumber: string }[],
  excludeQueueItemId: string,
  excludeChapterId?: string,
) {
  const num = typeof rawNum === 'number' ? rawNum : parseInt(String(rawNum).trim(), 10)
  if (!projectId || !Number.isFinite(num) || num < 1) return false

  if (
    chapters.some(
      (c) =>
        c.projectId === projectId &&
        c.number === num &&
        (excludeChapterId === undefined || c.id !== excludeChapterId),
    )
  ) {
    return true
  }

  for (const q of uploadQueue) {
    if (q.id === excludeQueueItemId) continue
    if (q.projectId !== projectId) continue
    const qn = parseInt(String(q.chapterNumber).trim(), 10)
    if (Number.isFinite(qn) && qn === num) return true
  }

  return false
}
