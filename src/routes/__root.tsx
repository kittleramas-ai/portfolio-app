import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { useEffect } from 'react'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import { ThemeProvider } from '../components/portfolio/theme'
import { getPublicMediaFn } from '../../admin/server/public.ts'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('portfolio-theme');if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}}catch(e){document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}})();`

interface MyRouterContext {
  queryClient: QueryClient
  /**
   * The incoming request, so route guards can read cookies server-side.
   *
   * TanStack Router does not put `request` on `beforeLoad`'s context in this
   * version, and a client-side guard is not acceptable for admin routes: it
   * would send the whole admin bundle to an anonymous visitor before bouncing
   * them. getRequest() from @tanstack/react-start/server works inside
   * beforeLoad during SSR, so the guard is created with it as a fallback.
   */
  request?: Request
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      {
        title:
          'Dr. R. Surendiran | Founder — Infodazz, Kittle, Seventh Sense Research Group & Kaster Trust',
      },
      {
        name: 'description',
        content:
          'Dr. R. Surendiran — Founder & CEO of Infodazz, Founder of Kittle Pvt Ltd, Seventh Sense Research Group and Kaster Trust. Building technology businesses, research platforms and social impact initiatives.',
      },
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Manrope:wght@400;500;600;700;800&family=Hanken+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Anton&family=Bebas+Neue&family=Syne:wght@700;800&family=Great+Vibes&display=swap',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function PublicFavicon() {
  useEffect(() => {
    let cancelled = false
    getPublicMediaFn()
      .then((media) => {
        const favicon = media.find((m) => m.slot === 'favicon' && m.url)
        if (cancelled || !favicon?.url) return
        let link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
        if (!link) {
          link = document.createElement('link')
          link.rel = 'icon'
          document.head.appendChild(link)
        }
        link.href = favicon.url
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])
  return null
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="bg-obsidian-base text-text-primary antialiased min-h-screen relative selection:bg-[#D4AF37] selection:text-[#071A12] overflow-x-hidden">
        <ThemeProvider>{children}</ThemeProvider>
        <PublicFavicon />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
