import type { MouseEvent } from 'react'

/** Полная перезагрузка: на главной без якоря — reload, иначе переход на корень приложения (с учётом Vite base / GitHub Pages). */
export function reloadHome(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  const { pathname, search, hash } = window.location
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
  const normalized = pathname.replace(/\/$/, '') || '/'
  const atHome = normalized === (basePath || '/') || normalized === basePath
  if (atHome && !search && !hash) {
    window.location.reload()
    return
  }
  window.location.href = import.meta.env.BASE_URL
}
