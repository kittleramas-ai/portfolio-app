import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '../components/portfolio/Navbar'
import { SiteBackdrop } from '../components/portfolio/SiteBackdrop'
import { SmoothProvider } from '../components/portfolio/SmoothProvider'
import { HeroSection } from '../components/portfolio/HeroSection'
import { MilestonesSection } from '../components/portfolio/MilestonesSection'
import { AboutSection } from '../components/portfolio/AboutSection'
import { VenturesSection } from '../components/portfolio/VenturesSection'
import { QuoteSection } from '../components/portfolio/QuoteSection'
import { AchievementsSection } from '../components/portfolio/AchievementsSection'
import { KeynotesSection } from '../components/portfolio/KeynotesSection'
import { GovernanceSection } from '../components/portfolio/GovernanceSection'
import { PerspectivesSection } from '../components/portfolio/PerspectivesSection'
import { ContactSection } from '../components/portfolio/ContactSection'
import { Footer } from '../components/portfolio/Footer'

export const Route = createFileRoute('/')({ component: Home })

// NOTE: keep Home exported (not code-split). The workspace path contains an
// apostrophe, which breaks TanStack Start's generated split-import quoting.
export function Home() {
  return (
    <div className="min-h-screen bg-obsidian-base text-text-primary antialiased selection:bg-primary-container selection:text-text-primary overflow-x-hidden">
      {/* Fixed elements stay OUTSIDE ScrollSmoother */}
      <SiteBackdrop />
      <Navbar />
      <SmoothProvider>
        <main className="w-full relative z-10">
          <HeroSection />
          <MilestonesSection />
          <AboutSection />
          <VenturesSection />
          <QuoteSection />
          <AchievementsSection />
          <KeynotesSection />
          <GovernanceSection />
          <PerspectivesSection />
          <ContactSection />
        </main>
        <div className="relative z-10">
          <Footer />
        </div>
      </SmoothProvider>
    </div>
  )
}

