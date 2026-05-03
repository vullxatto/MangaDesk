import { Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import housePng from '../assets/images/house.png'
import kittyPng from '../assets/images/kitty.png'
import treePng from '../assets/images/tree.png'
import googleIcon from '../assets/svg/Google.svg'
import vkIcon from '../assets/svg/VK.svg'
import { PageScaler } from '../components/PageScaler'
import { getApiBaseUrl } from '../lib/api'
import { getAccessToken, skipAuth } from '../lib/auth'

type AuthTab = 'login' | 'register'

function oauthStart(provider: 'google' | 'vk', intent: AuthTab) {
  const api = getApiBaseUrl()
  if (!api) {
    window.alert('Задайте VITE_API_URL в .env для входа через OAuth.')
    return
  }
  const rawBase = import.meta.env.BASE_URL || '/'
  const normalized = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase
  const path = normalized ? `${normalized}/auth/callback` : '/auth/callback'
  const redirect = `${window.location.origin}${path}`
  const enc = encodeURIComponent(redirect)
  window.location.href = `${api}/auth/${provider}/login?intent=${intent}&redirect=${enc}`
}

export function AuthPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<AuthTab>('login')

  useEffect(() => {
    if (skipAuth() || getAccessToken()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const googleLabel = tab === 'login' ? 'Войти через Google' : 'Продолжить с Google'
  const vkLabel = tab === 'login' ? 'Войти через VK' : 'Продолжить с VK'

  return (
    <PageScaler designWidth={760}>
      <div className="app-shell app-shell--auth">
        <div className="hero-section-frame">
          <main className="app-main">
            <section className="landing-hero auth-landing" aria-label="Вход и регистрация">
              <div className="auth-landing__bg-tree" aria-hidden>
                <img className="auth-landing__tree-img" src={treePng} alt="" loading="lazy" decoding="async" />
              </div>
              <div className="auth-landing__bg-house" aria-hidden>
                <img className="auth-landing__house-img" src={housePng} alt="" loading="lazy" decoding="async" />
              </div>
              <div className="content-window auth-landing__panel">
                <span className="btn-press-wrap btn-press-wrap--design window-close-wrap auth-landing__theme">
                  <button className="window-close btn-press" type="button" aria-label="Тема">
                    <Sun size={12} strokeWidth={2} />
                  </button>
                </span>

                <div className="auth-landing__panel-body">
                  <div className="auth-landing__brand">
                    <Link className="site-logo" to="/">
                      <span className="site-logo-box" aria-hidden>
                        <img className="site-logo-icon" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" />
                      </span>
                      <span className="site-logo-word" aria-hidden>
                        <span className="site-logo-char site-logo-char--big">M</span>
                        <span className="site-logo-char">anga</span>
                        <span className="site-logo-char site-logo-char--big">D</span>
                        <span className="site-logo-char">esk</span>
                      </span>
                    </Link>
                  </div>

                  <div className="window-inner">
                    <h2>Добро пожаловать!</h2>
                  </div>

                  <div className="auth-landing__stack">
                    <div className="auth-tabs" role="tablist" aria-label="Вход или регистрация">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={tab === 'login'}
                        className={tab === 'login' ? 'auth-tabs__btn auth-tabs__btn--active' : 'auth-tabs__btn'}
                        onClick={() => setTab('login')}
                      >
                        Вход
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={tab === 'register'}
                        className={tab === 'register' ? 'auth-tabs__btn auth-tabs__btn--active' : 'auth-tabs__btn'}
                        onClick={() => setTab('register')}
                      >
                        Регистрация
                      </button>
                    </div>

                    <div className="features__extras auth-landing__oauth" id="auth-panel" role="tabpanel">
                      <button
                        type="button"
                        className="pricing__btn pricing__btn--outline auth-oauth-btn"
                        style={{ marginTop: 0 }}
                        onClick={() => oauthStart('google', tab)}
                      >
                        <img className="auth-oauth-img" src={googleIcon} alt="" width={21} height={21} />
                        <span className="auth-oauth-label">{googleLabel}</span>
                        <span className="auth-oauth-balance" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="pricing__btn pricing__btn--outline auth-oauth-btn"
                        style={{ marginTop: 0 }}
                        onClick={() => oauthStart('vk', tab)}
                      >
                        <img className="auth-oauth-img" src={vkIcon} alt="" width={21} height={21} />
                        <span className="auth-oauth-label">{vkLabel}</span>
                        <span className="auth-oauth-balance" aria-hidden />
                      </button>
                    </div>

                    {tab === 'login' ? (
                      <p className="pricing__promo auth-landing__hint">
                        Ещё нет аккаунта?{' '}
                        <button
                          type="button"
                          className="pricing__promo-link auth-landing__hint-link"
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          onClick={() => setTab('register')}
                        >
                          Зарегистрируйтесь
                        </button>
                      </p>
                    ) : (
                      <p className="pricing__promo auth-landing__hint">
                        Уже зарегистрированы?{' '}
                        <button
                          type="button"
                          className="pricing__promo-link auth-landing__hint-link"
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          onClick={() => setTab('login')}
                        >
                          Войдите
                        </button>
                      </p>
                    )}
                  </div>
                </div>
                <div className="auth-landing__kitty" aria-hidden>
                  <img className="auth-landing__kitty-img" src={kittyPng} alt="" loading="lazy" decoding="async" />
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </PageScaler>
  )
}
