import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const SECTION_IDS = ['how', 'features', 'articles', 'pricing', 'faq'] as const

const LandingScrollSpyContext = createContext<string | null>(null)

function readHeaderAnchorPx(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--site-header-row-height')
    .trim()
  const n = parseFloat(raw)
  return Number.isFinite(n) ? n : 44
}

function getActiveSectionId(): string {
  const anchor = window.scrollY + readHeaderAnchorPx() + 8
  let active = ''
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id)
    if (!el) continue
    const top = el.getBoundingClientRect().top + window.scrollY
    if (top <= anchor) active = id
  }
  return active
}

export function LandingScrollSpyProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<string>('')

  const update = useCallback(() => {
    setActiveSection(getActiveSectionId())
  }, [])

  useEffect(() => {
    update()
    let ticking = false
    const onScrollOrResize = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        update()
      })
    }
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)
    const t = window.setTimeout(update, 100)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
      window.clearTimeout(t)
    }
  }, [update])

  const value = useMemo(() => (activeSection === '' ? null : activeSection), [activeSection])

  return (
    <LandingScrollSpyContext.Provider value={value}>{children}</LandingScrollSpyContext.Provider>
  )
}

export function useLandingActiveSection(): string | null {
  return useContext(LandingScrollSpyContext)
}
