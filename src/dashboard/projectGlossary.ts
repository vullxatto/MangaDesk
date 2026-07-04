import type { GlossaryEntry } from './glossary/glossaryTypes'

export const EMPTY_PROJECT_GLOSSARY: GlossaryEntry[] = []

const STORAGE_KEY = 'mangadesk-project-glossary'

function readAll(): Record<string, GlossaryEntry[]> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, GlossaryEntry[]>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAll(data: Record<string, GlossaryEntry[]>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function pruneProjectGlossaryStorage(knownProjectIds: string[]) {
  if (typeof window === 'undefined') return
  const allowed = new Set(knownProjectIds)
  const all = readAll()
  let changed = false
  for (const id of Object.keys(all)) {
    if (!allowed.has(id)) {
      delete all[id]
      changed = true
    }
  }
  if (changed) writeAll(all)
}

export function getProjectGlossary(projectId: string): GlossaryEntry[] {
  return readAll()[projectId] ?? EMPTY_PROJECT_GLOSSARY
}

export function setProjectGlossary(projectId: string, entries: GlossaryEntry[]) {
  const all = readAll()
  if (entries.length === 0) {
    delete all[projectId]
  } else {
    all[projectId] = entries
  }
  writeAll(all)
}
