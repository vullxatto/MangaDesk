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
    throw new ApiError(body || res.statusText, res.status, body)
  }
  return parseJson<T>(res)
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${baseUrl}${path}`, { method: 'DELETE', headers: headers() })
  if (!res.ok) {
    const body = await res.text()
    throw new ApiError(body || res.statusText, res.status, body)
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
    throw new ApiError(t || res.statusText, res.status, t)
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
    throw new ApiError(t || res.statusText, res.status, t)
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
    throw new ApiError(t || res.statusText, res.status, t)
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
    throw new ApiError(t || res.statusText, res.status, t)
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
    throw new ApiError(t || res.statusText, res.status, t)
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
