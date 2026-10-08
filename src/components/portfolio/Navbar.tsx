import * as React from 'react'
import { ThemeToggle } from './ThemeToggle'
import type { SignatureMedia } from './media-types'
import { SignatureMark } from './SignatureMark'
import { DEFAULT_SITE_SETTINGS } from '../../../admin/server/settings-schema'
import type { NavbarSettings } from '../../../admin/server/settings-schema'
import { getSmoother } from '../../routes/lib/gsap'

const DEFAULT_NAV = DEFAULT_SITE_SETTINGS.navbar

export function Navbar({
  signature,
  settings = DEFAULT_NAV,
}: {
  signature?: SignatureMedia | null
  /** Link list, CTA and button label. Managed in the admin panel. */
  settings?: NavbarSettings
} = {}) {
  const links = settings.links
  const [activeHash, setActiveHash] = React.useState(
    links[0]?.href ?? '#about',
  )
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  React.useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash) {
        setActiveHash(window.location.hash)
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  React.useEffect(() => {
    // Only in-page anchors are worth observing; an absolute URL has no element
    // to intersect, and passing one to getElementById just yields null.
    const ids = links
      .map((l) => l.href)
      .filter((href) => href.startsWith('#'))
      .map((href) => href.slice(1))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActiveHash(`#${e.target.id}`)
          }
        })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
    // `links` is a new array identity on every settings load, so depend on the
    // hrefs themselves — otherwise the observer would rebuild on every render.
  }, [settings.links])

  const handleNavClick = (href: string) => {
    setActiveHash(href)
    setMenuOpen(false)
  }

  /** External links open in a new tab; in-page anchors stay in place. */
  const isExternal = (href: string) => !href.startsWith('#')

  // Prevent scrolling when menu is open. ScrollSmoother drives the page
  // scroll itself, so body overflow alone is not enough — pause it too, or
  // wheel events over the menu panel scroll the page behind the overlay.
  React.useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
      getSmoother()?.paused(true)
    } else {
      document.body.style.overflow = 'unset'
      getSmoother()?.paused(false)
    }
    return () => {
      document.body.style.overflow = 'unset'
      getSmoother()?.paused(false)
    }
  }, [menuOpen])

  return (
    <>
      {/* Top Banner Header Block */}
      <header
        className={`fixed top-0 inset-x-0 w-full z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-obsidian-base/90 backdrop-blur-md border-b border-slate-border/50 shadow-md'
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-6 pb-5 sm:pt-8 sm:pb-6 flex items-center justify-between gap-6">
          {/* Brand Identity — signature wordmark, matching the footer lockup */}
          <a className="group shrink-0" href="#hero">
            <SignatureMark
              className="h-12 sm:h-14 lg:h-16"
              src={signature?.url}
              alt={signature?.altText || undefined}
            />
          </a>

          <div className="flex items-center gap-6 ml-auto">
            <ThemeToggle />

            {/* Menu Button */}
            <button
              type="button"
              aria-label="Toggle Navigation Menu"
              className="flex items-center gap-2 text-text-secondary hover:text-accent-gold transition-colors focus:outline-none cursor-pointer"
              onClick={() => setMenuOpen(true)}
            >
              <span className="material-symbols-outlined text-[28px]">
                menu
              </span>
              <span className="hidden sm:inline font-bold uppercase tracking-widest text-sm">
                {settings.menuButtonLabel}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full Screen Split Overlay Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-300 justify-end">
          {/* Left side: Transparent overlay to close */}
          <div
            className="hidden sm:block flex-1 bg-black/20 backdrop-blur-sm cursor-pointer"
            onClick={() => setMenuOpen(false)}
          ></div>

          {/* Right side: Solid menu panel */}
          <div className="w-full sm:w-[450px] md:w-[550px] lg:w-[600px] xl:w-[700px] h-full bg-obsidian-base shadow-2xl relative flex flex-col items-start px-8 sm:px-16 md:px-24 pt-24 pb-16 overflow-y-auto animate-in slide-in-from-right-8 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-8 left-8 flex items-center justify-center text-text-secondary hover:text-accent-gold transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined text-[28px]">
                close
              </span>
            </button>

            {/* Menu Links */}
<nav className="mt-12 md:mt-16 flex flex-col gap-5 md:gap-7 w-full">
              {links.map((link) => {
                const isActive = activeHash === link.href
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={() => handleNavClick(link.href)}
                    {...(isExternal(link.href)
                      ? { rel: 'noopener noreferrer', target: '_blank' }
                      : {})}
                    className={`text-4xl md:text-5xl lg:text-[56px] leading-tight font-headline-lg font-bold uppercase tracking-tight transition-all duration-200 transform hover:translate-x-4 ${
                      isActive
                        ? 'text-accent-gold'
                        : 'text-text-primary hover:text-accent-gold'
                    }`}
                  >
                    {link.label}
                  </a>
                )
              })}
            </nav>

            <div className="mt-auto pt-16">
              <a
                className="inline-flex items-center justify-center gap-3 px-6 py-3 md:px-8 md:py-4 rounded-full bg-accent-gold text-portfolio-black hover:bg-opacity-90 font-bold uppercase tracking-wider text-xs md:text-sm transition-all"
                href={settings.ctaHref}
                onClick={() => setMenuOpen(false)}
                {...(isExternal(settings.ctaHref)
                  ? { rel: 'noopener noreferrer', target: '_blank' }
                  : {})}
              >
                {settings.ctaLabel}
                <span className="material-symbols-outlined">
                  {settings.ctaIcon}
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
