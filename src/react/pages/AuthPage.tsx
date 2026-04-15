import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { useTheme } from '../hooks/useTheme';

const authVideo = new URL('../../assets/auth.mp4', import.meta.url).href;

export function AuthPage() {
  const { toggleTheme } = useTheme();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  usePageMeta('MangaDesk — Вход и регистрация', 'page-auth');

  return (
    <>
      <div className="auth-page-backdrop" aria-hidden="true">
        <video className="auth-page-backdrop-video" autoPlay muted loop playsInline>
          <source src={authVideo} type="video/mp4" />
        </video>
      </div>
      <div className="auth-layout">
        <div className="auth-card">
          <div className="auth-card-aside">
            <button type="button" id="theme-toggle" className="icon-btn auth-theme-btn" aria-label="Сменить тему" onClick={toggleTheme}>
              <Sun className="sun-icon" />
              <Moon className="moon-icon" />
            </button>
            <div className="auth-panel">
              <Link to="/" className="logo-group auth-panel-logo" aria-label="MangaDesk — на главную">
                <div className="logo-icon">
                  <img src="/favicon.svg" alt="" className="main-logo" width="20" height="20" />
                </div>
                <span className="logo-text">MangaDesk</span>
              </Link>
              <p className="auth-welcome">Добро пожаловать!</p>
              <div className="auth-tabs" role="tablist" aria-label="Режим входа">
                <button type="button" className={`auth-tab ${tab === 'login' ? 'is-active' : ''}`} onClick={() => setTab('login')}>
                  Вход
                </button>
                <button
                  type="button"
                  className={`auth-tab ${tab === 'register' ? 'is-active' : ''}`}
                  onClick={() => setTab('register')}
                >
                  Регистрация
                </button>
              </div>
              <div className="auth-tab-panels">
                <div className="auth-tab-panel is-active" hidden={tab !== 'login'}>
                  <div className="auth-oauth">
                    <a href="/dashboard/index.html" className="auth-oauth-btn auth-oauth-btn--google">
                      <span className="auth-oauth-icon auth-oauth-icon--google" aria-hidden="true" />
                      <span>Войти через Google</span>
                    </a>
                    <a href="/dashboard/index.html" className="auth-oauth-btn auth-oauth-btn--vk">
                      <span className="auth-oauth-icon auth-oauth-icon--vk" aria-hidden="true" />
                      <span>Войти через VK</span>
                    </a>
                  </div>
                  <p className="auth-switch">
                    Ещё нет аккаунта?{' '}
                    <button type="button" className="auth-switch-btn" onClick={() => setTab('register')}>
                      Зарегистрируйтесь
                    </button>
                  </p>
                </div>
                <div className="auth-tab-panel is-active" hidden={tab !== 'register'}>
                  <div className="auth-oauth">
                    <a href="/dashboard/index.html" className="auth-oauth-btn auth-oauth-btn--google">
                      <span className="auth-oauth-icon auth-oauth-icon--google" aria-hidden="true" />
                      <span>Продолжить с Google</span>
                    </a>
                    <a href="/dashboard/index.html" className="auth-oauth-btn auth-oauth-btn--vk">
                      <span className="auth-oauth-icon auth-oauth-icon--vk" aria-hidden="true" />
                      <span>Продолжить с VK</span>
                    </a>
                  </div>
                  <p className="auth-switch">
                    Уже зарегистрированы?{' '}
                    <button type="button" className="auth-switch-btn" onClick={() => setTab('login')}>
                      Войдите
                    </button>
                  </p>
                </div>
              </div>
              <p className="auth-back-wrap">
                <Link to="/" className="auth-link-back">
                  На главную
                </Link>
              </p>
            </div>
          </div>
          <div className="auth-card-visual" aria-hidden="true">
            <video className="auth-card-visual-video" autoPlay muted loop playsInline>
              <source src={authVideo} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </>
  );
}
