import { getAccessToken, getTeamId } from './auth'

const baseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''
const teamIdEnv = (import.meta.env.VITE_TEAM_ID as string | undefined) ?? ''

function headers(init?: HeadersInit): HeadersInit {
  const h = new Headers(init)
  const token = getAccessToken()
  if (token) h.set('Authorization', `Bearer ${token}`)
  const team = getTeamId() || teamIdEnv
  if (team) h.set('X-Team-Id', team)
  h.set('Accept', 'application/json')
  return h
}

export class ApiError extends Error {
  status: number
  body?: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

const API_ERROR_MESSAGES_RU: Record<string, string> = {
  'chapter number already exists for project':
    'Такой номер главы для этого проекта\nуже занят',
}

function extractApiDetail(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return ''
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return trimmed
  try {
    const obj = JSON.parse(trimmed) as Record<string, unknown>
    const detail = obj.detail ?? obj.DETAIL
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string }
      if (typeof first?.msg === 'string') return first.msg
    }
  } catch {
    return trimmed
  }
  return trimmed
}

export function formatApiErrorMessage(raw: string): string {
  const detail = extractApiDetail(raw)
  const key = detail.trim().toLowerCase()
  return API_ERROR_MESSAGES_RU[key] ?? (detail || raw)
}

function apiErrorFromResponse(text: string, status: number, statusText: string): ApiError {
  const message = formatApiErrorMessage(text || statusText)
  return new ApiError(message, status, text)
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    throw new ApiError('Invalid JSON', res.status, text)
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, { headers: headers() })
  if (!res.ok) {
    const body = await res.text()
    throw apiErrorFromResponse(body, res.status, res.statusText)
  }
  return parseJson<T>(res)
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${baseUrl}${path}`, { method: 'DELETE', headers: headers() })
  if (!res.ok) {
    const body = await res.text()
    throw apiErrorFromResponse(body, res.status, res.statusText)
  }
}

export async function apiPostJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text()
    throw apiErrorFromResponse(t, res.status, res.statusText)
  }
  return parseJson<T>(res)
}

export async function apiPatchJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'PATCH',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text()
    throw apiErrorFromResponse(t, res.status, res.statusText)
  }
  return parseJson<T>(res)
}

export async function apiPutJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'PUT',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text()
    throw apiErrorFromResponse(t, res.status, res.statusText)
  }
  return parseJson<T>(res)
}

export async function apiPostMultipart(path: string, form: FormData): Promise<unknown> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: headers(),
    body: form,
  })
  if (!res.ok) {
    const t = await res.text()
    throw apiErrorFromResponse(t, res.status, res.statusText)
  }
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export function apiFileUrl(storageKey: string): string {
  const path = storageKey
    .split('/')
    .filter((p) => p && p !== '..')
    .map(encodeURIComponent)
    .join('/')
  return `${baseUrl}/files/${path}`
}

/** Скачивание файла с JWT / X-Team-Id (надёжнее, чем window.open — не блокируется как всплывающее окно). */
export async function apiDownloadFile(storageKey: string, suggestedName?: string): Promise<void> {
  const url = apiFileUrl(storageKey)
  const h = new Headers()
  const token = getAccessToken()
  if (token) h.set('Authorization', `Bearer ${token}`)
  const team = getTeamId() || teamIdEnv
  if (team) h.set('X-Team-Id', team)
  h.set('Accept', '*/*')

  const res = await fetch(url, { headers: h })
  if (!res.ok) {
    const t = await res.text()
    throw apiErrorFromResponse(t, res.status, res.statusText)
  }
  const blob = await res.blob()
  const name =
    suggestedName?.trim() ||
    storageKey.split('/').filter((p) => p && p !== '..').pop() ||
    'download'
  const objectUrl = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = name
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function getApiBaseUrl(): string {
  return baseUrl
}
