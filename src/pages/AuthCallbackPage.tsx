import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAccessToken } from '../lib/auth'

/**
 * Google/VK редирект сюда с hash: #access_token=...
 */
export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
    const params = new URLSearchParams(hash)
    const token = params.get('access_token')
    if (!token) {
      setErr('Токен не найден. Попробуйте войти снова.')
      return
    }
    setAccessToken(token)
    window.history.replaceState(null, '', window.location.pathname)
    navigate('/dashboard', { replace: true })
  }, [navigate])

  if (err) {
    return (
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <p>{err}</p>
        <button type="button" onClick={() => navigate('/auth', { replace: true })}>
          На страницу входа
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <p>Вход выполняется…</p>
    </div>
  )
}
