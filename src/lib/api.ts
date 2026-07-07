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
  'missing authorization': 'Требуется авторизация',
  'invalid token': 'Недействительный токен',
  'authentication required': 'Требуется авторизация',
  'invalid x-team-id': 'Некорректный идентификатор команды',
  'x-team-id header required': 'Не указан идентификатор команды',
  'not a member of this team': 'Вы не состоите в этой команде',
  'no team in database; run seed or set default_team_id':
    'Команда не найдена. Запустите seed или задайте DEFAULT_TEAM_ID',
  'invalid default_team_id': 'Некорректный DEFAULT_TEAM_ID на сервере',
  'user not found': 'Пользователь не найден',
  'missing token': 'Токен не передан',
  'chapter not found': 'Глава не найдена',
  'project not found': 'Проект не найден',
  'chapter not found in trash': 'Глава не найдена среди удалённых',
  'project not found in trash': 'Проект не найден среди удалённых',
  'insufficient tokens': 'Недостаточно токенов',
  'file too large': 'Файл слишком большой',
  'archive too large': 'Архив слишком большой',
  'invalid status_code': 'Некорректный статус',
  'pipeline already running for this chapter': 'Обработка этой главы уже запущена',
  'only .zip or .rar': 'Допустимы только архивы .zip или .rar',
  'zip has no images': 'В архиве ZIP нет изображений',
  'rar has no images': 'В архиве RAR нет изображений',
  'zip must not contain nested folders': 'Архив ZIP не должен содержать вложенные папки',
  'rar must not contain nested folders': 'Архив RAR не должен содержать вложенные папки',
  'zip must not contain folders': 'Архив ZIP не должен содержать папки',
  'rar must not contain folders': 'Архив RAR не должен содержать папки',
  'zip must contain images only (.png, .jpg, .jpeg, .webp)':
    'Архив ZIP должен содержать только изображения (.png, .jpg, .jpeg, .webp)',
  'rar must contain images only (.png, .jpg, .jpeg, .webp)':
    'Архив RAR должен содержать только изображения (.png, .jpg, .jpeg, .webp)',
  'too many files in archive': 'Слишком много файлов в архиве',
  'file in archive too large': 'Файл в архиве слишком большой',
  'invalid file path in archive': 'Некорректный путь к файлу в архиве',
  'unsupported archive type; use .zip or .rar': 'Неподдерживаемый тип архива. Используйте .zip или .rar',
  'no files': 'Нет файлов для загрузки',
  'chapter has no translation_json yet (run ocr/preview first)':
    'У главы ещё нет перевода. Сначала запустите OCR или превью.',
  'duplicate term_source for project': 'Такой термин для проекта уже существует',
  'entry not found': 'Запись не найдена',
  'invalid path': 'Некорректный путь к файлу',
  'not found': 'Не найдено',
  'owner role required': 'Требуется роль владельца команды',
  'reviewer role required': 'Требуется роль проверяющего или владельца',
  'cannot change your own role': 'Нельзя изменить свою роль',
  'cannot change owner role': 'Нельзя изменить роль владельца',
  'cannot change members in personal team': 'Нельзя изменять участников личной команды',
  'cannot invite members to personal team': 'В личную команду нельзя приглашать участников',
  'team name is required': 'Укажите название команды',
  'team name too long': 'Название команды слишком длинное',
  'invite not found': 'Приглашение не найдено',
  'invite revoked': 'Приглашение отозвано',
  'invite expired': 'Приглашение истекло',
  'invite exhausted': 'Приглашение уже использовано',
  'cannot remove yourself': 'Нельзя удалить себя из команды',
  'cannot remove members from personal team': 'Нельзя удалять участников личной команды',
  'member not found': 'Участник не найден',
  'username is required': 'Укажите имя пользователя',
  'username too long': 'Имя пользователя слишком длинное',
  'unsupported provider': 'Неподдерживаемый способ входа',
  'provider not linked': 'Аккаунт не привязан',
  'redirect required': 'Не указан адрес перенаправления',
  'redirect url not allowed': 'Адрес перенаправления не разрешён',
  'invalid state': 'Сессия входа истекла. Попробуйте снова.',
  'invalid link state': 'Сессия привязки истекла. Попробуйте снова.',
  'job not found': 'Задача не найдена',
  'invalid json': 'Некорректный ответ сервера',
  'bad gateway': 'Сбой шлюза. Сервер временно недоступен — попробуйте позже.',
  'no deliverables for review': 'Сначала загрузите файлы главы (архив, PSD или изображения).',
  'not assigned to this chapter': 'Эта глава назначена другому редактору.',
  'chapter not in editing status': 'Главу нельзя отправить на проверку в текущем статусе.',
  'chapter not in review': 'Глава не ожидает проверки.',
  'review comment required': 'Укажите комментарий для редактора.',
  'chapter not available for download': 'Скачивание доступно только для глав на проверке или готовых.',
  'no deliverables': 'Нет загруженных файлов для скачивания.',
}

const API_ERROR_PATTERNS_RU: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /input should be a valid uuid.*found 0/i,
    message: 'Не указан идентификатор. Ожидается UUID.',
  },
  {
    pattern: /input should be a valid uuid/i,
    message: 'Некорректный идентификатор. Ожидается UUID.',
  },
  {
    pattern: /field required/i,
    message: 'Не заполнено обязательное поле.',
  },
  {
    pattern: /input should be a valid integer/i,
    message: 'Укажите целое число.',
  },
  {
    pattern: /input should be a valid (number|float|decimal)/i,
    message: 'Укажите число.',
  },
  {
    pattern: /value is not a valid email address/i,
    message: 'Некорректный адрес email.',
  },
  {
    pattern: /string should have at least (\d+) character/i,
    message: 'Слишком короткое значение.',
  },
  {
    pattern: /string should have at most (\d+) character/i,
    message: 'Слишком длинное значение.',
  },
  {
    pattern: /failed to fetch|networkerror|load failed/i,
    message: 'Не удалось связаться с сервером. Проверьте подключение к интернету.',
  },
]

function translateApiDetail(detail: string): string {
  const trimmed = detail.trim()
  if (!trimmed) return ''

  const key = trimmed.toLowerCase()
  if (API_ERROR_MESSAGES_RU[key]) return API_ERROR_MESSAGES_RU[key]

  for (const { pattern, message } of API_ERROR_PATTERNS_RU) {
    if (pattern.test(trimmed)) return message
  }

  return trimmed
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
  return translateApiDetail(detail || raw)
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

export async function apiDownloadChapterArchive(chapterId: string): Promise<void> {
  const url = `${baseUrl}/chapters/${encodeURIComponent(chapterId)}/deliverables/archive`
  const h = new Headers()
  const token = getAccessToken()
  if (token) h.set('Authorization', `Bearer ${token}`)
  const team = getTeamId() || teamIdEnv
  if (team) h.set('X-Team-Id', team)
  h.set('Accept', 'application/zip')

  const res = await fetch(url, { headers: h })
  if (!res.ok) {
    const t = await res.text()
    throw apiErrorFromResponse(t, res.status, res.statusText)
  }
  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition') ?? ''
  const match = disposition.match(/filename="([^"]+)"/i)
  const name = match?.[1] ?? `chapter-${chapterId}.zip`
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
  if (baseUrl) return baseUrl
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}
