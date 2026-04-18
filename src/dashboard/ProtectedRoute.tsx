import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

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
