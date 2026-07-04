import { CreditCard, Link2, LogOut, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PressActionButton } from '../../../components/PressActionButton'
import { useAuth } from '../../../context/AuthContext'
import { apiDelete, apiGet, apiPatchJson } from '../../../lib/api'
import { usePipeline } from '../../context/usePipeline'

function SettingsPage({ title = 'Настройки' }) {
  const navigate = useNavigate()
  const { logout, user, reloadMe } = useAuth()
  const { soloMode, setSoloMode } = usePipeline()
  const [linkedProviders, setLinkedProviders] = useState<Array<{ provider: 'google' | 'vk'; provider_user_id: string }>>(
    [],
  )
  const [providersLoading, setProvidersLoading] = useState(false)
  const [providersError, setProvidersError] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)

  const linkedSet = useMemo(() => new Set(linkedProviders.map((p) => p.provider)), [linkedProviders])

  async function reloadProviders() {
    setProvidersLoading(true)
    setProvidersError(null)
    try {
      const rows = await apiGet<Array<{ provider: 'google' | 'vk'; provider_user_id: string }>>('/auth/providers')
      setLinkedProviders(rows)
    } catch (e) {
      setProvidersError(e instanceof Error ? e.message : 'Не удалось получить список привязок')
    } finally {
      setProvidersLoading(false)
    }
  }

  useEffect(() => {
    void reloadProviders()
  }, [])

  useEffect(() => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
    const params = new URLSearchParams(hash)
    if (params.get('linked')) {
      window.history.replaceState(null, '', window.location.pathname)
      void reloadProviders()
    }
  }, [])

  useEffect(() => {
    setUsername(user?.username ?? '')
  }, [user?.username])

  function handleLogout() {
    logout()
    void navigate('/auth', { replace: true })
  }

  async function startLink(provider: 'google' | 'vk') {
    setProvidersError(null)
    const redirect = `${window.location.origin}/dashboard/settings`
    try {
      const res = await apiGet<{ url: string }>(
        `/auth/link/${provider}/start?redirect=${encodeURIComponent(redirect)}&mode=json`,
      )
      if (!res.url) throw new Error('Пустой URL привязки')
      window.location.href = res.url
    } catch (e) {
      setProvidersError(e instanceof Error ? e.message : 'Не удалось начать привязку')
    }
  }

  async function unlink(provider: 'google' | 'vk') {
    try {
      await apiDelete(`/auth/providers/${provider}`)
      await reloadProviders()
    } catch (e) {
      setProvidersError(e instanceof Error ? e.message : 'Не удалось отвязать провайдер')
    }
  }

  async function saveName() {
    const next = username.trim()
    if (!next) {
      setProfileMessage('Имя не должно быть пустым')
      return
    }
    setProfileSaving(true)
    setProfileMessage(null)
    try {
      await apiPatchJson('/auth/profile', { username: next })
      await reloadMe()
      setProfileMessage('Имя сохранено')
    } catch (e) {
      setProfileMessage(e instanceof Error ? e.message : 'Не удалось сохранить имя')
    } finally {
      setProfileSaving(false)
    }
  }

  return (
    <div className="chapters-page projects-page account-page settings-page">
      <div className="dashboard-toolbar projects-page-toolbar">
        <h1>{title}</h1>
      </div>
      <div className="account-grid">
        <section className="account-card article-mini-card">
          <h2>Профиль</h2>
          <label className="account-field">
            <span>Имя пользователя</span>
            <input className="account-input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <PressActionButton onClick={() => void saveName()} disabled={profileSaving}>
            Сохранить имя
          </PressActionButton>
          {profileMessage ? <p className="account-muted">{profileMessage}</p> : null}
        </section>

        <section className="account-card article-mini-card">
          <h2>
            <CreditCard size={16} strokeWidth={2} /> Подписка
          </h2>
          <p className="account-muted">Текущий тариф: Студия Still Rise</p>
          <PressActionButton>Оплатить подписку</PressActionButton>
        </section>

        <section className="account-card article-mini-card">
          <h2>
            <Link2 size={16} strokeWidth={2} /> Соцсети
          </h2>
          <div className="account-socials">
            <button
              type="button"
              className="account-social-btn"
              onClick={() => (linkedSet.has('google') ? void unlink('google') : void startLink('google'))}
              disabled={providersLoading}
            >
              {linkedSet.has('google') ? 'Отвязать Google' : 'Привязать Google'}
            </button>
            <button
              type="button"
              className="account-social-btn"
              onClick={() => (linkedSet.has('vk') ? void unlink('vk') : void startLink('vk'))}
              disabled={providersLoading}
            >
              {linkedSet.has('vk') ? 'Отвязать VK' : 'Привязать VK'}
            </button>
          </div>
          {linkedProviders.length > 0 ? (
            <div className="account-muted">
              {linkedProviders.map((p) => `${p.provider}: id:${p.provider_user_id}`).join(' · ')}
            </div>
          ) : null}
          {providersError ? <p className="review-queue-field-error">{providersError}</p> : null}
        </section>

        <section className="account-card article-mini-card">
          <h2>
            <Wallet size={16} strokeWidth={2} /> Баланс токенов
          </h2>
          <label className="account-field">
            <span>Сумма пополнения</span>
            <input className="account-input" defaultValue="4500" />
          </label>
          <PressActionButton>Пополнить токены</PressActionButton>
        </section>

        <section className="account-card account-card--wide article-mini-card">
          <h2>Режим работы</h2>
          <label className="settings-solo-toggle">
            <span className="settings-solo-label">Режим соло-переводчика</span>
            <span className="settings-toggle">
              <input
                type="checkbox"
                className="settings-toggle-input"
                checked={soloMode}
                onChange={(e) => setSoloMode(e.target.checked)}
              />
              <span className="settings-toggle-track" aria-hidden="true">
                <span className="settings-toggle-thumb" />
              </span>
            </span>
          </label>
        </section>
      </div>
      <div className="account-footer">
        <PressActionButton onClick={handleLogout}>
          <LogOut className="projects-add-project-plus" size={18} strokeWidth={2.5} aria-hidden />
          <span>Выйти из аккаунта</span>
        </PressActionButton>
      </div>
    </div>
  )
}

export default SettingsPage
