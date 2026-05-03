import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getAccessToken, skipAuth } from '../lib/auth'

function isDashboardAccessAllowed(): boolean {
  if (typeof window === 'undefined') return true
  if (skipAuth()) return true
  return !!getAccessToken()
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!isDashboardAccessAllowed()) {
    return <Navigate to="/auth" replace />
  }
  return <>{children}</>
}
