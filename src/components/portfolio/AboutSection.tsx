import * as React from 'react'
import { prefersReducedMotion, isMobileDevice } from '../../routes/lib/gsap'
import { loadGsap } from '../../routes/lib/gsapLoader'
import { DEFAULT_SITE_SETTINGS } from '../../../admin/server/settings-schema'
import type { AboutSettings } from '../../../admin/server/settings-schema'

const DEFAULT_ABOUT = DEFAULT_SITE_SETTINGS.about

/**
 * The six floating pills are a closed visual set, not a theme the admin picks:
 * each pill owns its own float animation class and its own gradient, and nothing
 * in settings records which is which. The classes therefore stay here in code
 * and are looked up POSITIONALLY — index 0 is the first pill of the left column,
 * index 3 the first of the right, matching the order of `settings.pills`. Adding
 * a seventh pill extends the right column rather than re-theming the row, and
 * reordering the settings array would move the text without moving the colours.
 * Past the sixth, the last style repeats so a longer list still renders.
 */
const PILL_STYLES = [
  {
    pill: 'float-pill-1 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-surface border border-blue-500/30 shadow-[0_0_20px_var(--portfolio-glow-cyan)] hover:border-blue-400/50 hover:shadow-[0_0_28px_var(--portfolio-glow-cyan-hover)] hover:scale-105 transition-all duration-300 cursor-pointer select-none',
    disc: 'w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-sm shrink-0',
    glyph: 'material-symbols-outlined text-[16px]',
  },
  {
    pill: 'float-pill-2 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-surface border border-blue-400/25 shadow-[0_0_16px_var(--portfolio-glow-blue)] hover:border-blue-400/45 hover:shadow-[0_0_24px_var(--portfolio-glow-blue-hover)] hover:scale-105 transition-all duration-300 cursor-pointer select-none lg:mr-4',
    disc: 'w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0',
    glyph: 'material-symbols-outlined text-[16px]',
  },
  {
    pill: 'float-pill-3 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-surface border border-slate-border shadow-lg hover:border-blue-500/40 hover:shadow-[0_0_20px_var(--portfolio-glow-cyan)] hover:scale-105 transition-all duration-300 cursor-pointer select-none',
    disc: 'w-7 h-7 rounded-full bg-slate-surface border border-slate-border flex items-center justify-center text-blue-500 shadow-sm shrink-0',
    glyph: 'material-symbols-outlined text-[16px]',
  },
  {
    pill: 'float-pill-4 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-surface border border-blue-500/30 shadow-[0_0_20px_var(--portfolio-glow-cyan)] hover:border-blue-400/50 hover:shadow-[0_0_28px_var(--portfolio-glow-cyan-hover)] hover:scale-105 transition-all duration-300 cursor-pointer select-none',
    disc: 'w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-sm shrink-0',
    glyph: 'material-symbols-outlined text-[16px] font-bold',
  },
  {
    pill: 'float-pill-5 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-surface border border-blue-400/25 shadow-[0_0_16px_var(--portfolio-glow-blue)] hover:border-blue-400/45 hover:shadow-[0_0_24px_var(--portfolio-glow-blue-hover)] hover:scale-105 transition-all duration-300 cursor-pointer select-none lg:ml-4',
    disc: 'w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-sm shrink-0',
    glyph: 'material-symbols-outlined text-[16px]',
  },
  {
    pill: 'float-pill-6 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-surface border border-indigo-400/25 shadow-[0_0_16px_var(--portfolio-glow-indigo)] hover:border-indigo-400/45 hover:shadow-[0_0_24px_var(--portfolio-glow-indigo-hover)] hover:scale-105 transition-all duration-300 cursor-pointer select-none',
    disc: 'w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-sm shrink-0',
    glyph: 'material-symbols-outlined text-[16px] font-bold',
  },
] as const

/** Pill themes beyond the sixth (the schema allows eight) repeat the last one. */
const pillStyleAt = (index: number) =>
  PILL_STYLES[index] ?? PILL_STYLES[PILL_STYLES.length - 1]

/**
 * The three pillar cards share one layout and differ by glow colour, by header
 * treatment and by the label / footer icon colours. `header` is 'dots' for the
 * first pillar, which leads with the nine-dot brand mark instead of an icon
 * badge — so that card's `headerIcon` in settings has nothing to render into.
 * Indexed POSITIONALLY for the same reason as PILL_STYLES: the palette is design,
 * so the pillars are not reorderable.
 */
