import { createFileRoute } from '@tanstack/react-router'
// import { Navbar } from '../components/portfolio/Navbar'
import { SiteBackdrop } from '../components/portfolio/SiteBackdrop'
import { Navbar } from '../components/portfolio/Navbar'
import { SmoothProvider } from '../components/portfolio/SmoothProvider'
import { ChatbotFab } from '../components/portfolio/ChatbotFab'
import { WhatsAppFab } from '../components/portfolio/WhatsAppFab'
import { lazy, Suspense } from 'react'
import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { LoaderCircle } from 'lucide-react'
import {
  getPublicMediaFn,
  getPublicSettingsFn,
} from '../../admin/server/public.ts'
import type { SignatureMedia } from '../components/portfolio/media-types'
import type { FooterSettings } from '../../admin/server/settings-schema'
import { isMobileDevice, prefersReducedMotion } from './lib/gsap'



//Lazy Dynamic import
function LoadingFallback({ centered = false }: { centered?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center ${centered ? 'min-h-svh' : 'py-4'}`}
      role="status"
    >
      <LoaderCircle
        className="size-6 animate-spin text-text-primary dark:text-accent-gold"
        aria-hidden="true"
      />
      <span className="sr-only">Loading</span>
    </div>
  )
}


import { HeroSection } from '../components/portfolio/HeroSection'
import { MilestonesSection } from '../components/portfolio/MilestonesSection'
const AboutSection = lazy(()=> import('../components/portfolio/AboutSection').then(({AboutSection})=>({default:AboutSection})));
const QuoteSection = lazy(()=> import('../components/portfolio/QuoteSection').then(({QuoteSection})=>({default:QuoteSection})));
const VenturesSection = lazy(()=>import('../components/portfolio/VenturesSection').then(({VenturesSection})=> ({default:VenturesSection})));
const AchievementsSection = lazy(()=> import('../components/portfolio/AchievementsSection').then(({AchievementsSection})=>({default:AchievementsSection})));
const KeynotesSection = lazy(() =>
  import('../components/portfolio/KeynotesSection').then((b) => ({
    default: b.KeynotesSection,
  })),
);
const GovernanceSection =lazy(()=> import('../components/portfolio/GovernanceSection').then(({GovernanceSection})=> ({default:GovernanceSection})));
const PerspectivesSection = lazy(()=>import('../components/portfolio/PerspectivesSection').then(({PerspectivesSection})=> ({default:PerspectivesSection})));
const BooksSection = lazy(()=> import('../components/portfolio/BooksSection').then(({BooksSection})=> ({default:BooksSection})));
const ContactSection = lazy(()=> import('../components/portfolio/ContactSection').then(({ContactSection})=> ({default:ContactSection})));
// Footer is small — no need to code-split; avoids triple-lazy cascade (lazy + mainReady + IntersectionObserver)
import { Footer } from '../components/portfolio/Footer';
export const Route = createFileRoute('/')({
  /**
   * Read editable settings and uploaded images server-side, and hand them to
   * the page as loader data, so the hero copy and photos
   * render on first paint. A client fetch would flash the defaults first.
   *
   * Goes through server functions because admin/server/public.ts reaches the
   * database, and this route file is also compiled into the client bundle.
   */
  loader: async () => {
    const [settings, media] = await Promise.all([
      getPublicSettingsFn(),
      getPublicMediaFn(),
    ])
    const bySlot = new Map(media.map((m) => [m.slot, m]))
    return {
      settings,
      signature: bySlot.get('signature') ?? null,
      portrait: bySlot.get('hero_portrait') ?? null,
      whatsappIcon: bySlot.get('whatsapp_icon') ?? null,
    }
  },
  head: ({ loaderData }) => {
    const portrait = loaderData?.portrait
    const href = portrait?.url || '/uploads/hero_portrait-300.webp'
    const imageSrcSet = portrait?.responsiveSrcSet || undefined
    return {
      links: [
        {
          rel: 'preload',
          as: 'image',
          href,
          imageSrcSet,
          imageSizes: '(max-width: 639px) 270px, (max-width: 1023px) 300px, 320px',
        },
      ],
    }
  },
  component: Home,
})


// NOTE: keep Home exported (not code-split). The workspace path contains an
// apostrophe, which breaks TanStack Start's generated split-import quoting.
export function Home() {
  const { settings, signature, portrait, whatsappIcon } = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-obsidian-base text-text-primary antialiased selection:bg-[#D4AF37] selection:text-[#071A12] overflow-x-hidden">
      {/* Fixed elements stay OUTSIDE ScrollSmoother */}

<SiteBackdrop />
      <Navbar signature={signature} settings={settings.navbar} />
      <ChatbotFab settings={settings.chatbot} />
      <WhatsAppFab contact={settings.contact} icon={whatsappIcon} />
      <SmoothProvider>

        <main className="w-full relative z-10">
          <HeroSection settings={settings.hero} portrait={portrait} />
          <MilestonesSection settings={settings.milestones} />
          <Suspense fallback={<LoadingFallback />}>
            <AboutSection settings={settings.about} />
            <VenturesSection settings={settings.ventures} />
            <QuoteSection settings={settings.quote} />
            <AchievementsSection settings={settings.achievements} />
            <KeynotesSection settings={settings.keynotes} />
            <GovernanceSection settings={settings.governance} />
            <PerspectivesSection settings={settings.perspectives} />
            <BooksSection settings={settings.books} />
            <ContactSection settings={settings.advisory} contact={settings.contact} />
          </Suspense>
        </main>
        <Footer
          signature={signature}
          settings={settings.footer}
        />
      </SmoothProvider>
      
    </div>


  )
}

