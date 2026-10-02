/**
 * Lightweight sync helpers. This module must NEVER statically import `gsap`
 * or its plugins — GSAP loads only on desktop via `loadGsap()` from
 * `./gsapLoader`, keeping it out of the mobile initial bundle.
 */
import type { ScrollSmoother } from 'gsap/ScrollSmoother'

let smootherInstance: ScrollSmoother | null = null

export function setSmoother(smoother: ScrollSmoother | null) {
  smootherInstance = smoother
}

export function getSmoother(): ScrollSmoother | null {
  return smootherInstance
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * True on touch-first / mobile devices where GSAP ScrollSmoother,
 * SplitText and scrub triggers cause visible jank.
 * These devices get native scroll + lightweight IO reveals instead.
 *
 * NOTE: narrow viewports count as mobile for animation purposes even when
 * `pointer: coarse` doesn't match — e.g. Chrome DevTools device emulation
 * or a resized desktop window still reports a fine pointer and (depending
 * on emulation settings) a desktop UA, which would otherwise load the full
 * GSAP path on a 440px layout.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  if (typeof window.matchMedia === 'function') {
    try {
      if (window.matchMedia('(pointer: coarse)').matches) return true
      if (window.matchMedia('(max-width: 820px)').matches) return true
    } catch {
      /* noop */
    }
  }
  if (typeof window.innerWidth === 'number' && window.innerWidth <= 820)
    return true
  if (typeof navigator !== 'undefined' && typeof navigator.userAgent === 'string') {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )
    )
      return true
  }
  return false
}

/**
 * Smooth-scroll to a css selector / hash using ScrollSmoother when available,
 * falling back to native smooth scroll.
 */
export function scrollToSection(target: string) {
  if (typeof window === 'undefined') return
  const smoother = getSmoother()
  try {
    if (smoother) {
      // ScrollSmoother.scrollTo accepts string target + smooth flag
      smoother.scrollTo(target as any, true)
      return
    }
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  } catch {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  }
}
