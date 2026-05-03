import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiGet } from '../lib/api'
import { getAccessToken, setTeamId, setUserProfile, skipAuth, TEAM_KEY, TOKEN_KEY } from '../lib/auth'

export type AuthTeam = {
  id: string
  slug: string
  name: string
  is_personal: boolean
  role: string
}

export type AuthUser = {
  id: string
  email: string | null
  username: string
}

type AuthContextValue = {
  ready: boolean
  user: AuthUser | null
  teams: AuthTeam[]
  currentTeamId: string
  setCurrentTeamId: (id: string) => void
  reloadMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

type MeResponse = {
  id: string
  email: string | null
  username: string
  teams: AuthTeam[]
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [teams, setTeams] = useState<AuthTeam[]>([])
  const [currentTeamId, setCurrentTeamIdState] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem(TEAM_KEY) ?? '' : '',
  )

  const reloadMe = useCallback(async () => {
    if (skipAuth()) {
      setUser(null)
      setTeams([])
      setReady(true)
      return
    }
    const token = getAccessToken()
    if (!token) {
      setUser(null)
      setTeams([])
      setCurrentTeamIdState('')
      setReady(true)
      return
    }
    try {
      const me = await apiGet<MeResponse>('/auth/me')
      setUser({ id: me.id, email: me.email, username: me.username })
      setUserProfile(me.id, me.username)
      setTeams(me.teams)
      let tid = localStorage.getItem(TEAM_KEY) ?? ''
      if (!tid || !me.teams.some((t) => t.id === tid)) {
        const personal = me.teams.find((t) => t.is_personal)
        tid = personal?.id ?? me.teams[0]?.id ?? ''
        if (tid) {
          localStorage.setItem(TEAM_KEY, tid)
          setCurrentTeamIdState(tid)
        }
      } else {
        setCurrentTeamIdState(tid)
      }
    } catch {
      setUser(null)
      setTeams([])
      localStorage.removeItem(TOKEN_KEY)
      setCurrentTeamIdState('')
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    void reloadMe()
  }, [reloadMe])

  const setCurrentTeamId = useCallback((id: string) => {
    setTeamId(id)
    setCurrentTeamIdState(id)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      user,
      teams,
      currentTeamId,
      setCurrentTeamId,
      reloadMe,
    }),
    [ready, user, teams, currentTeamId, setCurrentTeamId, reloadMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
