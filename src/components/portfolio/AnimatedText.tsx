import * as React from 'react'
import { prefersReducedMotion, isMobileDevice } from '../../lib/gsap'
import { loadGsap } from '../../lib/gsapLoader'
import type { SplitText as SplitTextType } from 'gsap/SplitText'

type SplitKind = 'chars' | 'words' | 'lines' | 'chars,words' | 'words,lines' | 'chars,words,lines'
type AnimateMode = 'load' | 'scroll' | 'scrub'

type AnimatedTextProps = {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'blockquote' | 'div' | 'span'
  split?: SplitKind
  mode?: AnimateMode
  stagger?: number
  duration?: number
  y?: number
  delay?: number
  ease?: string
  start?: string
  className?: string
  style?: React.CSSProperties
  id?: string
  children: React.ReactNode
}

/**
 * Reusable GSAP text animation — GSAP only (SplitText + ScrollTrigger).
 *
 * - mode="load": plays on mount (hero headline)
 * - mode="scroll": plays once when scrolled into view (section headings)
 * - mode="scrub": scrub-linked word reveal (quote / editorial)
 *
 * SSR-safe: renders plain text on server, splits only on client.
 * Respects prefers-reduced-motion.
 */
export function AnimatedText({
  as = 'div',
  split = 'words',
  mode = 'scroll',
  stagger,
  duration = 0.8,
  y = 36,
  delay = 0,
  ease = 'power3.out',
  start = 'top 86%',
  className = '',
  style,
  id,
  children,
}: AnimatedTextProps) {
  const ref = React.useRef<HTMLElement | null>(null)
  const [mobileVisible, setMobileVisible] = React.useState(false)
  // Set post-mount so SSR + first client render stay identical (no hydration mismatch).
  const [isMobile, setIsMobile] = React.useState(false)

  const defaultStagger = React.useMemo(() => {
    if (stagger !== undefined) return stagger
    if (split.includes('chars')) return 0.018
    return 0.045
  }, [stagger, split])

  React.useEffect(() => {
    if (isMobileDevice()) setIsMobile(true)
  }, [])

  // Mobile: no SplitText, no ScrollTrigger — one IO + block fade.
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
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
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
      ({ gsap, ScrollTrigger, SplitText }) => {
        if (cancelled || !ref.current) return
        const ctx = gsap.context(() => {
          let splitter: SplitTextType | null = null
          try {
            splitter = new SplitText(el as HTMLElement, {
              type: split,
              // keep accessible original? SplitText handles aria automatically in 3.13+
              smartWrap: true,
            } as any)
          } catch (err) {
            console.warn('[AnimatedText] SplitText failed, falling back to block fade.', err)
            gsap.fromTo(
              el,
              { y, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration,
                delay,
                ease,
                scrollTrigger:
                  mode === 'load'
                    ? undefined
                    : {
                        trigger: el,
                        start,
                        once: mode === 'scroll',
                        scrub: mode === 'scrub' ? true : undefined,
                      },
              },
            )
            return
          }

          const targets =
            (splitter as any).chars?.length > 0 && split.includes('chars')
              ? (splitter as any).chars
              : (splitter as any).words?.length > 0
                ? (splitter as any).words
                : (splitter as any).lines ?? [el]

          if (!targets || targets.length === 0) return

          if (mode === 'load') {
            const tween = gsap.fromTo(
              targets,
              { y, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration,
                delay,
                stagger: defaultStagger,
                ease,
                overwrite: true,
                clearProps: 'transform',
              },
            )
            // Safety net: never leave hero text hidden (e.g. interrupted tween / StrictMode remount)
            const safety = window.setTimeout(() => {
              gsap.set(targets, { y: 0, autoAlpha: 1, clearProps: 'transform' })
            }, (delay + duration + defaultStagger * targets.length) * 1000 + 800)
            ;(tween as any)?.then?.(() => window.clearTimeout(safety))
            const origCleanup = () => window.clearTimeout(safety)
            // chain into outer cleanup via ScrollTrigger refresh timer below
            window.setTimeout(origCleanup, (delay + duration + 2) * 1000)
          } else if (mode === 'scrub') {
            gsap.fromTo(
              targets,
              { autoAlpha: 0.14, y: 12 },
              {
                autoAlpha: 1,
                y: 0,
                stagger: defaultStagger,
                ease: 'none',
                immediateRender: false,
                scrollTrigger: {
                  trigger: el,
                  start: 'top 80%',
                  end: 'bottom 45%',
                  scrub: 0.6,
                },
              },
            )
          } else {
            gsap.fromTo(
              targets,
              { y, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration,
                delay,
                stagger: defaultStagger,
                ease,
                overwrite: true,
                clearProps: 'transform',
                // Fail-visible: stale trigger measurements after fast anchor
                // jumps leave text readable instead of hidden.
                immediateRender: false,
                scrollTrigger: {
                  trigger: el,
                  start,
                  once: true,
                },
              },
            )
          }

          // refresh after fonts/layout settle
          const t = window.setTimeout(() => ScrollTrigger.refresh(), 300)

          return () => {
            window.clearTimeout(t)
            try {
              splitter?.revert()
            } catch {
              /* noop */
            }
          }
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
  }, [split, mode, defaultStagger, duration, y, delay, ease, start, isMobile])

  if (isMobile) {
    return React.createElement(
      as,
      {
        ref,
        id,
        className: `reveal ${mobileVisible ? 'reveal-visible' : ''} ${className}`.trim(),
        style: { transitionDelay: delay ? `${delay}s` : undefined, ...style },
      },
      children,
    )
  }

  return React.createElement(
    as,
    {
      ref,
      id,
      className: `gsap-animated-text ${className}`.trim(),
      style: { willChange: 'transform, opacity', ...style },
    },
    children,
  )
}
