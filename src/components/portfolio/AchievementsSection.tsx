import * as React from 'react'
import { CountUp } from './CountUp'
import { Reveal } from './Reveal'

type Accolade = {
  id: string
  index: string
  barTitle: string
  badge: string
  badgeIcon: string
  accentText: string
  accentBorder: string
  accentBg: string
  accentSoftBg: string
  cardBg: string
  cardBorder: string
  headBg: string
  headBorder: string
  bodyFrom: string
  bodyTo: string
  pill: string
  heading: string
  description: string
  certNo: string
  certStatus: string
  certIcon: string
  certTitle: string
  certSub: string
  quote: string
  stats: React.ReactNode[]
  peekMeta: string
}

const DECK: Accolade[] = [
  {
    id: 'accolade-card-1',
    index: '01',
    barTitle: 'BNI REGIONAL & NATIONAL EXECUTIVE CONCLAVE',
    badge: 'GOLD CLUB CITATION',
    badgeIcon: 'military_tech',
    accentText: 'text-accent-gold',
    accentBorder: 'border-amber-500/30',
    accentBg: 'bg-amber-500/15',
    accentSoftBg: 'bg-amber-500/10',
    cardBg: 'bg-[#0d1017]',
    cardBorder: 'border-amber-500/30',
    headBg: 'bg-[#141926]/90',
    headBorder: 'border-amber-500/20',
    bodyFrom: 'from-[#141926]/95',
    bodyTo: 'to-[#0b0e17]/95',
    pill: 'EXECUTIVE BOARD CONFERRAL • TAMIL NADU REGION',
    heading: 'Outstanding Chapter Director & Gold Club Milestone',
    description:
      "Awarded for steering one of Tamil Nadu's most prolific BNI regional chapters, attaining milestone member retention, and orchestrating unprecedented transaction velocity across high-trust SME networks.",
    certNo: 'CERTIFICATE NO. // BNI-TN-984',
    certStatus: 'VERIFIED',
    certIcon: 'award_star',
    certTitle: 'Regional Growth Architect',
    certSub: 'Southern India Leadership Conclave',
    quote:
      '“Recognized for high-impact governance, continuous cross-chapter referrals, and institutional mentoring of emerging tier-2 entrepreneurs.”',
    peekMeta: 'IMPACT: ₹120 Cr+ GENERATED',
    stats: [
      <>
        ₹<CountUp target={120} suffix="+" /> Cr
      </>,
      <>Gold Club</>,
      <>
        <CountUp target={98} suffix=".4%" />
      </>,
      <>
        <CountUp target={500} suffix="+" />
      </>,
    ],
  },
  {
    id: 'accolade-card-2',
    index: '02',
    barTitle: 'ENTERPRISE TECH SUMMIT • SOUTHERN INDIA',
    badge: 'TECH EXCELLENCE',
    badgeIcon: 'cloud_done',
    accentText: 'text-cyan-400',
    accentBorder: 'border-cyan-400/30',
    accentBg: 'bg-cyan-500/15',
    accentSoftBg: 'bg-cyan-500/10',
    cardBg: 'bg-[#0c1018]',
    cardBorder: 'border-cyan-400/30',
    headBg: 'bg-[#121a28]/90',
    headBorder: 'border-cyan-400/20',
    bodyFrom: 'from-[#121929]/95',
    bodyTo: 'to-[#0a0d16]/95',
    pill: 'ENTERPRISE CLOUD ARCHITECTURE • DOMESTIC LEADERSHIP',
    heading: 'Infodazz: Premier Enterprise Cloud & AI Integration Partner',
    description:
      'Recognized for high-concurrency cloud orchestration, automated microservice pipelines, and robust industrial ERP architectures deployed across domestic enterprise clients and regional manufacturers in India.',
    certNo: 'HONOR REF // TECH-SUM-042',
    certStatus: 'VALIDATED',
    certIcon: 'workspace_premium',
    certTitle: 'Cloud Innovator Seal',
    certSub: 'Tamil Nadu Enterprise Tech Forum',
    quote:
      '“Conferred to Dr. S. K. and Infodazz for outstanding technical execution in real-time distributed data pipelines and regional manufacturing digitization.”',
    peekMeta: 'ENTERPRISE: TIER-1 IT INFRASTRUCTURE',
    stats: [
      <>
        <CountUp target={100} suffix="+" /> Enterprise
      </>,
      <>Tier-1 Corridors</>,
      <>&lt; 12ms High-Load</>,
      <>
        <CountUp target={99} suffix=".98%" />
      </>,
    ],
  },
  {
    id: 'accolade-card-3',
    index: '03',
    barTitle: 'SSRG GLOBAL ACADEMIC RESEARCH SENATE',
    badge: 'DOCTORAL RECOGNITION',
    badgeIcon: 'school',
    accentText: 'text-emerald-400',
    accentBorder: 'border-emerald-500/30',
    accentBg: 'bg-emerald-500/15',
    accentSoftBg: 'bg-emerald-500/10',
    cardBg: 'bg-[#0a1215]',
    cardBorder: 'border-emerald-500/30',
    headBg: 'bg-[#101e1a]/90',
    headBorder: 'border-emerald-500/20',
    bodyFrom: 'from-[#101b1a]/95',
    bodyTo: 'to-[#090e12]/95',
    pill: 'PH.D. DOCTORATE • PEER-REVIEWED SCHOLARSHIP',
    heading: 'Excellence in Distributed Systems & Scholarly Governance',
    description:
      'Doctoral laurels conferred for pioneering contributions to distributed node scheduling, consensus fault recovery algorithms, and leadership of Seventh Sense Research Group publishing 10,000+ works globally.',
    certNo: 'REG. DOCTORAL ID // CSE-9421',
    certStatus: 'ACADEMIC CONFERRAL',
    certIcon: 'menu_book',
    certTitle: 'Managing Editor Laurels',
    certSub: 'SSRG International Publishing Council',
    quote:
      '“Validating 11+ years of peer-reviewed editorial stewardship across computing, applied electronics, and enterprise software engineering.”',
    peekMeta: 'ARCHIVE ID: 3064-2024',
    stats: [
      <>Distributed Nodes</>,
      <>
        <CountUp target={10000} format="comma" suffix="+" /> Works
      </>,
      <>
        <CountUp target={45} suffix="+" /> Global
      </>,
      <>Double-Blind</>,
    ],
  },
  {
    id: 'accolade-card-4',
    index: '04',
    barTitle: 'SOUTHERN INDIA COMMERCE & IT LEADERSHIP FORUM',
    badge: 'KEYNOTE FELLOW',
    badgeIcon: 'mic',
    accentText: 'text-indigo-400',
    accentBorder: 'border-indigo-400/30',
    accentBg: 'bg-indigo-500/15',
    accentSoftBg: 'bg-indigo-500/10',
    cardBg: 'bg-[#120f1d]',
    cardBorder: 'border-indigo-400/30',
    headBg: 'bg-[#1b152b]/90',
    headBorder: 'border-indigo-400/20',
    bodyFrom: 'from-[#181326]/95',
    bodyTo: 'to-[#0b0816]/95',
    pill: 'PLENARY ADDRESS • REGIONAL MSME ACCELERATION',
    heading: 'Distinguished Enterprise Keynote & Advisory Recognition',
    description:
      'Delivered the opening keynote on “Next-Decade Industrial Digitization: Scaling Tier-2 Tech Capitals into Domestic Corridors” before 800+ executive delegates, state dignitaries, and manufacturing owners.',
    certNo: 'FORUM DISPATCH // TN-CON-800',
    certStatus: 'KEYNOTE COMMENDATION',
    certIcon: 'campaign',
    certTitle: 'Distinguished Fellow',
    certSub: 'Southern India Industrial Federation',
    quote:
      '“Recognizing visionary perspectives on unifying technical resilience and localized commerce to unlock tier-2 regional prosperity.”',
    peekMeta: 'DELEGATES: 800+ LEADERS',
    stats: [
      <>
        <CountUp target={800} suffix="+" /> Leaders
      </>,
      <>MSME Cloud</>,
      <>Regional BNI</>,
      <>Plenary Stage</>,
    ],
  },
]

