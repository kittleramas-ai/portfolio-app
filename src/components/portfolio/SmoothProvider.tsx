import * as React from 'react'
import {
  setSmoother,
  getSmoother,
  prefersReducedMotion,
  isMobileDevice,
} from '../../lib/gsap'
import { loadGsap } from '../../lib/gsapLoader'
import type { ScrollSmoother } from 'gsap/ScrollSmoother'
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'

type SmoothProviderProps = {
  children: React.ReactNode
  /** 0.5 - 2, higher = smoother/laggier. 1.2 is a good default. */
  smooth?: number
  className?: string
}

/**
 * GSAP ScrollSmoother wrapper — GSAP only, no Lenis.
 *
 * Renders the required #smooth-wrapper / #smooth-content structure and
 * creates ScrollSmoother once on the client.
 *
 * Keep fixed elements (Navbar header, SiteBackdrop, side nav) OUTSIDE
 * this provider — only scrollable content goes inside.
 */
export function SmoothProvider({
  children,
  smooth = 1.2,
  className = '',
}: SmoothProviderProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)

  // Mobile setup (runs before the smoother effect below): strip the
  // smoother ids so #smooth-content's will-change layer is not created,
  // and use native smooth anchor scrolling.
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isMobileDevice()) return
    const wrapper = rootRef.current
    wrapper?.removeAttribute('id')
    wrapper?.firstElementChild?.removeAttribute('id')
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null
      if (!anchor) return
      const hash = anchor.getAttribute('href')
      if (!hash || hash.length < 2) return
      const target = document.querySelector(hash)
      if (!target) return
      e.preventDefault()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.history.pushState(null, '', hash)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    if (prefersReducedMotion()) return
    // Mobile: native scroll — GSAP is never even downloaded.
    if (isMobileDevice()) return

    let cancelled = false
    let smoother: ScrollSmoother | null = null
    let ST: typeof ScrollTriggerType | null = null
    let onClick: ((e: MouseEvent) => void) | null = null
    let onLoad: (() => void) | null = null
    let deepTimer: number | undefined

    document.documentElement.classList.add('gsap-smoothing')

    loadGsap().then(
      ({ ScrollSmoother: SS, ScrollTrigger }) => {
        if (cancelled) return
        ST = ScrollTrigger

        // Avoid double-init in StrictMode
        if (getSmoother()) {
          ScrollTrigger.refresh()
          return
        }

        try {
          smoother = SS.create({
            wrapper: '#smooth-wrapper',
            content: '#smooth-content',
            smooth,
            effects: true,
            normalizeScroll: true,
            ignoreMobileResize: true,
          })
          setSmoother(smoother)
        } catch (err) {
          console.warn('[SmoothProvider] ScrollSmoother failed, falling back to native scroll.', err)
          return
        }

        onClick = (e: MouseEvent) => {
          const anchor = (e.target as HTMLElement).closest?.(
            'a[href^="#"]',
          ) as HTMLAnchorElement | null
          if (!anchor) return
          const hash = anchor.getAttribute('href')
          if (!hash || hash.length < 2) return
          const target = document.querySelector(hash)
          if (!target) return
          e.preventDefault()
          try {
            smoother?.scrollTo(target as any, true)
          } catch {
            target.scrollIntoView({ behavior: 'smooth' })
          }
          // keep URL in sync without jumping
          window.history.pushState(null, '', hash)
          // The smooth flight lands ~1s later with shifted layout (fonts/images);
          // re-measure triggers on arrival so the target section's reveals fire
          // instead of sitting hidden below stale positions.
          window.setTimeout(() => ST?.refresh(), 1400)
        }

        document.addEventListener('click', onClick)

        // Webfonts shift text height after triggers are measured — re-measure.
        if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
          ;(document as any).fonts.ready.then(() => ST?.refresh())
        }

        // Deep-link on load: /#ventures etc.
        if (window.location.hash) {
          const initial = window.location.hash
          // wait a tick for layout + smoother to settle
          deepTimer = window.setTimeout(() => {
            const target = document.querySelector(initial)
            if (target) {
              try {
                smoother?.scrollTo(target as any, false)
              } catch {
                /* noop */
              }
            }
            ST?.refresh()
          }, 100)
        }

        onLoad = () => ST?.refresh()
        window.addEventListener('load', onLoad)
      },
      (err) => {
        console.warn('[SmoothProvider] GSAP failed to load, using native scroll.', err)
      },
    )

    return () => {
      cancelled = true
      if (deepTimer !== undefined) window.clearTimeout(deepTimer)
      if (onClick) document.removeEventListener('click', onClick)
      if (onLoad) window.removeEventListener('load', onLoad)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smooth])

  // Kill smoother on unmount (route change in SPA)
  React.useEffect(() => {
    return () => {
      const s = getSmoother()
      if (s) {
        try {
          s.kill()
        } catch {
          /* noop */
        }
        setSmoother(null)
      }
    }
  }, [])

  return (
    <div ref={rootRef} id="smooth-wrapper" className={className}>
      <div id="smooth-content">{children}</div>
    </div>
  )
}
