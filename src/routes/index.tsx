import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '../components/portfolio/Navbar'
import { SiteBackdrop } from '../components/portfolio/SiteBackdrop'
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

export function Home() {
  return (
    <div className="min-h-screen bg-black text-text-primary antialiased selection:bg-primary-container selection:text-text-primary overflow-x-hidden">
      <SiteBackdrop />
      <Navbar />
      <main className="w-full relative z-10 lg:pr-[150px]">
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
      <div className="relative z-10 lg:pr-[150px]">
        <Footer />
      </div>
    </div>
  )
}