const PILLAR_STYLES = [
  {
    card: 'w-full max-w-2xl p-6 md:p-7 rounded-2xl md:rounded-3xl executive-card executive-card-glow-blue relative group transition-all duration-300 hover:border-blue-400/40',
    header: 'grid grid-cols-3 gap-1 p-1 bg-slate-surface rounded-md border border-slate-border shrink-0',
    headerKind: 'dots',
    headerGlyph: '',
    label:
      'text-[12px] font-mono-metric font-semibold tracking-[0.2em] text-[#0D281E] dark:text-[#E5C07B] uppercase',
    footerGlyph:
      'material-symbols-outlined text-[#0D281E] dark:text-[#E5C07B] text-[16px]',
  },
  {
    card: 'w-full max-w-2xl p-6 md:p-7 rounded-2xl md:rounded-3xl executive-card executive-card-glow-amber relative group transition-all duration-300 hover:border-blue-400/40',
    header: 'w-6 h-6 rounded-md bg-blue-500/15 border border-blue-400/35 flex items-center justify-center text-[#0D281E] dark:text-[#E5C07B] shrink-0',
    headerKind: 'glyph',
    headerGlyph: 'material-symbols-outlined text-[15px]',
    label:
      'text-[12px] font-mono-metric font-semibold tracking-[0.2em] text-[#0D281E] dark:text-[#E5C07B] uppercase',
    footerGlyph:
      'material-symbols-outlined text-[#0D281E] dark:text-[#E5C07B] text-[16px]',
  },
  {
    card: 'w-full max-w-2xl p-6 md:p-7 rounded-2xl md:rounded-3xl executive-card executive-card-glow-cyan relative group transition-all duration-300 hover:border-cyan-400/40',
    header: 'w-6 h-6 rounded-md bg-cyan-500/15 border border-cyan-400/35 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0',
    headerKind: 'glyph',
    headerGlyph: 'material-symbols-outlined text-[15px]',
    label:
      'text-[12px] font-mono-metric font-semibold tracking-[0.2em] text-cyan-600 dark:text-cyan-300 uppercase',
    footerGlyph:
      'material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-[16px]',
  },
] as const

/** The nine-dot brand mark that stands in for the first pillar's header icon. */
const BRAND_DOT_COLOURS = [
  'bg-blue-400',
  'bg-cyan-400',
  'bg-blue-300',
  'bg-indigo-400',
  'bg-sky-400',
  'bg-blue-500',
  'bg-cyan-300',
  'bg-blue-600',
  'bg-indigo-300',
] as const

