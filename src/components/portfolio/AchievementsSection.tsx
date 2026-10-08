import * as React from 'react'
import { CountUp } from './CountUp'
import { Reveal } from './Reveal'
import { DEFAULT_SITE_SETTINGS } from '../../../admin/server/settings-schema'
import type { AchievementsSettings } from '../../../admin/server/settings-schema'

const DEFAULT_ACHIEVEMENTS = DEFAULT_SITE_SETTINGS.achievements

type DeckCard = AchievementsSettings['deck'][number]

/**
 * The per-card colour classes, lifted verbatim out of the four cards this
 * section used to hand-write. The admin edits the copy and names an `accent`;
 * the palette itself stays here, so a content manager cannot break the theme.
 *
 * The gradient variables are NOT derived from the card's position in the deck.
 * `--portfolio-achievement-N-*` is baked per entry below, so reordering or
 * deleting a card in the admin moves the card without repointing it at another
 * card's gradient.
 */
const ACCENTS = {
  gold: {
    text: 'text-accent-gold',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/15',
    softBg: 'bg-amber-500/10',
    cardBg: 'bg-[var(--portfolio-achievement-1-card)]',
    cardBorder: 'border-amber-500/30',
    headBg: 'bg-[var(--portfolio-achievement-1-head)]',
    headBorder: 'border-amber-500/20',
    bodyFrom: 'from-[var(--portfolio-achievement-1-body-start)]',
    bodyTo: 'to-[var(--portfolio-achievement-1-body-end)]',
    tabActive: 'bg-amber-500 border-amber-500 text-black',
  },
  cyan: {
    text: 'text-cyan-400',
    border: 'border-cyan-400/30',
    bg: 'bg-cyan-500/15',
    softBg: 'bg-cyan-500/10',
    cardBg: 'bg-[var(--portfolio-achievement-2-card)]',
    cardBorder: 'border-cyan-400/30',
    headBg: 'bg-[var(--portfolio-achievement-2-head)]',
    headBorder: 'border-cyan-400/20',
    bodyFrom: 'from-[var(--portfolio-achievement-2-body-start)]',
    bodyTo: 'to-[var(--portfolio-achievement-2-body-end)]',
    tabActive: 'bg-cyan-400 border-cyan-400 text-black',
  },
  emerald: {
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/15',
    softBg: 'bg-emerald-500/10',
    cardBg: 'bg-[var(--portfolio-achievement-3-card)]',
    cardBorder: 'border-emerald-500/30',
    headBg: 'bg-[var(--portfolio-achievement-3-head)]',
    headBorder: 'border-emerald-500/20',
    bodyFrom: 'from-[var(--portfolio-achievement-3-body-start)]',
    bodyTo: 'to-[var(--portfolio-achievement-3-body-end)]',
    tabActive: 'bg-emerald-400 border-emerald-400 text-black',
  },
  indigo: {
    text: 'text-indigo-400',
    border: 'border-indigo-400/30',
    bg: 'bg-indigo-500/15',
    softBg: 'bg-indigo-500/10',
    cardBg: 'bg-[var(--portfolio-achievement-4-card)]',
    cardBorder: 'border-indigo-400/30',
    headBg: 'bg-[var(--portfolio-achievement-4-head)]',
    headBorder: 'border-indigo-400/20',
    bodyFrom: 'from-[var(--portfolio-achievement-4-body-start)]',
    bodyTo: 'to-[var(--portfolio-achievement-4-body-end)]',
    tabActive: 'bg-indigo-400 border-indigo-400 text-black',
  },
} as const

type AccentClasses = (typeof ACCENTS)[keyof typeof ACCENTS]
type AccentKey = keyof typeof ACCENTS

/**
 * The `accent` enum is site-wide and wider than the four themes designed here,
 * so an unmapped value falls back to gold rather than rendering an unthemed
 * card.
 */
const accentFor = (key: DeckCard['accent']): AccentClasses =>
  Object.hasOwn(ACCENTS, key) ? ACCENTS[key as AccentKey] : ACCENTS.gold

/**
 * `stats` used to be a `React.ReactNode[]` — raw JSX fragments mixing
 * `<CountUp>` elements with bare strings — which cannot be validated, stored or
 * edited. Settings hold structured rows instead, so this rebuilds the markup
 * that fragment used to produce: the animated counter followed by its label
 * inside one text run, with the single literal space the JSX had between them.
 */
