import { CountUp } from './CountUp'
import { Reveal } from './Reveal'

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

export function VenturesSection() {
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
            BUSINESS VENTURES • 2022 — PRESENT
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
            Technology Businesses, Research Platforms &amp; Social Impact
          </h2>
        </div>
        <p className="text-mono-metric font-mono-metric text-text-tertiary max-w-md">
          Founded and led by Dr. R. Surendiran — from academic research into
          entrepreneurship, creating opportunities for businesses, researchers,
          students and communities.
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
          {/* CARD 01: INFODAZZ */}
          <div className="executive-card h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-l-4 border-l-cyan-400 relative lg:-rotate-1 min-w-0">
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-slate-border">
                <span
                  className="text-stat-counter font-stat-counter text-text-primary tracking-tighter shrink-0"
                  style={{
                    fontFamily: 'Anton, "Bebas Neue", sans-serif',
                    fontSize: '64px',
                    lineHeight: '0.9',
                  }}
                >
                  01
                </span>
                <div className="flex flex-col items-end gap-1 min-w-0">
                  <span
                    className="badge-pill text-[11px] font-mono-metric bg-cyan-500/10 border-cyan-400/20 text-cyan-400 tracking-wider text-center leading-snug"
                    style={{ whiteSpace: 'normal' }}
                  >
                    FLAGSHIP TECH
                  </span>
                  <span className="text-mono-metric font-mono-metric text-text-tertiary text-[11px] text-right">
                    Estd 2022 • Trichy HQ
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
                  Infodazz
                </h3>
                <div className="text-mono-metric font-mono-metric text-primary text-[13px] font-semibold">
                  Founder &amp; CEO
                </div>
              </div>

              <p
                className={`flex-1 text-[14px] font-body-sm text-text-secondary leading-relaxed mb-6 ${BLURB_H} break-words`}
              >
                Established in 2022 to help businesses grow through technology and digital
                transformation.
              </p>

              <ul
                className={`grid grid-cols-2 gap-x-4 gap-y-1.5 text-mono-metric font-mono-metric text-[12px] leading-relaxed text-text-secondary mb-6 break-words ${SERVICES_H}`}
              >
                <li>• ERP Solutions • SaaS Platforms</li>
                <li>• Web &amp; Mobile Applications</li>
                <li>• IT Solutions • Digital Marketing</li>
                <li>• Graphic Design • Animation &amp; VFX</li>
              </ul>

              <div className={`flex-1 grid auto-rows-min grid-cols-2 gap-2.5 mb-6 ${CHIPS_H}`}>
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border min-w-0">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Team
                  </div>
                  <div className="text-[13px] font-body-sm font-bold text-text-primary leading-snug break-words">
                    <CountUp target={50} suffix="+" /> Professionals
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border min-w-0">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Presence
                  </div>
                  <div className="text-[13px] font-body-sm font-bold text-text-primary leading-snug break-words">
                    4 Locations
                  </div>
                </div>
              </div>
            </div>

            <a
              className="inline-flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl bg-sky-800/10 border border-sky-800/25 text-[#075985] dark:bg-cyan-500/10 dark:border-cyan-400/20 dark:text-cyan-300 hover:bg-sky-800/20 dark:hover:bg-cyan-500/20 transition-all font-mono-metric text-mono-metric font-semibold group min-w-0"
              href="https://infodazz.org"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="min-w-0 flex-1 truncate">infodazz.org</span>
              <span className="material-symbols-outlined text-[18px] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                arrow_outward
              </span>
            </a>
          </div>

          {/* CARD 02: KITTLE PVT LTD */}
          <div
            className="executive-card h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-l-4 border-l-amber-500 relative lg:rotate-1 min-w-0"
            id="kittle"
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-slate-border">
                <span
                  className="text-stat-counter font-stat-counter text-accent-gold tracking-tighter shrink-0"
                  style={{
                    fontFamily: 'Anton, "Bebas Neue", sans-serif',
                    fontSize: '64px',
                    lineHeight: '0.9',
                  }}
                >
                  02
                </span>
                <div className="flex flex-col items-end gap-1 min-w-0">
                  <span
                    className="badge-pill text-[11px] font-mono-metric bg-accent-gold/10 border-accent-gold/20 text-accent-gold tracking-wider text-center leading-snug"
                    style={{ whiteSpace: 'normal' }}
                  >
                    TECH INNOVATION
                  </span>
                  <span className="text-mono-metric font-mono-metric text-text-tertiary text-[11px] text-right">
                    Trichy Based
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
                  Kittle Pvt Ltd
                </h3>
                <div className="text-mono-metric font-mono-metric text-accent-gold text-[13px] font-semibold">
                  Founder / Owner
                </div>
              </div>

              <p
                className={`flex-1 text-[14px] font-body-sm text-text-secondary leading-relaxed mb-6 ${BLURB_H} break-words`}
              >
                Based in Trichy, focused on IT solutions and technology
                innovation — software solutions and digital platforms for
                business growth.
              </p>

              <ul
                className={`grid grid-cols-2 gap-x-4 gap-y-1.5 text-mono-metric font-mono-metric text-[12px] leading-relaxed text-text-secondary mb-6 break-words ${SERVICES_H}`}
              >
                <li>• Software Solutions</li>
                <li>• IT Services &amp; Support</li>
                <li>• Digital Platforms</li>
                <li>• Technology Consulting</li>
              </ul>

              <div className={`flex-1 grid auto-rows-min grid-cols-2 gap-2.5 mb-6 ${CHIPS_H}`}>
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border min-w-0">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Base
                  </div>
                  <div className="text-[13px] font-body-sm font-bold text-text-primary leading-snug break-words">
                    Trichy, Tamil Nadu
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border min-w-0">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Focus
                  </div>
                  <div className="text-[13px] font-body-sm font-bold text-text-primary leading-snug break-words">
                    Technology Innovation
                  </div>
                </div>
              </div>
            </div>

            <a
              className="inline-flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl bg-accent-gold/10 border border-accent-gold/25 text-[#8C6D1F] dark:text-accent-gold hover:bg-accent-gold/20 transition-all font-mono-metric text-mono-metric font-semibold group min-w-0"
              href="https://kittle.ltd/"
              rel="noopener noreferrer"
              target="_blank"
              title="kittle.ltd"
            >
              <span className="min-w-0 flex-1 truncate">kittle.ltd</span>
              <span className="material-symbols-outlined text-[18px] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                arrow_outward
              </span>
            </a>
          </div>

          {/* CARD 03: SEVENTH SENSE RESEARCH GROUP */}
          <div className="executive-card h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-l-4 border-l-indigo-400 relative lg:-rotate-1 min-w-0">
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-slate-border">
                <span
                  className="text-stat-counter font-stat-counter text-indigo-400 tracking-tighter shrink-0"
                  style={{
                    fontFamily: 'Anton, "Bebas Neue", sans-serif',
                    fontSize: '64px',
                    lineHeight: '0.9',
                  }}
                >
                  03
                </span>
                <div className="flex flex-col items-end gap-1 min-w-0">
                  <span
                    className="badge-pill text-[11px] font-mono-metric bg-indigo-500/10 border-indigo-400/20 text-indigo-300 tracking-wider text-center leading-snug"
                    style={{ whiteSpace: 'normal' }}
                  >
                    RESEARCH
                  </span>
                  <span className="text-mono-metric font-mono-metric text-text-tertiary text-[11px] text-right">
                    International Platform
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
                  Seventh Sense Research Group
                </h3>
                <div className="text-mono-metric font-mono-metric text-indigo-300 text-[13px] font-semibold">
                  Founder / Owner
                </div>
              </div>

              <p
                className={`flex-1 text-[14px] font-body-sm text-text-secondary leading-relaxed mb-6 ${BLURB_H} break-words`}
              >
                International research publishing platform supporting researchers
                and academicians through publication and academic collaboration.
              </p>

              <ul
                className={`grid grid-cols-2 gap-x-4 gap-y-1.5 text-mono-metric font-mono-metric text-[12px] leading-relaxed text-text-secondary mb-6 break-words ${SERVICES_H}`}
              >
                <li>• Research Publishing</li>
                <li>• Peer Review &amp; Editing</li>
                <li>• Scopus Indexing Support</li>
                <li>• Academic Collaboration</li>
              </ul>

              <div className={`flex-1 grid auto-rows-min grid-cols-2 gap-2.5 mb-6 ${CHIPS_H}`}>
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border min-w-0">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Journals
                  </div>
                  <div className="text-[13px] font-body-sm font-bold text-indigo-300 leading-snug break-words">
                    <CountUp target={30} suffix="+" /> International
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border min-w-0">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Scopus Indexed
                  </div>
                  <div className="text-[13px] font-body-sm font-bold text-text-primary leading-snug break-words">
                    <CountUp target={5} suffix="+" /> Journals
                  </div>
                </div>
              </div>
            </div>

            <a
              className="inline-flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl bg-violet-800/10 border border-violet-800/25 text-[#5B21B6] dark:bg-indigo-500/10 dark:border-indigo-400/20 dark:text-indigo-300 hover:bg-violet-800/20 dark:hover:bg-indigo-500/20 transition-all font-mono-metric text-mono-metric font-semibold group min-w-0"
              href="https://internationaljournalssrg.org"
              rel="noopener noreferrer"
              target="_blank"
              title="internationaljournalssrg.org"
            >
              <span className="min-w-0 flex-1 truncate">
                internationaljournalssrg.org
              </span>
              <span className="material-symbols-outlined text-[18px] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                arrow_outward
              </span>
            </a>
          </div>

          {/* CARD 04: KASTER TRUST */}
          <div className="executive-card h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-l-4 border-l-emerald-500 relative lg:rotate-1 min-w-0">
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-slate-border">
                <span
                  className="text-stat-counter font-stat-counter text-emerald-400 tracking-tighter shrink-0"
                  style={{
                    fontFamily: 'Anton, "Bebas Neue", sans-serif',
                    fontSize: '64px',
                    lineHeight: '0.9',
                  }}
                >
                  04
                </span>
                <div className="flex flex-col items-end gap-1 min-w-0">
                  <span
                    className="badge-pill text-[11px] font-mono-metric bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tracking-wider text-center leading-snug"
                    style={{ whiteSpace: 'normal' }}
                  >
                    SOCIAL IMPACT
                  </span>
                  <span className="text-mono-metric font-mono-metric text-text-tertiary text-[11px] text-right">
                    Education Support
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
                  Kaster Trust
                </h3>
                <div className="text-mono-metric font-mono-metric text-emerald-400 text-[13px] font-semibold">
                  Founder / Trustee
                </div>
              </div>

              <p
                className={`flex-1 text-[14px] font-body-sm text-text-secondary leading-relaxed mb-6 ${BLURB_H} break-words`}
              >
                Supporting education for students from economically disadvantaged
                backgrounds — reducing financial barriers so deserving students
                can continue.
              </p>

              <ul
                className={`grid grid-cols-2 gap-x-4 gap-y-1.5 text-mono-metric font-mono-metric text-[12px] leading-relaxed text-text-secondary mb-6 break-words ${SERVICES_H}`}
              >
                <li>• Fee Payment Assistance</li>
                <li>• Scholarship Guidance</li>
                <li>• Learning Material Access</li>
                <li>• Student Mentoring</li>
              </ul>

              <div className={`flex-1 grid auto-rows-min grid-cols-2 gap-2.5 mb-6 ${CHIPS_H}`}>
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border min-w-0">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Mission
                  </div>
                  <div className="text-[13px] font-body-sm font-bold text-text-primary leading-snug break-words">
                    Reduce financial barriers
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border min-w-0">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Focus
                  </div>
                  <div className="text-[13px] font-body-sm font-bold text-text-primary leading-snug break-words">
                    Student Growth
                  </div>
                </div>
              </div>
            </div>

            <a
              className="inline-flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl bg-emerald-700/10 border border-emerald-700/25 text-[#047857] dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300 hover:bg-emerald-700/20 dark:hover:bg-emerald-500/20 transition-all font-mono-metric text-mono-metric font-semibold group min-w-0"
              href="#advisory"
            >
              <span className="min-w-0 flex-1 truncate">
                Support Student Education
              </span>
              <span className="material-symbols-outlined text-[18px] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                volunteer_activism
              </span>
            </a>
          </div>
        </div>
      </div>
      </Reveal>
      </div>
    </section>
  )
}