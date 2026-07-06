import { useCallback, useMemo, useState } from 'react'

export type TableColumnConfig<T extends string> = {
  id: T
  label: string
}

const ACTIONS_COL = 'minmax(7.5rem, 0.52fr)'

const PROJECTS_COL_WIDTHS: Record<string, string> = {
  name: 'minmax(0, 1.15fr)',
  chapters: 'minmax(0, 0.9fr)',
  glossary: 'minmax(0, 0.95fr)',
  links: 'minmax(0, 1.8fr)',
  createdAt: 'minmax(0, 1.1fr)',
}

const TRASH_PROJECTS_COL_WIDTHS: Record<string, string> = {
  name: 'minmax(0, 1.15fr)',
  chapters: 'minmax(0, 0.9fr)',
  glossary: 'minmax(0, 0.95fr)',
  links: 'minmax(0, 1.3fr)',
  createdAt: 'minmax(0, 1fr)',
  deletedAt: 'minmax(0, 1fr)',
}

const CHAPTERS_COL_WIDTHS: Record<string, string> = {
  title: 'minmax(0, 1.45fr)',
  status: 'minmax(0, 1.1fr)',
  translate: 'minmax(0, 0.7fr)',
  createdAt: 'minmax(0, 1fr)',
  updatedAt: 'minmax(0, 1fr)',
  editor: 'minmax(0, 1.05fr)',
}

const TRASH_CHAPTERS_COL_WIDTHS: Record<string, string> = {
  title: 'minmax(0, 1.45fr)',
  status: 'minmax(0, 1.1fr)',
  translate: 'minmax(0, 0.7fr)',
  createdAt: 'minmax(0, 0.95fr)',
  updatedAt: 'minmax(0, 0.95fr)',
  deletedAt: 'minmax(0, 0.95fr)',
  editor: 'minmax(0, 1.05fr)',
}

const GLOSSARY_COL_WIDTHS: Record<string, string> = {
  source: 'minmax(0, 1.15fr)',
  target: 'minmax(0, 1.15fr)',
  chapterNumber: 'minmax(0, 0.85fr)',
}

function loadVisibleColumns<T extends string>(storageKey: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return fallback
    const allowed = new Set(fallback)
    const next = parsed.filter((id): id is T => typeof id === 'string' && allowed.has(id as T))
    return next.length > 0 ? next : fallback
  } catch {
    return fallback
  }
}