function renderStat(stat: DeckCard['stats'][number]) {
  if (stat.kind === 'count') {
    return (
      <>
        <CountUp
          target={stat.countTo ?? 0}
          prefix={stat.prefix}
          suffix={stat.suffix}
        />{' '}
        {stat.label}
      </>
    )
  }
  return <>{stat.text}</>
}

export function AchievementsSection({
  settings = DEFAULT_ACHIEVEMENTS,
}: {
  /** Eyebrow copy, the deck cards and their per-card accents. Managed in the admin panel. */
  settings?: AchievementsSettings
}) {
  const deck = settings.deck
  // All deck data is static — render immediately, no skeleton delay.
  const [active, setActive] = React.useState(0)
  const [direction, setDirection] = React.useState(1)
  const touchX = React.useRef<number | null>(null)

  const goTo = (i: number) => {
    const n = (i + deck.length) % deck.length
    setDirection(n > active || (active === deck.length - 1 && n === 0) ? 1 : -1)
    setActive(n)
  }
  // The length is a dependency now that the deck is data: a saved card deletion
  // must not leave these callbacks modulo-ing a stale count.
  const next = React.useCallback(() => {
    setDirection(1)
    setActive((a) => (a + 1) % deck.length)
  }, [deck.length])
  const prev = React.useCallback(() => {
    setDirection(-1)
    setActive((a) => (a - 1 + deck.length) % deck.length)
  }, [deck.length])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  // The admin can delete every card, and the modulo maths below divides by the
  // deck length — render nothing rather than throw.
  if (deck.length === 0) return null

  const card = deck[active]
  const accent = accentFor(card.accent)

  // order for peeking bars: the 3 cards behind active, nearest first
  const behind = [1, 2, 3].map((o) => (active + o) % deck.length)

  return (
    
    <section
      className="py-24 w-full border-b border-slate-border relative section-hairline"
      id="achievements"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
      <div>
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-2/3 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-border gap-6 relative z-10">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 mb-3">
              <span className="inline-flex items-center whitespace-nowrap shrink-0 px-3 py-1.5 rounded-full text-[11px] leading-none font-label-badge bg-primary/10 border border-primary/30 text-primary uppercase tracking-[0.14em]">
                {settings.badge}
              </span>
              <span className="text-mono-metric font-mono-metric text-text-tertiary shrink-0">{settings.badgeSeparator}</span>
              <span className="whitespace-nowrap text-mono-metric font-mono-metric text-text-secondary text-[12px] tracking-wider">
                INTERACTIVE DECK • {String(active + 1).padStart(2, '0')} / {String(deck.length).padStart(2, '0')}
              </span>
            </div>
            <h2
              className="text-headline-lg font-headline-lg text-text-primary tracking-tight text-balance max-w-2xl"
              style={{
                fontFamily: 'Anton, "Bebas Neue", sans-serif',
                letterSpacing: '0.025em',
                textTransform: 'uppercase',
                lineHeight: 1.15,
              }}
            >
              {settings.heading}
            </h2>
            <p className="mt-3 max-w-xl text-mono-metric font-mono-metric text-text-tertiary text-[12px] leading-relaxed">
              {settings.intro}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap max-w-full">
            {deck.map((d, i) => {
              const isActive = i === active
              const theme = accentFor(d.accent)
              return (
                <button
                  key={d.id}
                  onClick={() => goTo(i)}
                  className={`px-3.5 py-1.5 rounded-full text-mono-metric text-[11px] font-bold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? `${theme.tabActive} shadow-lg scale-105`
                      : 'bg-slate-surface border-slate-border text-text-tertiary hover:text-text-primary hover:border-slate-border-highlight'
                  }`}
                >
                  <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${isActive ? 'bg-[#071A12]' : `${theme.text} bg-current`}`} />
                  {d.tabShort}
                </button>
              )
            })}
          </div>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="relative w-full max-w-5xl mx-auto">
          {/* Archive index rows — click to bring to front */}
          <div className="flex flex-col gap-2 mb-3">
            {behind
              .slice()
              .reverse()
              .map((cardIdx) => {
                const d = deck[cardIdx]
                const theme = accentFor(d.accent)
                return (
                  <button
                    key={d.id}
                    onClick={() => goTo(cardIdx)}
                    className="group w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5 rounded-xl bg-slate-surface border border-slate-border hover:border-slate-border-highlight transition-all cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className={`text-[11px] font-mono-metric font-bold ${theme.text}`}>
                        ✦ {d.index}.
                      </span>
                      <span className="text-[11px] sm:text-xs font-mono-metric font-semibold text-text-secondary group-hover:text-text-primary truncate uppercase tracking-wider">
                        {d.barTitle}
                      </span>
                    </span>
                    <span className={`hidden sm:inline text-[10px] font-mono-metric uppercase tracking-wider shrink-0 ${theme.text}`}>
                      {d.peekMeta}
                    </span>
                  </button>
                )
              })}
          </div>

          {/* Main deck card */}
          <div
            onTouchStart={(e) => {
              touchX.current = e.touches[0]?.clientX ?? null
            }}
            onTouchEnd={(e) => {
              if (touchX.current == null) return
              const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current
              if (dx < -40) next()
              if (dx > 40) prev()
              touchX.current = null
            }}
          >
            {/* shadow stack behind card only */}
            <div className="relative rounded-2xl">
            <div className="absolute inset-0 translate-y-3 scale-[0.98] rounded-2xl bg-slate-surface border border-slate-border pointer-events-none" />
            <div className="absolute inset-0 translate-y-6 scale-[0.96] rounded-2xl bg-slate-surface/70 border border-slate-border pointer-events-none" />

            <div
              key={card.id}
              className={`deck-enter relative rounded-2xl overflow-hidden border ${accent.cardBorder} ${accent.cardBg} shadow-2xl ${
                direction === 1 ? 'deck-from-right' : 'deck-from-left'
              }`}
              style={{ ['--deck-accent' as string]: accent.text }}
            >
              {/* Archive record header */}
              <div
                className={`w-full ${accent.headBg} border-b ${accent.headBorder} px-6 sm:px-8 py-3.5 flex items-center justify-between gap-3 text-text-primary select-none`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${accent.text} bg-current`} />
                  <span className="text-[11px] sm:text-xs font-mono-metric font-extrabold uppercase tracking-wider text-text-primary truncate">
                    {card.index}. {card.barTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`hidden sm:inline-flex items-center whitespace-nowrap shrink-0 px-2.5 py-1 rounded-md text-[10px] leading-none font-mono-metric font-bold ${accent.bg} ${accent.text} border ${accent.border} uppercase tracking-widest`}
                  >
                    {card.badge}
                  </span>
                  <span className="text-[10px] font-mono-metric text-text-tertiary uppercase tracking-widest whitespace-nowrap">
                    Deck Card {active + 1}/{deck.length}
                  </span>
                </div>
              </div>

              <div className={`p-6 sm:p-8 bg-gradient-to-b ${accent.bodyFrom} ${accent.bodyTo} backdrop-blur-xl`}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7 space-y-5 min-w-0">
                    <div
                      className={`inline-flex items-center whitespace-nowrap shrink-0 max-w-full gap-2 px-3 py-1 rounded-full text-[11px] leading-none font-mono-metric overflow-hidden ${accent.bg} border ${accent.border} ${accent.text}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0"></span>
                      <span className="truncate">{card.pill}</span>
                    </div>
                    <h3
                      className="text-2xl sm:text-[32px] font-extrabold text-text-primary tracking-tight leading-[1.15]"
                      style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                    >
                      {card.heading}
                    </h3>
                    <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed">
                      {card.description}
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {card.stats.slice(0, 2).map((s, si) => (
                        <div key={s.id} className="p-4 rounded-xl bg-slate-surface border border-slate-border">
                          <div className={`text-lg sm:text-xl font-bold font-mono-metric ${si === 0 ? accent.text : 'text-text-primary'}`}>
                            {renderStat(s)}
                          </div>
                          <div className="text-[10px] font-mono-metric text-text-tertiary uppercase tracking-wider mt-1">
                            {card.statLabels[si]}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {card.stats.slice(2).map((s, si) => (
                        <div key={s.id} className="p-4 rounded-xl bg-slate-surface border border-slate-border">
                          <div className="text-lg sm:text-xl font-bold font-mono-metric text-text-primary">
                            {renderStat(s)}
                          </div>
                          <div className="text-[10px] font-mono-metric text-text-tertiary uppercase tracking-wider mt-1">
                            {card.statLabels[si + 2]}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <a
                        href={card.ctaHref}
                        {...(card.ctaHref.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-wider no-underline border transition-all hover:brightness-125 ${accent.tabActive}`}
                      >
                        <span>{card.ctaLabel}</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                      </a>
                      <button
                        onClick={next}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-wider bg-slate-surface border border-slate-border text-text-secondary hover:text-text-primary hover:border-slate-border-highlight transition-all cursor-pointer"
                      >
                        <span>{settings.inspectLabel}</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>

                  {/* Registry terminal panel */}
                  <div className="lg:col-span-5 flex flex-col min-w-0">
                    <div className="w-full rounded-xl bg-[#071A12] border border-white/10 overflow-hidden shadow-xl">
                      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.03]">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                        <span className="ml-2 text-[11px] font-mono-metric text-text-tertiary truncate">{card.fileName}</span>
                        <span className={`ml-auto flex items-center gap-1.5 text-[10px] font-mono-metric uppercase tracking-wider shrink-0 ${accent.text}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {card.certStatus}
                        </span>
                      </div>
                      <div className="p-4 sm:p-5 font-mono-metric text-[12px] leading-relaxed">
                        <div className="text-text-tertiary">{`// ${card.certSub}`}</div>
                        <div className="mt-2">
                          <span className="text-purple-400">const </span>
                          <span className="text-cyan-300">registryRecord </span>
                          <span className="text-slate-400">= {'{'}</span>
                        </div>
                        <div className="pl-4">
                          <span className="text-slate-300">recordId</span>
                          <span className="text-slate-500">: </span>
                          <span className={accent.text}>"{card.certNo}"</span>
                          <span className="text-slate-500">,</span>
                        </div>
                        <div className="pl-4">
                          <span className="text-slate-300">honor</span>
                          <span className="text-slate-500">: </span>
                          <span className="text-emerald-300">"{card.certTitle}"</span>
                          <span className="text-slate-500">,</span>
                        </div>
                        <div className="pl-4">
                          <span className="text-slate-300">standing</span>
                          <span className="text-slate-500">: </span>
                          <span className="text-amber-300">"{card.certStatus}"</span>
                        </div>
                        <div className="text-slate-400">{'};'}</div>
                        <div className="mt-3 flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-lg ${accent.softBg} border ${accent.border} flex items-center justify-center ${accent.text} shrink-0`}
                          >
                            <span className="material-symbols-outlined text-[24px]">{card.certIcon}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-white uppercase tracking-wider truncate">{card.certTitle}</div>
                            <div className="text-[11px] text-text-tertiary font-mono-metric truncate">{card.certSub}</div>
                          </div>
                        </div>
                        <p className="mt-3 text-[11px] text-amber-200/80 leading-relaxed">
                          {`// ${card.quote.replace(/[“”]/g, '')}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* Archive footer controls — aligned to card edges */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="flex-1 min-w-0 truncate text-[11px] font-mono-metric text-text-tertiary tracking-wide">
                <span className={`${accent.text}`}>●</span> Card {active + 1} of {deck.length}: {card.barTitle}
              </span>
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <div className="hidden sm:flex items-center gap-1.5 mr-1">
                  {deck.map((d, i) => (
                    <button
                      key={d.id}
                      type="button"
                      aria-label={`Go to card ${i + 1}`}
                      onClick={() => goTo(i)}
                      className="p-1.5 flex items-center justify-center cursor-pointer focus:outline-none"
                    >
                      <span
                        className={`h-1.5 rounded-full transition-all block ${
                          i === active ? `w-6 ${accent.bg} border ${accent.border}` : 'w-1.5 bg-slate-border hover:bg-slate-border-highlight'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <button
                  onClick={prev}
                  aria-label="Previous honor"
                  className="w-9 h-9 shrink-0 rounded-lg border border-slate-border bg-slate-surface text-text-primary flex items-center justify-center hover:border-slate-border-highlight transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button
                  onClick={next}
                  aria-label="Next honor"
                  className="w-9 h-9 sm:w-auto sm:h-9 sm:px-3.5 rounded-lg border border-slate-border bg-slate-surface text-text-secondary hover:text-text-primary hover:border-slate-border-highlight flex items-center justify-center sm:justify-start gap-0 sm:gap-1.5 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0"
                >
                  <span className="hidden sm:inline">Cycle Deck</span>
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <style>{`
        .deck-enter { animation: deck-in 420ms cubic-bezier(0.16,1,0.3,1) both; }
        .deck-from-right { --deck-x: 46px; }
        .deck-from-left { --deck-x: -46px; }
        @keyframes deck-in {
          from { opacity: 0; transform: translateX(var(--deck-x, 46px)) scale(0.985); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) { .deck-enter { animation: none; } }
      `}</style>
      </div>
      </div>
    </section>
  )
}
