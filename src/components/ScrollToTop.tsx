import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Сбрасывает скролл окна при переходе на другой маршрут (без учёта hash — якоря на лендинге не ломаем). */
export function ScrollToTop() {
  const { pathname, search } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])

  return null
}
