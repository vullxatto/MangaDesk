export const TOKEN_KEY = 'mangadesk-access-token'
export const TEAM_KEY = 'mangadesk-team-id'
export const USER_ID_KEY = 'mangadesk-user-id'
export const USER_NAME_KEY = 'mangadesk-user-name'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getTeamId(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(TEAM_KEY) ?? ''
}

export function setTeamId(id: string) {
  if (typeof window === 'undefined') return
  if (id) localStorage.setItem(TEAM_KEY, id)
  else localStorage.removeItem(TEAM_KEY)
}

export function setUserProfile(id: string, username: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_ID_KEY, id)
  localStorage.setItem(USER_NAME_KEY, username)
}

export function clearSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TEAM_KEY)
  localStorage.removeItem(USER_ID_KEY)
  localStorage.removeItem(USER_NAME_KEY)
}

export function skipAuth(): boolean {
  return import.meta.env.VITE_SKIP_AUTH === 'true'
}

/** Текущий пользователь для UI (solo, задачи редактора) */
export const CURRENT_USER = {
  get id(): string {
    if (typeof window === 'undefined') {
      return import.meta.env.VITE_CURRENT_USER_ID ?? ''
    }
    return (
      localStorage.getItem(USER_ID_KEY) ||
      import.meta.env.VITE_CURRENT_USER_ID ||
      ''
    )
  },
  get name(): string {
    if (typeof window === 'undefined') return 'Пользователь'
    return localStorage.getItem(USER_NAME_KEY) || 'Пользователь'
  },
}
