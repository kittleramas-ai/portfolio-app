import { Reveal } from './Reveal'
import { DEFAULT_SITE_SETTINGS } from '../../../admin/server/settings-schema'
import type { PerspectivesSettings } from '../../../admin/server/settings-schema'

const DEFAULT_PERSPECTIVES = DEFAULT_SITE_SETTINGS.perspectives

/**
 * The three article cards share one layout and differ only by accent, so the
 * design stays in code and settings only names the theme. Class strings are
 * copied verbatim out of the cards they replace, so the rendered className is
 * unchanged.
 */
const ACCENTS = {
  cyan: {
    softBg: 'bg-cyan-500/10',
    badgeBorder: 'border-cyan-400/20',
    text: 'text-cyan-400',
    headingHover: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-300',
  },
  gold: {
    softBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/20',
    text: 'text-accent-gold',
    headingHover: 'group-hover:text-accent-gold',
  },
  emerald: {
    softBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/20',
    text: 'text-emerald-400',
    headingHover:
      'group-hover:text-emerald-600 dark:group-hover:text-emerald-300',
  },
} as const

/** The settings enum is site-wide, so it is wider than the map above. */
type Accent = keyof typeof ACCENTS

/**
 * The schema's accent enum is site-wide (six themes) but only three are
 * designed here, so the lookup is deliberately partial and falls back to cyan
 * rather than letting an undesigned key render an unthemed card.
 */
const ACCENT_LOOKUP: Partial<Record<Accent, (typeof ACCENTS)[Accent]>> = ACCENTS

export function PerspectivesSection({
  settings = DEFAULT_PERSPECTIVES,
}: {
  /** Editable copy, supplied by the route from the database. */
  settings?: PerspectivesSettings
}) {
  return (
    <section
      className="py-24 w-full border-b border-slate-border relative section-hairline"
      id="perspectives"
      style={{ backgroundColor: 'var(--portfolio-black)' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
      <Reveal>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-slate-border gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block max-w-full px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-label-badge font-label-badge bg-primary/10 border border-primary/30 text-primary uppercase tracking-wider sm:tracking-widest leading-relaxed break-words whitespace-normal text-center sm:text-left">
              {settings.eyebrow}
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
        <p className="text-mono-metric font-mono-metric text-text-tertiary max-w-md">
          {settings.intro}
        </p>
      </div>
      </Reveal>

      <Reveal delay={100}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {settings.articles.map((article) => {
          // Anything outside the three mapped themes falls back to cyan rather
          // than rendering a card with no accent at all.
          const accent = ACCENT_LOOKUP[article.accent as Accent] ?? ACCENTS.cyan
          return (
            <article key={article.id} className="executive-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between group">
              <div>
                <div className="card-head-row border-slate-border">
                  <span className={`badge-pill text-[11px] font-mono-metric ${accent.softBg} ${accent.badgeBorder} ${accent.text} tracking-wider`}>
                    {article.badge}
                  </span>
                  <span className="card-head-meta text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    {article.meta}
                  </span>
                </div>
                <h3
                  className={`text-xl font-bold text-text-primary mb-3 ${accent.headingHover} transition-colors leading-snug`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {article.heading}
                </h3>
                <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
                  {article.body}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-border flex items-center justify-between text-mono-metric font-mono-metric text-[12px]">
                <span className="text-text-tertiary">{article.footerLabel}</span>
                <span className={`material-symbols-outlined text-[18px] ${accent.text} group-hover:translate-x-1 transition-transform`}>
                  arrow_forward
                </span>
              </div>
            </article>
          )
        })}
      </div>
      </Reveal>
      </div>
    </section>
  )
}