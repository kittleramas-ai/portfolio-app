import * as React from 'react'
import { ThemeToggle } from './ThemeToggle'
import { SignatureMark } from './SignatureMark'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Ventures', href: '#ventures' },
  { label: 'Honors', href: '#achievements' },
  { label: 'Keynotes', href: '#keynotes' },
  { label: 'Advisory', href: '#governance' },
  { label: 'Perspectives', href: '#perspectives' },
  { label: 'Books', href: '#books' },
  { label: 'Contact', href: '#advisory' },
]

export function Navbar() {
  const [activeHash, setActiveHash] = React.useState('#about')
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
    const ids = NAV_LINKS.map((l) => l.href.replace('#', ''))
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
  }, [])

  const handleNavClick = (href: string) => {
    setActiveHash(href)
    setMenuOpen(false)
  }

  // Prevent scrolling when menu is open
  React.useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
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
            <SignatureMark className="h-12 sm:h-14 lg:h-16" />
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
                Menu
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
              {NAV_LINKS.map((link) => {
                const isActive = activeHash === link.href
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => handleNavClick(link.href)}
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
                href="#advisory"
                onClick={() => setMenuOpen(false)}
              >
                Book Executive Consultation
                <span className="material-symbols-outlined">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
