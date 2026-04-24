import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { LandingScrollSpyProvider } from '../context/LandingScrollSpy'
import { ArticlesSection } from './ArticlesSection'
import { Faq } from './Faq'
import { Features } from './Features'
import { Landing } from './Landing'
import { HowItWorks } from './HowItWorks'
import { Pricing } from './Pricing'

function useScrollToHash() {
  const location = useLocation()
  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.slice(1)
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [location])
}

export function HomePage() {
  useScrollToHash()
  return (
    <div className="home-page">
      <LandingScrollSpyProvider>
        <Layout hero={<Landing />}>
          <HowItWorks />
          <Features />
          <ArticlesSection />
          <Pricing />
          <Faq />
        </Layout>
      </LandingScrollSpyProvider>
    </div>
  )
}
