import * as React from 'react'

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
  const [displayValue, setDisplayValue] = React.useState('0')
  const ref = React.useRef<HTMLSpanElement>(null)
  const animatedRef = React.useRef(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    const startAnimation = () => {
      if (animatedRef.current) return
      animatedRef.current = true

      const isComma = format === 'comma'
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

    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startAnimation()
              observer.unobserve(entry.target)
            }
          })
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -50px 0px',
        },
      )

      observer.observe(el)
      return () => observer.disconnect()
    } else {
      startAnimation()
    }
  }, [target, format, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  )
}
