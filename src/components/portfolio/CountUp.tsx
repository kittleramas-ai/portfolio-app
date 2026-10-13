import * as React from 'react'

import { prefersReducedMotion, isMobileDevice } from '../../routes/lib/gsap'
import { cn } from '../../routes/lib/utils'

interface CountUpProps {
  target: number
  prefix?: string
  suffix?: string
  format?: 'standard' | 'comma'
  duration?: number
  className?: string
}


function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
}

function formatNumber(val: number, isComma: boolean): string {
  if (isComma) {
    return Math.round(val).toLocaleString('en-US')
  }
  return Math.round(val).toString()
}

export function CountUp({
  target,
  prefix = '',
  suffix = '',
  format = 'standard',
  duration = 1200,
  className = '',
}: CountUpProps) {
  const isComma = format === 'comma'

  /**
   * Seeded with the REAL number, not `'0'`.
   *
   * This component previously started at `'0'` and only ever reached `target`
   * after hydration had finished AND an IntersectionObserver had fired. Every
   * number on the page therefore read "0" in the server HTML, and stayed there
   * for as long as the main thread was busy — which is exactly what a visitor
   * scrolling into view of this section sees. It also meant a visitor with JS
   * blocked, or a crawler, read a portfolio claiming zero ventures, zero
   * professionals and zero keynotes.
   *
   * The real figure costs nothing to render and is true at every point the
   * animation is not running, so it is what the first paint shows.
   */
  const [displayValue, setDisplayValue] = React.useState(() =>
    formatNumber(target, isComma),
  )
  const ref = React.useRef<HTMLSpanElement>(null)
  const animatedRef = React.useRef(false)

  React.useEffect(() => {
    if (prefersReducedMotion() || typeof window === 'undefined' || isMobileDevice()) {
      setDisplayValue(formatNumber(target, isComma))
      animatedRef.current = true
      return
    }

    const el = ref.current
    if (!el) return

    const startAnimation = () => {
      if (animatedRef.current) return
      animatedRef.current = true

      setDisplayValue('0')
      const startTime = performance.now()

      const update = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easeOutExpo(progress)
        const currentVal = easedProgress * target

        setDisplayValue(formatNumber(currentVal, isComma))

        if (progress < 1) {
          requestAnimationFrame(update)
        } else {
          setDisplayValue(formatNumber(target, isComma))
        }
      }

      requestAnimationFrame(update)
    }

    if (typeof IntersectionObserver === 'undefined') {
      startAnimation()
      return
    }

    // Immediately trigger if already visible in viewport on mount or refresh
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      startAnimation()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            startAnimation()
            observer.unobserve(entry.target)
            break
          }
        }
      },
      {
        threshold: 0,
        rootMargin: '0px 0px 50px 0px',
      },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, format, duration, isComma])

  return (
    <span
      ref={ref}
      className={cn('count-up', className)}
    >
      {prefix}
      {displayValue}
      {suffix}
    </span>
  )
}
