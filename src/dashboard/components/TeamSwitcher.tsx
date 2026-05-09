import { ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { usePipeline } from '../context/usePipeline'
import { skipAuth } from '../../lib/auth'
import { apiPostJson } from '../../lib/api'

export default function TeamSwitcher() {
  const { teams, currentTeamId, setCurrentTeamId, ready, reloadMe } = useAuth()
  const { refreshDashboard } = usePipeline()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const onPick = useCallback(
    (id: string) => {
      setCurrentTeamId(id)
      setOpen(false)
      void refreshDashboard()
    },
    [setCurrentTeamId, refreshDashboard],
  )

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const onCreateTeam = useCallback(async () => {
    const name = window.prompt('Название команды')
    if (!name || !name.trim()) return
    setCreating(true)
    try {
      const created = await apiPostJson<{ id: string }>('/team', { name: name.trim() })
      await reloadMe()
      if (created.id) {
        setCurrentTeamId(created.id)
      }
      await refreshDashboard()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Не удалось создать команду')
    } finally {
      setCreating(false)
    }
  }, [reloadMe, refreshDashboard, setCurrentTeamId])

  if (skipAuth() || !ready) return null
  if (teams.length === 0) return null

  const current = teams.find((t) => t.id === currentTeamId) ?? teams[0]
  const label = current?.is_personal ? `Личное: ${current.name}` : current?.name ?? 'Команда'

  return (
    <div className="dashboard-team-switcher" ref={rootRef} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <button
        type="button"
        className="dashboard-new-btn"
        onClick={() => void onCreateTeam()}
        disabled={creating}
      >
        Создать команду
      </button>
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          className="dashboard-team-switcher-btn"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="dashboard-team-switcher-label">{label}</span>
          <ChevronDown size={14} strokeWidth={2.25} aria-hidden />
        </button>
        {open ? (
          <ul className="dashboard-team-switcher-menu" role="listbox">
            {teams.map((t) => (
              <li key={t.id} role="option" aria-selected={t.id === currentTeamId}>
                <button
                  type="button"
                  className={`dashboard-team-switcher-item${t.id === currentTeamId ? ' is-active' : ''}`}
                  onClick={() => onPick(t.id)}
                >
                  <span className="dashboard-team-switcher-item-title">
                    {t.is_personal ? 'Личное' : t.name}
                  </span>
                  {!t.is_personal ? <span className="dashboard-team-switcher-item-meta">{t.role}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
