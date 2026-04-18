import { useContext } from 'react'
import { LandingScrollSpyContext } from './landingScrollSpyContext'

export function useLandingActiveSection(): string | null {
  return useContext(LandingScrollSpyContext)
}
