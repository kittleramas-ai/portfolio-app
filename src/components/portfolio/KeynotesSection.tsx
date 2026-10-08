import { Reveal } from './Reveal'
import { DEFAULT_SITE_SETTINGS } from '../../../admin/server/settings-schema'
import type { KeynotesSettings } from '../../../admin/server/settings-schema'

const DEFAULT_KEYNOTES = DEFAULT_SITE_SETTINGS.keynotes

/**
 * Per-card colour classes, lifted verbatim out of the three cards this section
 * used to hand-write. The `accent` enum is shared across sections and is wider
 * than the three themes designed here, so anything else falls back to violet.
 */
const ACCENTS = {
  violet: {
    badge: 'badge-pill text-[11px] font-mono-metric bg-indigo-500/10 border-indigo-400/25 text-[#5B21B6] dark:text-indigo-300 tracking-wider',
    tagline: 'text-mono-metric font-mono-metric text-[#5B21B6] dark:text-indigo-300 text-[13px] font-semibold mb-4',
    footerIcon: 'material-symbols-outlined text-[16px] text-accent-gold',
    footerRight: 'text-[#5B21B6] dark:text-indigo-300 font-semibold',
  },
  gold: {
    badge: 'badge-pill text-[11px] font-mono-metric bg-amber-500/10 border-amber-500/20 text-accent-gold tracking-wider',
    tagline: 'text-mono-metric font-mono-metric text-accent-gold text-[13px] font-semibold mb-4',
    footerIcon: 'material-symbols-outlined text-[16px] text-accent-gold',
    footerRight: 'text-accent-gold',
  },
  sky: {
    badge: 'badge-pill text-[11px] font-mono-metric bg-cyan-500/10 border-cyan-400/25 text-[#075985] dark:text-cyan-400 tracking-wider',
    tagline: 'text-mono-metric font-mono-metric text-[#075985] dark:text-cyan-300 text-[13px] font-semibold mb-4',
    footerIcon: 'material-symbols-outlined text-[16px] text-emerald-400',
    footerRight: 'text-[#075985] dark:text-cyan-300 font-semibold',
  },
} as const

type AccentClasses = (typeof ACCENTS)[keyof typeof ACCENTS]
type AccentKey = keyof typeof ACCENTS

const accentFor = (
  key: KeynotesSettings['cards'][number]['accent'],
): AccentClasses =>
  Object.hasOwn(ACCENTS, key) ? ACCENTS[key as AccentKey] : ACCENTS.violet

export function KeynotesSection({
  settings = DEFAULT_KEYNOTES,
}: {
  /** Eyebrow, headline copy and the keynote cards. Managed in the admin panel. */
  settings?: KeynotesSettings
}) {
  return (
    <section
      className="py-24 w-full border-b border-slate-border relative section-hairline"
      id="keynotes"
      style={{ backgroundColor: 'var(--portfolio-black)' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
      <Reveal>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-slate-border gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-2.5 max-w-full px-4 py-2.5 rounded-2xl text-label-badge font-label-badge bg-primary/10 border border-primary/30 text-primary uppercase tracking-widest leading-relaxed text-left shadow-sm break-words">
              <span className="material-symbols-outlined text-[16px] shrink-0">
                {settings.eyebrowIcon}
              </span>
              <span className="min-w-0">
                {settings.eyebrowTitle}{' '}
                <span className="opacity-50 mx-1">//</span>{' '}
                {settings.eyebrowSubtitle}
              </span>
            </span>
          </div>
          <h2
            className="text-headline-lg font-headline-lg text-text-primary tracking-tight"
            style={{
              fontFamily:
                "Anton, 'Bebas Neue', 'Space Grotesk', sans-serif",
              letterSpacing: '0.025em',
              textTransform: 'uppercase',
              lineHeight: 1.15,
            }}
          >
            {settings.heading}
          </h2>
        </div>
        <div className="flex flex-col md:items-end gap-3 max-w-md">
          <p className="text-mono-metric font-mono-metric text-text-tertiary text-xs md:text-right">
            {settings.intro}
          </p>
          <a
            className="relative z-10 inline-flex w-fit max-w-full items-center gap-2 px-4 py-2 rounded-full text-label-badge font-label-badge bg-text-primary text-obsidian-base no-underline font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-md"
            href={settings.ctaHref}
          >
            <span>{settings.ctaLabel}</span>
            <span className="material-symbols-outlined text-[16px]">
              {settings.ctaIcon}
            </span>
          </a>
        </div>
      </div>
      </Reveal>

      <Reveal delay={100}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* One card per entry — markup was hand-duplicated three times */}
        {settings.cards.map((card) => {
          const accent = accentFor(card.accent)
          return (
            <div key={card.id} className="executive-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="card-head-row border-slate-border">
                  <span className={accent.badge}>
                    {card.badge}
                  </span>
                  <span className="card-head-meta text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    {card.meta}
                  </span>
                </div>
                <h3
                  className="text-xl font-bold text-text-primary mb-3 leading-snug"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {card.heading}
                </h3>
                <div className={accent.tagline}>
                  {card.tagline}
                </div>
                <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
                  {card.body}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-border flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-text-tertiary">
                <span className="flex items-center gap-1.5 text-text-primary font-semibold">
                  <span className={accent.footerIcon}>
                    {card.footerIcon}
                  </span>{' '}
                  {card.footerLabel}
                </span>
                <span className={accent.footerRight}>{card.footerRightLabel}</span>
              </div>
            </div>
          )
        })}
      </div>
      </Reveal>
      </div>
    </section>
  )
}
