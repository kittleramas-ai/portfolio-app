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
import { getInitialThemeFn } from '../components/portfolio/theme-fn'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('portfolio-theme');if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}}catch(e){document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}})();`

interface MyRouterContext {
  queryClient: QueryClient
  initialTheme: 'light' | 'dark'
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
  beforeLoad: async ({ context }) => {
    context.initialTheme = await getInitialThemeFn()
  },
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
        rel: 'preload',
        href: '/fonts/anton-latin.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      /* Remaining font preloads kept commented for maximum performance
      {
        rel: 'preload',
        href: '/fonts/bebas-neue-latin.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        href: '/fonts/manrope/manrope-400.ttf',
        as: 'font',
        type: 'font/ttf',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        href: '/fonts/manrope/manrope-500.ttf',
        as: 'font',
        type: 'font/ttf',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        href: '/fonts/manrope/manrope-600.ttf',
        as: 'font',
        type: 'font/ttf',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        href: '/fonts/manrope/manrope-700.ttf',
        as: 'font',
        type: 'font/ttf',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        href: '/fonts/jetbrains-mono/jetbrains-mono-400.ttf',
        as: 'font',
        type: 'font/ttf',
        crossOrigin: 'anonymous',
      },
      */
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

function RootDocument({
  children,
  context,
}: {
  children: React.ReactNode
  context?: MyRouterContext
}) {
  const initialTheme = context?.initialTheme ?? 'light'
  const isDark = initialTheme === 'dark'
  return (
    <html
      lang="en"
      className={isDark ? 'dark' : ''}
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body { background-color: #071A12; color: #EDE8D8; margin: 0; padding: 0; }
              img, svg { max-width: 100%; height: auto; }
              #hero h1 { font-family: Impact, 'Arial Narrow', 'Haettenschweiler', 'Helvetica Neue Condensed', sans-serif; }
            `,
          }}
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className="bg-obsidian-base text-text-primary antialiased min-h-screen relative selection:bg-[#D4AF37] selection:text-[#071A12] overflow-x-hidden"
        suppressHydrationWarning
      >
        <ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>
        {/* Bottom viewport blur overlay — fades content into frosted blur near
            the bottom of the viewport. Creates a "coming from blur" transition
            between sections. */}
        <div className="viewport-bottom-blur" aria-hidden="true" />
        <PublicFavicon />
        {process.env.NODE_ENV === 'development' ? (
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
        ) : null}
        <Scripts />
      </body>
    </html>
  )
}
