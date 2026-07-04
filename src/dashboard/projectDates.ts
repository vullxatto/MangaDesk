const MOCK_CREATED_AT = [
  '2026-03-15T11:20:00.000Z',
  '2026-03-28T16:45:00.000Z',
  '2026-04-05T08:30:00.000Z',
  '2026-04-18T19:10:00.000Z',
  '2026-05-02T13:55:00.000Z',
  '2026-05-21T10:05:00.000Z',
  '2026-06-01T17:40:00.000Z',
  '2026-06-14T09:25:00.000Z',
  '2026-06-27T21:15:00.000Z',
  '2026-07-03T12:00:00.000Z',
]

function hashProjectId(projectId: string) {
  let hash = 0
  for (let i = 0; i < projectId.length; i++) {
    hash = (hash * 31 + projectId.charCodeAt(i)) >>> 0
  }
  return hash
}

export function formatRuDateTime(value: string | null | undefined) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('ru-RU')
}

/** Стабильные моковые даты для локального теста, если API не вернул поля проекта. */
export function mockProjectDates(projectId: string) {
  const hash = hashProjectId(projectId)
  const createdAt = MOCK_CREATED_AT[hash % MOCK_CREATED_AT.length]
  const updated = new Date(createdAt)
  updated.setDate(updated.getDate() + (hash % 14) + 1)
  updated.setHours(updated.getHours() + (hash % 8))
  return {
    createdAt,
    updatedAt: updated.toISOString(),
  }
}

export function resolveProjectDates(
  projectId: string,
  created_at?: string | null,
  updated_at?: string | null,
) {
  const mock = mockProjectDates(projectId)
  const createdAt =
    created_at && !Number.isNaN(new Date(created_at).getTime()) ? created_at : mock.createdAt
  const updatedAt =
    updated_at && !Number.isNaN(new Date(updated_at).getTime()) ? updated_at : mock.updatedAt
  return { createdAt, updatedAt }
}

export function resolveProjectCreatedAt(projectId: string, created_at?: string | null) {
  if (created_at && !Number.isNaN(new Date(created_at).getTime())) return created_at
  return mockProjectDates(projectId).createdAt
}

export function resolveItemCreatedAt(itemId: string, created_at?: string | null) {
  return resolveProjectCreatedAt(itemId, created_at)
}

export function resolveItemUpdatedAt(itemId: string, updated_at?: string | null, created_at?: string | null) {
  if (updated_at && !Number.isNaN(new Date(updated_at).getTime())) return updated_at
  const mock = mockProjectDates(itemId)
  if (created_at && !Number.isNaN(new Date(created_at).getTime())) {
    const updated = new Date(created_at)
    updated.setHours(updated.getHours() + 2)
    return updated.toISOString()
  }
  return mock.updatedAt
}
