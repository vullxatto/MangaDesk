import type { ChapterRow } from '../pipelineTypes'

export const CURRENT_USER = { id: 'still-rise', name: 'Still Rise' }

export const TEAM_MEMBERS = [
  { id: 'still-rise', name: 'Still Rise' },
  { id: 'robert', name: 'Роберт' },
  { id: 'maria', name: 'Мария' },
  { id: 'alexey', name: 'Алексей' },
  { id: 'elena', name: 'Елена' },
  { id: 'dmitry', name: 'Дмитрий' },
]

export const SOLO_KEY = 'mangadesk-solo-translator'

/** Справочник тайтлов: id для форм, title — как в главах и фильтрах */
export const MANGA_PROJECTS = [
  { id: 'aot', title: 'Атака титанов' },
  { id: 'knys', title: 'Клинок, рассекающий демонов' },
  { id: 'csm', title: 'Человек-бензопила' },
  { id: 'opm', title: 'Ванпанчмен' },
  { id: 'naruto', title: 'Наруто' },
  { id: 'dn', title: 'Тетрадь смерти' },
]

/** Учитывает таблицу глав, другие элементы очереди и активные обработки архивов */
export function getNextFreeChapterNumberForProject(
  chapters: ChapterRow[],
  uploadQueue: { id: string; projectId: string; chapterNumber: string }[],
  processingJobs: { projectTitle: string; chapterNumber: number }[],
  projectTitle: string,
  excludeQueueItemId: string,
) {
  const used = new Set()
  for (const c of chapters) {
    if (c.title === projectTitle) used.add(c.number)
  }
  for (const q of uploadQueue) {
    if (q.id === excludeQueueItemId) continue
    const p = MANGA_PROJECTS.find((m) => m.id === q.projectId)
    if (!p || p.title !== projectTitle) continue
    const qn = parseInt(String(q.chapterNumber).trim(), 10)
    if (Number.isFinite(qn) && qn >= 1) used.add(qn)
  }
  for (const j of processingJobs) {
    if (j.projectTitle === projectTitle && Number.isFinite(j.chapterNumber)) {
      used.add(j.chapterNumber)
    }
  }
  let n = 1
  while (used.has(n)) n += 1
  return n
}

export function isDuplicateChapterNumber(
  projectTitle: string,
  rawNum: number | string,
  chapters: ChapterRow[],
  uploadQueue: { id: string; projectId: string; chapterNumber: string }[],
  processingJobs: { projectTitle: string; chapterNumber: number }[],
  excludeQueueItemId: string,
) {
  const num = typeof rawNum === 'number' ? rawNum : parseInt(String(rawNum).trim(), 10)
  if (!projectTitle || !Number.isFinite(num) || num < 1) return false

  if (chapters.some((c) => c.title === projectTitle && c.number === num)) return true

  for (const q of uploadQueue) {
    if (q.id === excludeQueueItemId) continue
    const p = MANGA_PROJECTS.find((m) => m.id === q.projectId)
    if (!p || p.title !== projectTitle) continue
    const qn = parseInt(String(q.chapterNumber).trim(), 10)
    if (Number.isFinite(qn) && qn === num) return true
  }

  for (const j of processingJobs) {
    if (j.projectTitle === projectTitle && j.chapterNumber === num) return true
  }

  return false
}

export const INITIAL_CHAPTERS: ChapterRow[] = [
  {
    id: 1,
    title: 'Атака титанов',
    number: 12,
    statusCode: 'ready',
    date: '05.03.2025 14:49',
    editorId: 'robert',
    editorName: 'Роберт',
    assignedAt: '04.03.2025 10:00',
  },
  {
    id: 2,
    title: 'Атака титанов',
    number: 13,
    statusCode: 'ai',
    date: '13.02.2024 14:49',
    editorId: 'maria',
    editorName: 'Мария',
    assignedAt: '12.02.2024 09:00',
  },
  {
    id: 3,
    title: 'Клинок, рассекающий демонов',
    number: 105,
    statusCode: 'edit',
    date: '05.03.2024 14:49',
    editorId: 'still-rise',
    editorName: 'Still Rise',
    assignedAt: '05.03.2024 14:49',
  },
  {
    id: 4,
    title: 'Человек-бензопила',
    number: 1,
    statusCode: 'upload',
    date: '01.03.2024 14:49',
    editorId: 'alexey',
    editorName: 'Алексей',
    assignedAt: '28.02.2024 18:00',
  },
  {
    id: 5,
    title: 'Клинок, рассекающий демонов',
    number: 106,
    statusCode: 'waiting_editor',
    date: '10.04.2026 11:20',
    editorId: null,
    editorName: null,
    assignedAt: null,
  },
]
