import type { MouseEvent } from 'react'

/** Полная перезагрузка: на главной без якоря — reload, иначе переход на / с новой загрузкой. */
export function reloadHome(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  const { pathname, search, hash } = window.location
  if (pathname === '/' && !search && !hash) {
    window.location.reload()
    return
  }
  window.location.href = '/'
}
