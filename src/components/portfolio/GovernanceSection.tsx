import { Reveal } from './Reveal'
import { DEFAULT_SITE_SETTINGS } from '../../../admin/server/settings-schema'
import type { GovernanceSettings } from '../../../admin/server/settings-schema'

const DEFAULT_GOVERNANCE = DEFAULT_SITE_SETTINGS.governance

/**
 * The three role cards are laid out identically and differ only by accent, so
 * the design stays in code and settings only names the theme. Class strings are
 * copied verbatim out of the cards they replace, so the rendered className is
 * unchanged.
 */
const ACCENTS = {
  cyan: {
    bg: 'bg-cyan-400',
    softBg: 'bg-cyan-500/10',
    border: 'border-cyan-400/20',
    text: 'text-cyan-400',
  },
  gold: {
    bg: 'bg-accent-gold',
    softBg: 'bg-accent-gold/10',
    border: 'border-accent-gold/20',
    text: 'text-accent-gold',
  },
  emerald: {
    bg: 'bg-emerald-400',
    softBg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
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

export function GovernanceSection({
  settings = DEFAULT_GOVERNANCE,
}: {
  /** Editable copy, supplied by the route from the database. */
  settings?: GovernanceSettings
}) {
  return (
    <section
      className="py-24 w-full border-b border-slate-border relative section-hairline"
      id="governance"
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
        {settings.roles.map((role) => {
          // Anything outside the three mapped themes falls back to cyan rather
          // than rendering a card with no accent at all.
          const accent = ACCENT_LOOKUP[role.accent as Accent] ?? ACCENTS.cyan
          return (
            <div key={role.id} className="executive-card rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className={`w-12 h-12 rounded-2xl ${accent.softBg} border ${accent.border} flex items-center justify-center ${accent.text} mb-6 shadow-md`}>
                  <span className="material-symbols-outlined text-[26px]">{role.icon}</span>
                </div>
                <div className={`text-mono-metric font-mono-metric ${accent.text} text-[12px] uppercase tracking-wider mb-2 font-semibold`}>
                  {role.kicker}
                </div>
                <h3
                  className="text-2xl font-bold text-text-primary mb-3"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {role.heading}
                </h3>
                <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
                  {role.body}
                </p>
                <ul className="space-y-2 text-mono-metric font-mono-metric text-[12px] text-text-tertiary mb-6">
                  {role.bullets.map((bullet, i) => (
                    <li key={`${role.id}-${i}`} className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${accent.bg}`}></span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-border">
                <span className="text-[11px] font-mono-metric text-text-secondary uppercase tracking-widest">
                  {role.footer}
                </span>
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