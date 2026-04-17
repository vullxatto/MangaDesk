import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

/** Заглушка до бэкенда: при необходимости заменить на реальную проверку сессии. */
function isDashboardAccessAllowed(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem('mangadesk-authed') !== 'false'
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!isDashboardAccessAllowed()) {
    return <Navigate to="/auth" replace />
  }
  return <>{children}</>
}
