import { Sun } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authVideo from '../assets/video/auth.mp4'
import googleIcon from '../assets/svg/Google.svg'
import vkIcon from '../assets/svg/VK.svg'

type AuthTab = 'login' | 'register'

export function AuthPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<AuthTab>('login')

  function goDashboardStub() {
    localStorage.setItem('mangadesk-authed', '1')
    navigate('/dashboard')
  }

  const googleLabel = tab === 'login' ? 'Войти через Google' : 'Продолжить с Google'
  const vkLabel = tab === 'login' ? 'Войти через VK' : 'Продолжить с VK'

  const linkAccent = { color: 'rgba(var(--fg-rgb), 0.72)' } as const

  return (
    <div className="app-shell">
      <div className="hero-section-frame">
        <main className="app-main">
          <section className="landing-hero auth-landing" aria-label="Вход и регистрация">
            <div className="hero-image-side">
              <div className="content-window auth-landing__panel">
                <span className="btn-press-wrap btn-press-wrap--design window-close-wrap auth-landing__theme">
                  <button className="window-close btn-press" type="button" aria-label="Тема">
                    <Sun size={13} strokeWidth={2} />
                  </button>
                </span>

                <div className="auth-landing__brand">
                  <Link className="site-logo" to="/">
                    <span className="site-logo-box" aria-hidden>
                      <img className="site-logo-icon" src="/favicon.svg" alt="" />
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
                    onClick={goDashboardStub}
                  >
                    <img className="auth-oauth-img" src={googleIcon} alt="" width={22} height={22} />
                    <span className="auth-oauth-label">{googleLabel}</span>
                    <span className="auth-oauth-balance" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="pricing__btn pricing__btn--outline auth-oauth-btn"
                    style={{ marginTop: 0 }}
                    onClick={goDashboardStub}
                  >
                    <img className="auth-oauth-img" src={vkIcon} alt="" width={22} height={22} />
                    <span className="auth-oauth-label">{vkLabel}</span>
                    <span className="auth-oauth-balance" aria-hidden />
                  </button>
                </div>

                {tab === 'login' ? (
                  <p className="pricing__promo auth-landing__hint" style={{ marginTop: 'var(--space-4)' }}>
                    Ещё нет аккаунта?{' '}
                    <button
                      type="button"
                      className="pricing__promo-link auth-landing__hint-link"
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        ...linkAccent,
                        textDecoration: 'underline',
                      }}
                      onClick={() => setTab('register')}
                    >
                      Зарегистрируйтесь
                    </button>
                  </p>
                ) : (
                  <p className="pricing__promo auth-landing__hint" style={{ marginTop: 'var(--space-4)' }}>
                    Уже зарегистрированы?{' '}
                    <button
                      type="button"
                      className="pricing__promo-link auth-landing__hint-link"
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        ...linkAccent,
                        textDecoration: 'underline',
                      }}
                      onClick={() => setTab('login')}
                    >
                      Войдите
                    </button>
                  </p>
                )}

              </div>
            </div>

            <div className="hero-text-side auth-landing__media-col">
              <div className="content-window auth-landing__panel auth-landing__panel--video">
                <video
                  src={authVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
