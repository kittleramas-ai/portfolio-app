import { SignatureMark } from './SignatureMark'

type FooterLink = {
  label: string
  href: string
  external?: boolean
  accent?: boolean
}

type FooterColumn = {
  heading: string
  links: FooterLink[]
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: 'GOVERNANCE',
    links: [
      { label: 'Executive Profile', href: '#about', accent: true },
      { label: 'Board Advisory', href: '#governance' },
      { label: 'Keynotes & Summits', href: '#keynotes' },
      { label: 'Publications', href: '#perspectives' },
      {
        label: 'Infodazz Enterprise',
        href: 'https://infodazz.org',
        external: true,
      },
    ],
  },
  {
    heading: 'VENTURES',
    links: [
      { label: 'Infodazz — Estd 2022', href: '#ventures' },
      { label: 'Kittle Pvt Ltd — Trichy', href: '#ventures' },
      {
        label: 'Seventh Sense Research',
        href: 'https://internationaljournalssrg.org',
        external: true,
      },
      { label: 'Kaster Trust — Education', href: '#ventures' },
    ],
  },
  {
    heading: 'ENGAGEMENT',
    links: [
      { label: 'Advisory Governance', href: '#about' },
      { label: 'Direct Consultation', href: '#advisory' },
    ],
  },
]

function LinkColumn({ heading, links }: FooterColumn) {
  return (
    <div>
      <span className="mb-6 block font-label-badge text-[10px] font-semibold uppercase tracking-[0.24em] text-accent-gold">
        {heading}
      </span>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.label}>
            <a
              className={`group inline-block text-[15px] leading-snug transition-all duration-200 hover:translate-x-1 ${
                link.accent
                  ? 'font-headline-sm font-semibold text-text-primary hover:text-accent-gold'
                  : 'font-body-sm text-text-secondary hover:text-accent-gold'
              }`}
              href={link.href}
              {...(link.external
                ? { rel: 'noopener noreferrer', target: '_blank' }
                : {})}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Get the current year dynamically
  const year = new Date().getFullYear()

  return (
    <footer
      className="w-full bg-obsidian-base border-t border-slate-border"
      style={{ backgroundColor: 'var(--portfolio-black)' }}
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-20 md:px-12 md:py-24">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-20">
          {/* Signature lockup */}
          <div className="flex flex-col justify-center lg:col-span-5">
            <a
              className="group inline-block w-fit min-w-0"
              href="#hero"
              aria-label="Back to top — Dr. R. Surendiran"
            >
              <SignatureMark className="h-16 sm:h-20 md:h-24" />
            </a>

            <p className="mt-9 max-w-md text-[15px] leading-relaxed text-text-secondary">
              Founder | Technology Entrepreneur | Research Publisher | Social
              Impact Leader — Building technology businesses (Infodazz, Kittle),
              research platforms (Seventh Sense, 30+ journals, 5+ Scopus) and
              social impact (Kaster Trust education support).
            </p>
            <p className="mt-5 max-w-md font-mono-metric text-[11px] leading-relaxed text-text-tertiary">
              Ph.D — Madurai Kamaraj University • MCA — Thiagarajar School of
              Management, Madurai • B.Sc Mathematics — GAC Kumbakonam • BNI
              since 2022 • Rotary since 2024
            </p>
          </div>

          {/* Links */}
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:col-span-7"
          >
            {FOOTER_COLUMNS.map((column) => (
              <LinkColumn key={column.heading} {...column} />
            ))}
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 flex flex-col items-start justify-between gap-6 border-t border-slate-border pt-8 md:flex-row md:items-center">
          <div className="font-mono-metric text-[11px] leading-relaxed text-text-tertiary">
            © {year} Dr. R. Surendiran. Infodazz • Kittle Pvt Ltd • Seventh
            Sense Research Group • Kaster Trust. All Rights Reserved.
          </div>
          <a
            className="group inline-flex cursor-pointer items-center gap-2 font-mono-metric text-[12px] text-text-secondary transition-colors hover:text-accent-gold"
            href="#hero"
            onClick={scrollToTop}
          >
            <span>Back to Top</span>
            <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:-translate-y-0.5">
              north
            </span>
          </a>
        </div>
      </div>
    </footer>
  )
}