export function AboutSection({
  settings = DEFAULT_ABOUT,
}: {
  /** Editable copy, supplied by the route from the database. */
  settings?: AboutSettings
}) {
  const sectionRef = React.useRef<HTMLElement | null>(null)
  const bgRef = React.useRef<HTMLDivElement | null>(null)

  // Desktop: pin the golden-ratio backdrop for the section's scroll range
  // (pinSpacing:false, so layout is untouched). Content scrolls over the
  // fixed diagram; it releases when the section ends. Mobile uses native
  // CSS sticky instead (see .gr-bg), reduced-motion/SSR stay static.
  React.useEffect(() => {
    if (isMobileDevice()) return
    const section = sectionRef.current
    const bg = bgRef.current
    if (!section || !bg || typeof window === 'undefined') return
    if (prefersReducedMotion()) return

    let cancelled = false
    let revert: (() => void) | null = null

    loadGsap().then(
      ({ gsap, ScrollTrigger }) => {
        if (cancelled || !sectionRef.current || !bgRef.current) return
        const ctx = gsap.context(() => {
          ScrollTrigger.create({
            trigger: bg,
            start: 'top top',
            end: () =>
              `+=${Math.max(0, section.offsetHeight - window.innerHeight)}`,
            pin: bg,
            pinSpacing: false,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          })
        }, section)
        revert = () => ctx.revert()
        ScrollTrigger.refresh()
      },
      () => {
        /* GSAP failed — static backdrop remains */
      },
    )

    return () => {
      cancelled = true
      revert?.()
    }
  }, [])

  // Three pills either side of the headline; anything past the sixth lands in
  // the right column. Styles are positional — see PILL_STYLES.
  const leftPills = settings.pills.slice(0, 3)
  const rightPills = settings.pills.slice(3)

  const renderPill = (
    pill: AboutSettings['pills'][number],
    style: (typeof PILL_STYLES)[number],
  ) => (
    <div key={pill.id} className={style.pill}>
      <div className={style.disc}>
        <span className={style.glyph}>{pill.icon}</span>
      </div>
      <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
        {pill.label}
      </span>
    </div>
  )

  return (
    <section
      ref={sectionRef}
      className="py-24 w-full border-b border-slate-border relative overflow-x-clip section-hairline bg-[var(--portfolio-about-bg)]"
      id="about"
    >
      {/* Golden-ratio spiral backdrop — pure CSS nested squares + arcs.
          Exact φ tiling (% of width): 61.80 · 38.20 · 23.61 · 14.59 · 9.02 ·
          5.57 · 3.44 · 2.13 · 1.32 · 0.81 (= Fibonacci 89·55·34·21·13·8·5·3·2·1
          scaled, container aspect 1.618:1). Each ::before is a 200% circle
          clipped to a seamless 90° arc. Strictly a background: absolute,
          non-interactive, z-index 0. */}
      <div aria-hidden ref={bgRef} className="gr-bg">
        <div className="gr-frame">
          <div className="gr">
          <div className="gr-box gr-b1" />
          <div className="gr-box gr-b2" />
          <div className="gr-box gr-b3" />
          <div className="gr-box gr-b4" />
          <div className="gr-box gr-b5" />
          <div className="gr-box gr-b6" />
          <div className="gr-box gr-b7" />
          <div className="gr-box gr-b8" />
          <div className="gr-box gr-b9" />
          <div className="gr-box gr-b10" />
          <div className="gr-dot" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
      <div className="w-full mb-16 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-label-badge font-label-badge bg-slate-surface border border-blue-500/30 text-blue-600 dark:text-[#E5C07B] mb-4">
            <span className="material-symbols-outlined text-[14px]">{settings.eyebrowIcon}</span>
            <span>{settings.eyebrow}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
          {/* Left Floating Pills */}
          <div className="lg:col-span-3 flex flex-col gap-4 lg:gap-5 justify-center items-center lg:items-end">
            {leftPills.map((pill, i) => renderPill(pill, pillStyleAt(i)))}
          </div>

          {/* Center Philosophy Headline */}
          <div className="lg:col-span-6 text-center px-2 sm:px-6">
            <h2
              className="text-2xl sm:text-3xl lg:text-[36px] font-bold tracking-tight leading-[1.25] text-text-primary"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              {/* One sentence, three coloured emphasis spans. The commas and the
                  conjunction are part of the typesetting, not the copy, so they
                  stay here; the fragments themselves carry their own edges. */}
              <span className="text-text-secondary font-normal">
                {settings.headingLeadIn}
              </span>
              <span className="text-text-primary font-bold">
                {settings.headingEmphasis1}
              </span>
              <span className="text-text-secondary font-normal">, </span>
              <span className="text-[#0D281E] dark:text-[#E5C07B] font-bold">
                {settings.headingEmphasis2}
              </span>
              <span className="text-text-secondary font-normal">, and </span>
              <span className="text-[#8C6D1F] dark:text-[#D4AF37] font-bold">
                {settings.headingEmphasis3}
              </span>
              <span className="text-text-secondary font-normal">
                {settings.headingClosing}
              </span>
            </h2>
            <p className="text-body-md font-body-md text-text-secondary mt-6 leading-relaxed max-w-xl mx-auto">
              {settings.intro}
            </p>
          </div>

          {/* Right Floating Pills */}
          <div className="lg:col-span-3 flex flex-col gap-4 lg:gap-5 justify-center items-center lg:items-start">
            {rightPills.map((pill, i) =>
              renderPill(pill, pillStyleAt(i + leftPills.length)),
            )}
          </div>
        </div>
      </div>

      {/* Staggered Speech Bubble Dialogue Thread — one prompt then one answer
          card per entry, in the order `pillars` is stored. */}
      <div className="max-w-4xl mx-auto flex flex-col space-y-7 py-4 relative z-10">
        {settings.pillars.map((pillar, i) => {
          const style = PILLAR_STYLES[i] ?? PILLAR_STYLES[0]
          return (
            <React.Fragment key={pillar.id}>
              {/* Prompt Bubble */}
              <div className="flex justify-end w-full">
                <div className="max-w-xl px-6 py-4 rounded-2xl md:rounded-3xl bg-slate-surface border border-slate-border text-text-secondary text-[15px] md:text-[16px] leading-relaxed bubble-glow transition-all duration-300 hover:border-blue-400/35">
                  &ldquo;{pillar.question}&rdquo;
                </div>
              </div>

              {/* Answer card */}
              <div className="flex justify-start w-full">
                <div className={style.card}>
                  <div className="flex items-center gap-3 mb-3.5">
                    {style.headerKind === 'dots' ? (
                      <div className={style.header}>
                        {BRAND_DOT_COLOURS.map((colour) => (
                          <span
                            key={colour}
                            className={`w-1.5 h-1.5 rounded-full ${colour}`}
                          ></span>
                        ))}
                      </div>
                    ) : (
                      <div className={style.header}>
                        <span className={style.headerGlyph}>
                          {pillar.headerIcon}
                        </span>
                      </div>
                    )}
                    <span className={style.label}>{pillar.label}</span>
                  </div>
                  <p className="text-[15px] md:text-[16px] text-text-secondary leading-relaxed mb-4">
                    <strong className="text-text-primary font-semibold">
                      {pillar.lead}
                    </strong>
                    {pillar.body}
                  </p>
                  <div className="pt-3 border-t border-slate-border flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-text-secondary">
                    <span>{pillar.footerMeta}</span>
                    <span className={style.footerGlyph}>{pillar.footerIcon}</span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          )
        })}
      </div>
      </div>
    </section>
  )
}