import * as React from 'react'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Ventures', href: '#ventures' },
  { label: 'Honors', href: '#achievements' },
  { label: 'Keynotes', href: '#keynotes' },
  { label: 'Advisory', href: '#governance' },
  { label: 'Perspectives', href: '#perspectives' },
  { label: 'Contact', href: '#advisory' },
]

function NavLink({
  href,
  label,
  num,
  isActive,
  sectionInView,
  hoverOnly = false,
  onClick,
}: {
  href: string
  label: string
  num: string
  isActive: boolean
  sectionInView: boolean
  hoverOnly?: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = React.useState(false)
  const showLabel = hovered || (!hoverOnly && sectionInView)

  return (
    <a
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative flex items-center justify-center w-10 h-8 transition-colors ${
        isActive ? 'text-white' : 'text-text-secondary hover:text-white'
      }`}
    >
      {/* Centered Number — Stays locked on the vertical line axis */}
      <span className={`text-[11px] font-mono-metric transition-colors tracking-wider z-10 ${
        isActive ? 'text-white font-bold' : 'text-text-tertiary/70'
      }`}>
        {num}
      </span>

      {/* Floating Animated Text Label — Slides out to the LEFT side of the numbers */}
      <span
        className={`absolute right-full mr-4 text-[14px] whitespace-nowrap transition-all duration-300 ease-out origin-right pointer-events-none ${
          isActive 
            ? 'font-bold text-white underline underline-offset-4 decoration-2 decoration-white' 
            : 'font-medium text-text-secondary group-hover:text-white'
        } ${
          showLabel 
            ? 'opacity-100 translate-x-0 scale-100' 
            : 'opacity-0 translate-x-2 scale-95 overflow-hidden'
        }`}
      >
        {label}
      </span>
    </a>
  )
}

export function Navbar() {
  const [activeHash, setActiveHash] = React.useState('#about')
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [visibleSections, setVisibleSections] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
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

  // Scroll-spy + track which sections are in viewport
  React.useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.replace('#', ''))
    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const id = e.target.id
          if (e.isIntersecting) {
            visible.add(id)
            setActiveHash(`#${id}`)
          } else {
            visible.delete(id)
          }
          setVisibleSections(new Set(visible))
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
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 w-full z-50 backdrop-blur-md border-b transition-all duration-300 ${
          scrolled
            ? 'border-cyan-400/20 shadow-[0_12px_40px_-12px_rgba(14,165,233,0.35)]'
            : 'border-slate-border/80'
        }`}
        style={{ backgroundColor: scrolled ? 'rgba(0, 0, 0, 0.88)' : 'rgba(0, 0, 0, 0.95)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-3 flex items-center justify-between gap-6">
          {/* Brand Identity */}
          <a className="flex items-center gap-3 group shrink-0" href="#hero">
            <div className="w-8 h-8 rounded-full bg-slate-surface border border-slate-border flex items-center justify-center text-primary font-headline-sm font-bold shadow-inner">
              S
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-body-md font-bold tracking-tight text-text-primary">
                  Arun Raj
                </span>
              </div>
              <span className="text-mono-metric font-mono-metric text-text-tertiary text-[10px] sm:text-[11px]">
                Infodazz • BNI Madurai • SSRG
              </span>
            </div>
          </a>

          <div className="flex items-center gap-3 ml-auto">
            {/* Trailing Action CTA (Desktop) */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <a
                className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/20 bg-gradient-to-r bg-linear-to-r from-[#0ea5e9] to-[#3131c0] px-4 py-2 text-[13px] leading-none font-semibold tracking-tight text-white shadow-[0_8px_24px_-8px_rgba(14,165,233,0.65),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all duration-150 hover:brightness-110 hover:shadow-[0_8px_28px_-6px_rgba(14,165,233,0.8),inset_0_1px_0_rgba(255,255,255,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                href="#advisory"
              >
                <span className="material-symbols-outlined shrink-0 text-[16px] leading-none">
                  calendar_month
                </span>
                <span className="leading-none">Book Executive Consultation</span>
              </a>
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              aria-label="Toggle Navigation Menu"
              className="lg:hidden p-2 text-text-secondary hover:text-white focus:outline-none cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined text-[26px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile / tablet Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-obsidian-base/98 border-b border-slate-border px-6 pt-4 pb-6 animate-in slide-in-from-top-2 duration-200">
            <div className="text-[11px] font-mono-metric uppercase tracking-[0.22em] text-text-tertiary mb-2">
              Menu
            </div>
            <nav className="flex flex-col font-body-md">
              {NAV_LINKS.map((link, i) => {
                const isActive = activeHash === link.href
                const sectionInView = visibleSections.has(link.href.replace('#', ''))
                const num = String(i + 1).padStart(2, '0')
                return (
                  <NavLink
                    key={link.label}
                    href={link.href}
                    label={link.label}
                    num={num}
                    isActive={isActive}
                    sectionInView={sectionInView}
                    onClick={() => handleNavClick(link.href)}
                  />
                )
              })}
            </nav>
            <div className="pt-2 border-t border-slate-border">
              <a
                className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap px-4 py-3 rounded-xl border border-white/20 bg-gradient-to-r bg-linear-to-r from-[#0ea5e9] to-[#3131c0] text-sm leading-none font-semibold tracking-tight text-white shadow-[0_8px_24px_-8px_rgba(14,165,233,0.65),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all duration-150 hover:brightness-110"
                href="#advisory"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined shrink-0 text-[18px] leading-none">
                  calendar_month
                </span>
                <span className="leading-none">Book Executive Consultation</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Right-side vertical menu — desktop only */}
      <aside className="hidden lg:flex fixed right-8 top-0 bottom-0 z-40 w-12 flex-col items-center justify-between pointer-events-none">
        {/* Top segment line */}
        <div className="w-[1px] flex-1 bg-black/60 dark:bg-white/10" />

        {/* Menu Items Loop */}
        <nav className="flex flex-col items-center py-6 my-2 gap-3 pointer-events-auto">
          {NAV_LINKS.map((link, i) => {
            const isActive = activeHash === link.href
            const sectionInView = visibleSections.has(link.href.replace('#', ''))
            const num = String(i + 1).padStart(2, '0')
            return (
              <NavLink
                key={link.label}
                href={link.href}
                label={link.label}
                num={num}
                isActive={isActive}
                sectionInView={sectionInView}
                onClick={() => handleNavClick(link.href)}
              />
            )
          })}
        </nav>

        {/* Bottom segment line */}
        <div className="w-[1px] flex-1 bg-black/60 dark:bg-white/10" />
      </aside>
    </>
  )
}
