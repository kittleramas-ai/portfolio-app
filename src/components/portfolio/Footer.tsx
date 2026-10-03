import { SignatureMark } from './SignatureMark'
import type { SignatureMedia } from './media-types'
import { DEFAULT_SITE_SETTINGS } from '../../../admin/server/settings-schema'
import type { FooterSettings } from '../../../admin/server/settings-schema'

type FooterLink = {
  id?: string
  label: string
  href: string
  external?: boolean
  accent?: boolean
}

type FooterColumn = {
  id?: string
  heading: string
  links: FooterLink[]
}

const DEFAULT_FOOTER = DEFAULT_SITE_SETTINGS.footer

function LinkColumn({ heading, links }: FooterColumn) {
  return (
    <div>
      <span className="mb-6 block font-label-badge text-[10px] font-semibold uppercase tracking-[0.24em] text-accent-gold">
        {heading}
      </span>
      <ul className="space-y-4">
        {links.map((link, i) => (
          <li key={link.id ?? `${link.label}-${i}`}>
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

export function Footer({
  signature,
  settings = DEFAULT_FOOTER,
}: {
  signature?: SignatureMedia | null
  /** Columns, links, biography and copyright bar. Managed in the admin panel. */
  settings?: FooterSettings
} = {}) {
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Get the current year dynamically. The stored copyright line uses `{year}`
  // as a placeholder so the text does not need re-saving every January.
  const year = new Date().getFullYear()
  const copyright = settings.copyright.replace('{year}', String(year))

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
              <SignatureMark className="h-16 sm:h-20 md:h-24" src={signature?.url} alt={signature?.altText || undefined} />
            </a>

            <p className="mt-9 max-w-md text-[15px] leading-relaxed text-text-secondary">
              {settings.bio}
            </p>
            <p className="mt-5 max-w-md font-mono-metric text-[11px] leading-relaxed text-text-tertiary">
              {settings.credentials}
            </p>
          </div>

          {/* Links */}
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:col-span-7"
          >
            {settings.columns.map((column) => (
              <LinkColumn key={column.id} {...column} />
            ))}
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 flex flex-col items-start justify-between gap-6 border-t border-slate-border pt-8 md:flex-row md:items-center">
          <div className="font-mono-metric text-[11px] leading-relaxed text-text-tertiary">
            {copyright}
          </div>
          <a
            className="group inline-flex cursor-pointer items-center gap-2 font-mono-metric text-[12px] text-text-secondary transition-colors hover:text-accent-gold"
            href="#hero"
            onClick={scrollToTop}
          >
            <span>{settings.backToTopLabel}</span>
            <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:-translate-y-0.5">
              north
            </span>
          </a>
        </div>
      </div>
    </footer>
  )
}
