/** Даты из api/seed.sql — стабильный fallback, если API не вернул поля. */
const SEED_ENTITY_DATES: Record<string, { createdAt: string; updatedAt: string }> = {
  'd0000001-0001-0001-0001-000000000001': {
    createdAt: '2026-03-15T11:20:00.000Z',
    updatedAt: '2026-07-04T14:30:00.000Z',
  },
  'd0000002-0001-0001-0001-000000000002': {
    createdAt: '2026-04-05T08:30:00.000Z',
    updatedAt: '2026-07-03T19:10:00.000Z',
  },
  'd0000003-0001-0001-0001-000000000003': {
    createdAt: '2026-05-02T13:55:00.000Z',
    updatedAt: '2026-06-28T10:05:00.000Z',
  },
  'd0000004-0001-0001-0001-000000000004': {
    createdAt: '2026-05-18T16:40:00.000Z',
    updatedAt: '2026-07-02T09:20:00.000Z',
  },
  'd0000005-0001-0001-0001-000000000005': {
    createdAt: '2026-06-01T12:00:00.000Z',
    updatedAt: '2026-06-25T18:45:00.000Z',
  },
  'd0000006-0001-0001-0001-000000000006': {
    createdAt: '2026-02-10T09:00:00.000Z',
    updatedAt: '2026-06-15T20:30:00.000Z',
  },
  'd0000007-0001-0001-0001-000000000007': {
    createdAt: '2026-03-22T14:10:00.000Z',
    updatedAt: '2026-06-20T11:45:00.000Z',
  },
  'd0000008-0001-0001-0001-000000000008': {
    createdAt: '2026-04-14T10:25:00.000Z',
    updatedAt: '2026-06-25T16:00:00.000Z',
  },
  'e0000003-0001-0001-0001-000000000003': {
    createdAt: '2026-06-20T09:15:00.000Z',
    updatedAt: '2026-07-04T11:30:00.000Z',
  },
  'e0000101-0001-0001-0001-000000000101': {
    createdAt: '2026-05-28T11:17:51.000Z',
    updatedAt: '2026-07-02T01:17:51.000Z',
  },
}

const FALLBACK_CREATED_AT = [
  '2026-03-15T11:20:00.000Z',
  '2026-04-05T08:30:00.000Z',
  '2026-05-02T13:55:00.000Z',
  '2026-05-18T16:40:00.000Z',
  '2026-06-01T12:00:00.000Z',
  '2026-06-20T09:15:00.000Z',
  '2026-07-01T09:00:00.000Z',
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
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Стабильные даты для локального теста, если API не вернул поля. */
export function mockProjectDates(projectId: string) {
  const seeded = SEED_ENTITY_DATES[projectId]
  if (seeded) return seeded

  const hash = hashProjectId(projectId)
  const createdAt = FALLBACK_CREATED_AT[hash % FALLBACK_CREATED_AT.length]
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
