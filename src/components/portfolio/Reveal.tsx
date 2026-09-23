import * as React from 'react'
import { prefersReducedMotion, isMobileDevice } from '../../lib/gsap'
import { loadGsap } from '../../lib/gsapLoader'

type RevealProps = {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'section' | 'span'
}

/**
 * GSAP scroll-reveal wrapper — same API as before, now powered by ScrollTrigger.
 * Works inside ScrollSmoother. Falls back to visible content on reduced-motion / SSR.
 */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className = '',
  as = 'div',
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [mobileVisible, setMobileVisible] = React.useState(false)
  // Set post-mount so SSR + first client render stay identical (no hydration mismatch).
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    if (isMobileDevice()) setIsMobile(true)
  }, [])

  // Mobile: single IntersectionObserver + CSS transition, zero ScrollTriggers.
  React.useEffect(() => {
    if (!isMobile) return
    const el = ref.current
    if (!el || typeof window === 'undefined') return
    if (typeof IntersectionObserver === 'undefined') {
      setMobileVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setMobileVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isMobile])

  React.useEffect(() => {
    // Sync guard (not just `isMobile` state): on first mount the state is
    // still false (SSR-safe default), so without this the GSAP chunk would
    // download on mobile before the detector effect flips the state.
    if (isMobile || isMobileDevice()) return
    const el = ref.current
    if (!el || typeof window === 'undefined') return
    if (prefersReducedMotion()) return

    let cancelled = false
    let revert: (() => void) | null = null

    // GSAP loads lazily (separate chunk) — never in the initial bundle.
    loadGsap().then(
      ({ gsap }) => {
        if (cancelled || !ref.current) return
        const ctx = gsap.context(() => {
          gsap.fromTo(
            el,
            { y, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.9,
              delay: delay / 1000,
              ease: 'power3.out',
              overwrite: true,
              // Don't pre-hide below-fold content: if a trigger measurement is
              // stale after a fast anchor jump, content stays visible instead of
              // stuck invisible.
              immediateRender: false,
              scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                once: true,
              },
            },
          )
        }, ref)
        revert = () => ctx.revert()
      },
      () => {
        /* GSAP failed — content stays visible (no pre-hide applied) */
      },
    )

    return () => {
      cancelled = true
      revert?.()
    }
  }, [delay, y, isMobile])

  const Tag = as as 'div'

  // Mobile: CSS-only reveal (no GSAP, no will-change layer).
  if (isMobile) {
    return (
      <Tag
        ref={ref as any}
        className={`reveal ${mobileVisible ? 'reveal-visible' : ''} ${className}`.trim()}
        style={
          {
            '--reveal-y': `${y}px`,
            transitionDelay: delay ? `${delay}ms` : undefined,
          } as React.CSSProperties
        }
      >
        {children}
      </Tag>
    )
  }

  return (
    <Tag
      ref={ref as any}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </Tag>
  )
}