function saveVisibleColumns<T extends string>(storageKey: string, visible: T[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(storageKey, JSON.stringify(visible))
}

function buildGridTemplate(visibleIds: string[], widths: Record<string, string>) {
  const cols = visibleIds.map((id) => widths[id]).filter(Boolean)
  cols.push(ACTIONS_COL)
  return cols.join(' ')
}

export function useTableColumnVisibility<T extends string>(
  storageKey: string,
  columns: TableColumnConfig<T>[],
) {
  const allIds = useMemo(() => columns.map((column) => column.id), [columns])
  const [visibleIds, setVisibleIds] = useState<T[]>(() => loadVisibleColumns(storageKey, allIds))

  const activeVisibleIds = useMemo(
    () => allIds.filter((id) => visibleIds.includes(id)),
    [allIds, visibleIds],
  )

  const isVisible = useCallback(
    (id: T) => activeVisibleIds.includes(id),
    [activeVisibleIds],
  )

  const toggleColumn = useCallback(
    (id: T) => {
      setVisibleIds((prev) => {
        const has = prev.includes(id)
        if (has && prev.length <= 1) return prev
        const next = has ? prev.filter((item) => item !== id) : [...prev, id]
        const ordered = allIds.filter((item) => next.includes(item))
        saveVisibleColumns(storageKey, ordered)
        return ordered
      })
    },
    [allIds, storageKey],
  )

  return { visibleIds: activeVisibleIds, isVisible, toggleColumn, columns }
}

export function useProjectsTableColumns() {
  const columns = useMemo<TableColumnConfig<string>[]>(
    () => [
      { id: 'name', label: 'Название' },
      { id: 'chapters', label: 'Главы' },
      { id: 'glossary', label: 'Глоссарий' },
      { id: 'links', label: 'Ссылки' },
      { id: 'createdAt', label: 'Дата создания' },
    ],
    [],
  )
  const visibility = useTableColumnVisibility('mangadesk.table-columns.projects', columns)
  const gridTemplate = useMemo(
    () => buildGridTemplate(visibility.visibleIds, PROJECTS_COL_WIDTHS),
    [visibility.visibleIds],
  )
  return { ...visibility, gridTemplate }
}

export function useTrashProjectsTableColumns() {
  const columns = useMemo<TableColumnConfig<string>[]>(
    () => [
      { id: 'name', label: 'Название' },
      { id: 'chapters', label: 'Главы' },
      { id: 'glossary', label: 'Глоссарий' },
      { id: 'links', label: 'Ссылки' },
      { id: 'createdAt', label: 'Дата создания' },
      { id: 'deletedAt', label: 'Дата удаления' },
    ],
    [],
  )
  const visibility = useTableColumnVisibility('mangadesk.table-columns.trash-projects', columns)
  const gridTemplate = useMemo(
    () => buildGridTemplate(visibility.visibleIds, TRASH_PROJECTS_COL_WIDTHS),
    [visibility.visibleIds],
  )
  return { ...visibility, gridTemplate }
}

export function useChaptersTableColumns(soloMode: boolean) {
  const columns = useMemo<TableColumnConfig<string>[]>(() => {
    const base: TableColumnConfig<string>[] = [
      { id: 'title', label: 'Проект / №' },
      { id: 'status', label: 'Статус' },
      { id: 'translate', label: 'Перевод' },
      { id: 'createdAt', label: 'Дата создания' },
      { id: 'updatedAt', label: 'Дата изменения' },
    ]
    if (!soloMode) {
      base.push({ id: 'editor', label: 'Редактор' })
    }
    return base
  }, [soloMode])

  const visibility = useTableColumnVisibility('mangadesk.table-columns.chapters', columns)
  const gridTemplate = useMemo(
    () => buildGridTemplate(visibility.visibleIds, CHAPTERS_COL_WIDTHS),
    [visibility.visibleIds],
  )
  return { ...visibility, gridTemplate }
}

export function useTrashChaptersTableColumns(soloMode: boolean) {
  const columns = useMemo<TableColumnConfig<string>[]>(() => {
    const base: TableColumnConfig<string>[] = [
      { id: 'title', label: 'Проект / №' },
      { id: 'status', label: 'Статус' },
      { id: 'translate', label: 'Перевод' },
      { id: 'createdAt', label: 'Дата создания' },
      { id: 'updatedAt', label: 'Дата изменения' },
      { id: 'deletedAt', label: 'Дата удаления' },
    ]
    if (!soloMode) {
      base.push({ id: 'editor', label: 'Редактор' })
    }
    return base
  }, [soloMode])

  const visibility = useTableColumnVisibility('mangadesk.table-columns.trash-chapters', columns)
  const gridTemplate = useMemo(
    () => buildGridTemplate(visibility.visibleIds, TRASH_CHAPTERS_COL_WIDTHS),
    [visibility.visibleIds],
  )
  return { ...visibility, gridTemplate }
}

export function useGlossaryTableColumns() {
  const columns = useMemo<TableColumnConfig<string>[]>(
    () => [
      { id: 'source', label: 'Оригинал' },
      { id: 'target', label: 'Перевод' },
      { id: 'chapterNumber', label: 'Глава добавления' },
    ],
    [],
  )
  const visibility = useTableColumnVisibility('mangadesk.table-columns.glossary', columns)
  const gridTemplate = useMemo(
    () => buildGridTemplate(visibility.visibleIds, GLOSSARY_COL_WIDTHS),
    [visibility.visibleIds],
  )
  return { ...visibility, gridTemplate }
}