const STAT_LABELS = [
  ['Facilitated Value', 'Deployments', 'Core Doctoral IP', 'Delegates'],
  ['Honor Tier', 'Regional Scope', 'Papers Indexed', 'Focus Track'],
  ['Retention', 'Latency SLA', 'Universities', 'Trust Networks'],
  ['Founders Mentored', 'Uptime Standard', 'Review Protocol', 'Honor Tier'],
]

export function AchievementsSection() {
  const [loaded, setLoaded] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const [direction, setDirection] = React.useState(1)
  const touchX = React.useRef<number | null>(null)

  React.useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1500)
    return () => clearTimeout(t)
  }, [])

  const goTo = (i: number) => {
    const n = (i + DECK.length) % DECK.length
    setDirection(n > active || (active === DECK.length - 1 && n === 0) ? 1 : -1)
    setActive(n)
  }
  const next = React.useCallback(() => {
    setDirection(1)
    setActive((a) => (a + 1) % DECK.length)
  }, [])
  const prev = React.useCallback(() => {
    setDirection(-1)
    setActive((a) => (a - 1 + DECK.length) % DECK.length)
  }, [])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  const card = DECK[active]

  // order for peeking bars: the 3 cards behind active, nearest first
  const behind = [1, 2, 3].map((o) => (active + o) % DECK.length)

  return (
    
    <section
      className="py-24 max-w-7xl mx-auto px-6 md:px-12 border-b border-slate-border relative section-hairline"
      id="achievements"
    >
      {!loaded && (
        <div className="animate-pulse">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-border gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-32 rounded-full bg-white/10" />
                <div className="h-4 w-px bg-white/10" />
                <div className="h-4 w-24 rounded bg-white/10" />
              </div>
              <div className="h-10 w-3/4 rounded bg-white/10" />
              <div className="h-4 w-1/2 rounded bg-white/10" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-20 rounded-full bg-white/10" />
              <div className="h-8 w-20 rounded-full bg-white/10" />
              <div className="h-8 w-20 rounded-full bg-white/10" />
            </div>
          </div>
          <div className="relative w-full max-w-5xl mx-auto">
            <div className="flex flex-col gap-2 mb-3 space-y-2">
              <div className="h-12 rounded-xl bg-white/[0.05]" />
              <div className="h-12 rounded-xl bg-white/[0.05]" />
              <div className="h-12 rounded-xl bg-white/[0.05]" />
            </div>
            <div className="rounded-3xl bg-white/[0.03] border border-white/10 h-96" />
          </div>
        </div>
      )}
      {loaded && (
      <div>
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-2/3 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-border gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full text-label-badge font-label-badge bg-primary/10 border border-primary/30 text-primary uppercase tracking-widest">
                VERIFIED CREDENTIALS &amp; HONORS
              </span>
              <span className="text-mono-metric font-mono-metric text-text-tertiary">|</span>
              <span className="text-mono-metric font-mono-metric text-text-secondary text-[12px]">
                INTERACTIVE DECK • {String(active + 1).padStart(2, '0')} / 04
              </span>
            </div>
            <h2
              className="text-headline-lg font-headline-lg text-text-primary tracking-tight"
              style={{
                fontFamily: 'Anton, "Bebas Neue", sans-serif',
                letterSpacing: '0.025em',
                textTransform: 'uppercase',
                lineHeight: 1.15,
              }}
            >
              Institutional Accolades &amp; Industry Honors
            </h2>
            <p className="mt-3 text-mono-metric font-mono-metric text-text-tertiary text-[12px]">
              Click any peeking header or use the arrows to cycle through the four honors.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
            {DECK.map((d, i) => {
              const isActive = i === active
              return (
                <button
                  key={d.id}
                  onClick={() => goTo(i)}
                  className={`px-3 py-1.5 rounded-full text-mono-metric text-[11px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    isActive
                      ? `${d.accentBg} ${d.accentBorder} ${d.accentText} shadow-lg scale-105`
                      : 'bg-white/[0.03] border-white/10 text-text-tertiary hover:text-white hover:border-white/25'
                  }`}
                >
                  {d.index} {['BNI', 'INFODAZZ', 'SSRG', 'KEYNOTE'][i]}
                </button>
              )
            })}
          </div>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="relative w-full max-w-5xl mx-auto">
          {/* Peeking stacked headers — click to bring to front */}
          <div className="flex flex-col gap-2 mb-3">
            {behind
              .slice()
              .reverse()
              .map((cardIdx) => {
                const d = DECK[cardIdx]
                return (
                  <button
                    key={d.id}
                    onClick={() => goTo(cardIdx)}
                    className="group w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/25 hover:bg-white/[0.06] transition-all cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className={`text-[11px] font-mono-metric font-bold ${d.accentText}`}>
                        ◂ {d.index}
                      </span>
                      <span className="text-[11px] sm:text-xs font-mono-metric font-semibold text-text-secondary group-hover:text-white truncate uppercase tracking-wider">
                        {d.barTitle}
                      </span>
                    </span>
                    <span className="hidden sm:inline text-[10px] font-mono-metric text-text-tertiary uppercase tracking-wider shrink-0">
                      {d.peekMeta}
                    </span>
                  </button>
                )
              })}
          </div>

          {/* Main deck card */}
          <div
            className="relative rounded-3xl"
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
            {/* shadow stack behind */}
            <div className="absolute inset-0 translate-y-3 scale-[0.98] rounded-3xl bg-white/[0.03] border border-white/10 pointer-events-none" />
            <div className="absolute inset-0 translate-y-6 scale-[0.96] rounded-3xl bg-white/[0.02] border border-white/[0.07] pointer-events-none" />

            <div
              key={card.id}
              className={`deck-enter relative rounded-3xl overflow-hidden border ${card.cardBorder} ${card.cardBg} border-l-4 ${
                direction === 1 ? 'deck-from-right' : 'deck-from-left'
              }`}
              style={{ ['--deck-accent' as string]: card.accentText }}
            >
              <div
                className={`w-full ${card.headBg} border-b ${card.headBorder} px-6 sm:px-8 py-4 flex items-center justify-between text-white select-none`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`text-stat-counter font-stat-counter text-xl sm:text-2xl font-black tracking-tight ${card.accentText}`}
                    style={{ fontFamily: 'Anton, "Bebas Neue", sans-serif' }}
                  >
                    {card.index} //
                  </span>
                  <span className="text-xs sm:text-sm font-mono-metric font-extrabold uppercase tracking-wider text-slate-200 truncate">
                    {card.barTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`hidden sm:inline px-2.5 py-0.5 rounded-full text-[11px] font-mono-metric font-bold ${card.accentBg} ${card.accentText} border ${card.accentBorder} uppercase tracking-widest`}
                  >
                    {card.badge}
                  </span>
                  <span className={`material-symbols-outlined text-[20px] ${card.accentText}`}>
                    {card.badgeIcon}
                  </span>
                </div>
              </div>

              <div className={`p-6 sm:p-10 bg-gradient-to-b ${card.bodyFrom} ${card.bodyTo} backdrop-blur-xl`}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-5">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono-metric ${card.accentBg} border ${card.accentBorder} ${card.accentText}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                      <span>{card.pill}</span>
                    </div>
                    <h3
                      className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight"
                      style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                    >
                      {card.heading}
                    </h3>
                    <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed">
                      {card.description}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {card.stats.map((v, si) => (
                        <div key={si} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <div className="text-[10px] font-mono-metric text-text-tertiary uppercase">
                            {STAT_LABELS[si][active]}
                          </div>
                          <div className={`text-base sm:text-lg font-bold font-mono-metric ${si === 0 ? card.accentText : 'text-text-primary'}`}>
                            {v}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-5 flex flex-col items-center justify-center">
                    <div className={`w-full rounded-2xl bg-slate-950/80 border ${card.accentBorder} p-5 relative overflow-hidden shadow-xl`}>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                        <span className={`text-[11px] font-mono-metric ${card.accentText}`}>{card.certNo}</span>
                        <span className="text-[11px] font-mono-metric text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          {card.certStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`w-14 h-14 rounded-2xl ${card.accentSoftBg} border ${card.accentBorder} flex items-center justify-center ${card.accentText} shrink-0 shadow-lg`}
                        >
                          <span className="material-symbols-outlined text-[32px]">{card.certIcon}</span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white uppercase tracking-wider">{card.certTitle}</div>
                          <div className="text-xs text-text-tertiary font-mono-metric">{card.certSub}</div>
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                        {card.quote}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom deck controls */}
            <div className="mt-4 flex items-center justify-between gap-3 px-1">
              <span className="text-[11px] font-mono-metric text-text-tertiary uppercase tracking-widest">
                ● Card {active + 1} of {DECK.length} • {card.badge}
              </span>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 mr-1">
                  {DECK.map((d, i) => (
                    <button
                      key={d.id}
                      aria-label={`Go to card ${i + 1}`}
                      onClick={() => goTo(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        i === active ? `w-6 ${card.accentBg} border ${card.accentBorder}` : 'w-1.5 bg-white/15 hover:bg-white/30'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={prev}
                  aria-label="Previous honor"
                  className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.04] text-white flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button
                  onClick={next}
                  aria-label="Next honor"
                  className={`h-9 px-4 rounded-full border ${card.accentBorder} ${card.accentBg} ${card.accentText} flex items-center gap-1.5 text-[12px] font-bold hover:brightness-125 transition-all cursor-pointer`}
                >
                  <span className="hidden sm:inline">Cycle deck</span>
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
      )}
    </section>
  )
}
