import { CreditCard, Link2, LogOut, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { apiDelete, apiGet, getApiBaseUrl } from '../../../lib/api'

type AccountPageProps = {
  title?: string
}

export default function AccountPage({ title = 'Личный кабинет' }: AccountPageProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [linkedProviders, setLinkedProviders] = useState<Array<{ provider: 'google' | 'vk'; provider_user_id: string }>>(
    [],
  )
  const [providersLoading, setProvidersLoading] = useState(false)
  const [providersError, setProvidersError] = useState<string | null>(null)

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

  function handleLogout() {
    logout()
    void navigate('/auth', { replace: true })
  }

  function startLink(provider: 'google' | 'vk') {
    const api = getApiBaseUrl()
    const redirect = `${window.location.origin}/dashboard/account`
    window.location.href = `${api}/auth/link/${provider}/start?redirect=${encodeURIComponent(redirect)}`
  }

  async function unlink(provider: 'google' | 'vk') {
    try {
      await apiDelete(`/auth/providers/${provider}`)
      await reloadProviders()
    } catch (e) {
      setProvidersError(e instanceof Error ? e.message : 'Не удалось отвязать провайдер')
    }
  }

  return (
    <div className="chapters-page projects-page account-page">
      <div className="dashboard-toolbar projects-page-toolbar">
        <h1>{title}</h1>
      </div>
      <div className="account-grid">
        <section className="account-card">
          <h2>Профиль</h2>
          <label className="account-field">
            <span>Имя пользователя</span>
            <input className="account-input" defaultValue="Still Rise" />
          </label>
          <button type="button" className="dashboard-new-btn">
            Сохранить имя
          </button>
        </section>

        <section className="account-card">
          <h2>
            <CreditCard size={16} strokeWidth={2} /> Подписка
          </h2>
          <p className="account-muted">Текущий тариф: Pro Team (демо)</p>
          <button type="button" className="dashboard-new-btn">
            Оплатить подписку
          </button>
        </section>

        <section className="account-card">
          <h2>
            <Link2 size={16} strokeWidth={2} /> Соцсети
          </h2>
          <div className="account-socials">
            <button
              type="button"
              className="account-social-btn"
              onClick={() => (linkedSet.has('google') ? void unlink('google') : startLink('google'))}
              disabled={providersLoading}
            >
              {linkedSet.has('google') ? 'Отвязать Google' : 'Привязать Google'}
            </button>
            <button
              type="button"
              className="account-social-btn"
              onClick={() => (linkedSet.has('vk') ? void unlink('vk') : startLink('vk'))}
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

        <section className="account-card">
          <h2>
            <Wallet size={16} strokeWidth={2} /> Баланс токенов
          </h2>
          <label className="account-field">
            <span>Сумма пополнения</span>
            <input className="account-input" defaultValue="5000" />
          </label>
          <button type="button" className="dashboard-new-btn">
            Пополнить токены
          </button>
        </section>
      </div>
      <div className="account-footer">
        <button type="button" className="account-logout-btn" onClick={handleLogout}>
          <LogOut size={16} strokeWidth={2} aria-hidden />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  )
}
