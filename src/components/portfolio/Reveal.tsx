import * as React from 'react'

type RevealProps = {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'section' | 'span'
}

/** Premium scroll-reveal wrapper — IntersectionObserver, no deps. */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className = '',
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true)
            io.disconnect()
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        ['--reveal-y' as string]: `${y}px`,
      }}
    >
      {children}
    </div>
  )
}
