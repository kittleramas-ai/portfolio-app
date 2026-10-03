import { CountUp } from './CountUp'
import { Reveal } from './Reveal'
import { DEFAULT_SITE_SETTINGS } from '../../../admin/server/settings-schema'
import type { VenturesSettings } from '../../../admin/server/settings-schema'

const DEFAULT_VENTURES = DEFAULT_SITE_SETTINGS.ventures

/* Shared band heights. Every card is built from the same four bands in the same
   order — number/pill, title, blurb, services, chips — and each is pinned to a
   fixed min-height, so a card with 4 services lines up with any other and all
   four end up exactly the same height. Change one, change all.
   SERVICES_H is 2 rows of the 2-column service list; CHIPS_H is 2 rows of
   compact chips. Keep card 03's 2-line title within TITLE_H. */
const TITLE_H = 'min-h-[4.75rem]'
const BLURB_H = 'min-h-[6rem]'
const SERVICES_H = 'min-h-[3.25rem]'
const CHIPS_H = 'min-h-[7.5rem]'

const CHIP_LABEL =
  'text-mono-metric font-mono-metric text-text-tertiary text-[11px]'
const CHIP_VALUE =
  'text-[13px] font-body-sm font-bold text-text-primary leading-snug break-words'

/**
 * The four cards used to be hand-written one at a time, so they are NOT the same
 * twice: each has its own accent, its own skew on the wide breakpoint and its own
 * CTA palette. The schema carries no accent field for ventures and none was added
 * — a colour class in the database could point at the wrong theme — so the themes
 * are PER-POSITION and looked up by index. The consequence is deliberate and
 * documented: the card array is not reorderable, because moving a card moves its
 * copy into a foreign palette. Every class below is copied verbatim out of the
 * card it replaces, so the rendered className is unchanged.
 *
 * `tooltip` is the one piece of structure that is not colour: the 2nd and 3rd
 * cards carried a native `title` tooltip duplicating their CTA label. Kept, so
 * the tooltip follows the label rather than a second copy of it in code.
 */
const THEMES = [
  {
    card: 'executive-card h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-l-4 border-l-cyan-400 relative lg:-rotate-1 min-w-0',
    counter:
      'text-stat-counter font-stat-counter text-text-primary tracking-tighter shrink-0',
    badge: 'badge-pill text-[11px] font-mono-metric bg-cyan-500/10 border-cyan-400/20 text-cyan-400 tracking-wider text-center leading-snug',
    role: 'text-mono-metric font-mono-metric text-primary text-[13px] font-semibold',
    chipValues: [CHIP_VALUE, CHIP_VALUE],
    cta: 'inline-flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl bg-sky-800/10 border border-sky-800/25 text-[#075985] dark:bg-cyan-500/10 dark:border-cyan-400/20 dark:text-cyan-300 hover:bg-sky-800/20 dark:hover:bg-cyan-500/20 transition-all font-mono-metric text-mono-metric font-semibold group min-w-0',
    tooltip: false,
  },
  {
    card: 'executive-card h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-l-4 border-l-amber-500 relative lg:rotate-1 min-w-0',
    counter:
      'text-stat-counter font-stat-counter text-accent-gold tracking-tighter shrink-0',
    badge: 'badge-pill text-[11px] font-mono-metric bg-accent-gold/10 border-accent-gold/20 text-accent-gold tracking-wider text-center leading-snug',
    role: 'text-mono-metric font-mono-metric text-accent-gold text-[13px] font-semibold',
    chipValues: [CHIP_VALUE, CHIP_VALUE],
    cta: 'inline-flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl bg-accent-gold/10 border border-accent-gold/25 text-[#8C6D1F] dark:text-accent-gold hover:bg-accent-gold/20 transition-all font-mono-metric text-mono-metric font-semibold group min-w-0',
    tooltip: true,
  },
  {
    card: 'executive-card h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-l-4 border-l-indigo-400 relative lg:-rotate-1 min-w-0',
    counter:
      'text-stat-counter font-stat-counter text-indigo-400 tracking-tighter shrink-0',
    badge: 'badge-pill text-[11px] font-mono-metric bg-indigo-500/10 border-indigo-400/20 text-indigo-300 tracking-wider text-center leading-snug',
    role: 'text-mono-metric font-mono-metric text-indigo-300 text-[13px] font-semibold',
    chipValues: [
      'text-[13px] font-body-sm font-bold text-indigo-300 leading-snug break-words',
      CHIP_VALUE,
    ],
    cta: 'inline-flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl bg-violet-800/10 border border-violet-800/25 text-[#5B21B6] dark:bg-indigo-500/10 dark:border-indigo-400/20 dark:text-indigo-300 hover:bg-violet-800/20 dark:hover:bg-indigo-500/20 transition-all font-mono-metric text-mono-metric font-semibold group min-w-0',
    tooltip: true,
  },
  {
    card: 'executive-card h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-l-4 border-l-emerald-500 relative lg:rotate-1 min-w-0',
    counter:
      'text-stat-counter font-stat-counter text-emerald-400 tracking-tighter shrink-0',
    badge: 'badge-pill text-[11px] font-mono-metric bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tracking-wider text-center leading-snug',
    role: 'text-mono-metric font-mono-metric text-emerald-400 text-[13px] font-semibold',
    chipValues: [CHIP_VALUE, CHIP_VALUE],
    cta: 'inline-flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl bg-emerald-700/10 border border-emerald-700/25 text-[#047857] dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300 hover:bg-emerald-700/20 dark:hover:bg-emerald-500/20 transition-all font-mono-metric text-mono-metric font-semibold group min-w-0',
    tooltip: false,
  },
] as const

