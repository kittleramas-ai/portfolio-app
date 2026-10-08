import * as React from 'react'

type SmoothProviderProps = {
  children: React.ReactNode
  className?: string
}

/**
 * Ultra-fast native scroll provider (60-120fps hardware accelerated).
 * Replaces heavy GSAP ScrollSmoother matrix calculations with native browser scrolling.
 */
export function SmoothProvider({
  children,
  className = '',
}: SmoothProviderProps) {
  React.useEffect(() => {
    // Smooth in-page anchor scrolling without layout lag
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

  return (
    <div className={`w-full relative ${className}`.trim()}>
      {children}
    </div>
  )
}
