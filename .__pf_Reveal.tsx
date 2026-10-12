import * as React from 'react'
import { prefersReducedMotion, isMobileDevice } from '../../routes/lib/gsap'
import { loadGsap } from '../../routes/lib/gsapLoader'

type RevealProps = {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'section' | 'span'
}

/**
 * GSAP scroll-reveal wrapper ΓÇö same API as before, now powered by ScrollTrigger.
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
  /**
   * Content that is already on screen when the component mounts.
   *
   * A ScrollTrigger for an element inside the first viewport fires the moment
   * GSAP registers it ΓÇö which is not mount time, it is whenever a ~1.2MB lazy
   * import finishes. So every above-the-fold `Reveal` used to sit untouched
   * until the download landed, then hide and animate in. Above-the-fold
   * content has nothing to reveal *from*; the visitor is already looking at
   * it, so the JS path can only add a late, unrequested animation.
   *
   * These render through the CSS transition instead, which begins at first
   * paint. Below-the-fold content keeps ScrollTrigger, because there the
   * trigger genuinely is the right mechanism and the download latency is
   * hidden by the fact that the element is off screen anyway.
   */
  const [isInInitialViewport, setIsInInitialViewport] = React.useState(false)
  // Set post-mount so SSR + first client render stay identical (no hydration mismatch).
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    if (isMobileDevice()) setIsMobile(true)
  }, [])

  /**
   * Measure once, before anything animates, so the decision cannot depend on
   * load order. `getBoundingClientRect().top < innerHeight` is a viewport test,
   * not an IntersectionObserver: IO batches its first callback to the next
   * frame, which is exactly the delay being removed.
   */
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined') return
    setIsInInitialViewport(el.getBoundingClientRect().top < window.innerHeight)
  }, [])

  /** CSS transition, used for both mobile and already-on-screen content. */
  const revealWithCss = isMobile || isInInitialViewport

  React.useEffect(() => {
    if (revealWithCss) return
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
  }, [revealWithCss])

  React.useEffect(() => {
    // Sync guard (not just `isMobile` state): on first mount the state is
    // still false (SSR-safe default), so without this the GSAP chunk would
    // download on mobile before the detector effect flips the state.
    if (revealWithCss || isMobileDevice()) return
    const el = ref.current
    if (!el || typeof window === 'undefined') return
    if (prefersReducedMotion()) return

    let cancelled = false
    let revert: (() => void) | null = null

    // GSAP loads lazily (separate chunk) ΓÇö never in the initial bundle.
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
        /* GSAP failed ΓÇö content stays visible (no pre-hide applied) */
      },
    )

    return () => {
      cancelled = true
      revert?.()
    }
  }, [delay, y, revealWithCss])

  const Tag = as as 'div'

  // CSS-only reveal: above-the-fold content, or every mobile visitor. No GSAP,
  // no will-change layer left behind after the transition ends.
  if (revealWithCss) {
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