/**
 * External venture sites open in a new tab; the in-page advisory link does not.
 */
const isExternal = (href: string) => href.startsWith('http')

export function VenturesSection({
  settings = DEFAULT_VENTURES,
}: {
  /** Editable copy, supplied by the route from the database. */
  settings?: VenturesSettings
}) {
  return (
    <section
      className="py-24 w-full border-b border-slate-border section-hairline"
      id="ventures"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
      <Reveal>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 relative z-10">
        <div>
          <span className="text-label-badge font-label-badge text-primary block mb-2 tracking-wider">
            {settings.eyebrow}
          </span>
          <h2
            className="text-headline-lg font-headline-lg text-text-primary tracking-tight"
            style={{
              fontFamily: 'Anton, "Bebas Neue", sans-serif',
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

      {/* 4-Card Grid — real ventures from original content. items-stretch plus
          h-full on each card is what makes the row equal-height; the band
          min-heights above are what makes the contents line up. */}
      <Reveal delay={110}>
      <div className="relative w-full py-6 lg:py-12">
        {/* Decorative linework behind the card row. Column guides sit on the
            same grid + gap as the cards so each guide lands exactly on a card
            edge; the horizontal rules and the wash are masked top and bottom so
            the whole thing dissolves before it reaches the section borders.
            pointer-events-none + aria-hidden keeps it out of the way. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute inset-0 hidden md:block bg-[repeating-linear-gradient(to_bottom,var(--slate-border)_0px,var(--slate-border)_1px,transparent_1px,transparent_3rem)] opacity-20 [mask-image:linear-gradient(to_bottom,transparent,#000_22%,#000_78%,transparent)]" />
          <div className="absolute inset-y-0 left-0 right-0 hidden xl:grid grid-cols-4 gap-8">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="border-l border-slate-border/40" />
            ))}
          </div>
          <div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-accent-gold/15 to-transparent md:block" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-gold/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-gold/20 to-transparent" />
          <div className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-gold/[0.04] blur-3xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-stretch relative z-10">
          {/* One card per venture — the four blocks were hand-duplicated, and
              each kept its own palette, so the theme is looked up by position. */}
          {settings.cards.map((card, i) => {
            const theme = THEMES[i] ?? THEMES[0]
            const external = isExternal(card.ctaHref)
            return (
              /* `v2` is Kittle, whose card is still addressed as #kittle by
                 inbound links, so that anchor stays with the id, not the copy. */
              <div
                key={card.id}
                className={theme.card}
                {...(card.id === 'v2' ? { id: 'kittle' } : {})}
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-slate-border">
                    <span
                      className={theme.counter}
                      style={{
                        fontFamily: 'Anton, "Bebas Neue", sans-serif',
                        fontSize: '64px',
                        lineHeight: '0.9',
                      }}
                    >
                      {card.index}
                    </span>
                    <div className="flex flex-col items-end gap-1 min-w-0">
                      <span className={theme.badge} style={{ whiteSpace: 'normal' }}>
                        {card.badge}
                      </span>
                      <span className="text-mono-metric font-mono-metric text-text-tertiary text-[11px] text-right">
                        {card.meta}
                      </span>
                    </div>
                  </div>

                  <div className={`mb-4 ${TITLE_H}`}>
                    <h3
                      className="text-headline-md font-headline-md text-text-primary mb-1 break-words"
                      style={{
                        fontFamily: 'Anton, "Bebas Neue", sans-serif',
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                        fontSize: '26px',
                      }}
                    >
                      {card.title}
                    </h3>
                    <div className={theme.role}>{card.role}</div>
                  </div>

                  <p
                    className={`flex-1 text-[14px] font-body-sm text-text-secondary leading-relaxed mb-6 ${BLURB_H} break-words`}
                  >
                    {card.blurb}
                  </p>

                  <ul
                    className={`grid grid-cols-2 gap-x-4 gap-y-1.5 text-mono-metric font-mono-metric text-[12px] leading-relaxed text-text-secondary mb-6 break-words ${SERVICES_H}`}
                  >
                    {/* The bullet is typesetting, not copy, so it stays here. */}
                    {card.services.map((service, j) => (
                      <li key={`${card.id}-${j}`}>• {service}</li>
                    ))}
                  </ul>

                  <div className={`flex-1 grid auto-rows-min grid-cols-2 gap-2.5 mb-6 ${CHIPS_H}`}>
                    {card.chips.map((chip, j) => (
                      <div
                        key={chip.id}
                        className="p-3 rounded-xl bg-slate-surface border border-slate-border min-w-0"
                      >
                        <div className={CHIP_LABEL}>{chip.label}</div>
                        <div
                          className={
                            theme.chipValues[j] ??
                            theme.chipValues[theme.chipValues.length - 1]
                          }
                        >
                          {/* `countTo: null` is a plain-text chip; otherwise the
                              number animates and the suffix rides with it. */}
                          {chip.countTo !== null ? (
                            <>
                              <CountUp target={chip.countTo} suffix={chip.suffix} />{' '}
                            </>
                          ) : null}
                          {chip.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  className={theme.cta}
                  href={card.ctaHref}
                  {...(external ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
                  {...(theme.tooltip ? { title: card.ctaLabel } : {})}
                >
                  <span className="min-w-0 flex-1 truncate">{card.ctaLabel}</span>
                  <span className="material-symbols-outlined text-[18px] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    {card.ctaIcon}
                  </span>
                </a>
              </div>
            )
          })}
        </div>
      </div>
      </Reveal>
      </div>
    </section>
  )
}