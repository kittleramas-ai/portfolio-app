import { Reveal } from './Reveal'

export function KeynotesSection() {
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
                public
              </span>
              <span className="min-w-0">
                Global Vision <span className="opacity-50 mx-1">//</span> Motivational
                Sessions &amp; Professional Interactions
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
            KNOWLEDGE SHARING &amp; GLOBAL EXPOSURE
          </h2>
        </div>
        <div className="flex flex-col md:items-end gap-3 max-w-md">
          <p className="text-mono-metric font-mono-metric text-text-tertiary text-xs md:text-right">
            A passionate traveller and lifelong learner — Dr. Surendiran believes
            global exposure creates new perspectives and shares knowledge through
            motivational sessions and professional interactions.
          </p>
          <a
            className="relative z-10 inline-flex w-fit max-w-full items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full text-label-badge font-label-badge bg-text-primary text-obsidian-base no-underline font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-md"
            href="#advisory"
          >
            <span>Invite for Motivational Session</span>
            <span className="material-symbols-outlined text-[16px]">
              campaign
            </span>
          </a>
        </div>
      </div>
      </Reveal>

      <Reveal delay={100}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Keynote 01 */}
        <div className="executive-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="card-head-row border-slate-border">
              <span className="badge-pill text-[11px] font-mono-metric bg-indigo-500/10 border-indigo-400/25 text-[#5B21B6] dark:text-indigo-300 tracking-wider">
                MOTIVATIONAL SESSIONS
              </span>
              <span className="card-head-meta text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                Students &amp; Professionals
              </span>
            </div>
            <h3
              className="text-xl font-bold text-text-primary mb-3 leading-snug"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              “From Farmer Family to Founder — Continuous Learning &amp; Innovation”
            </h3>
            <div className="text-mono-metric font-mono-metric text-[#5B21B6] dark:text-indigo-300 text-[13px] font-semibold mb-4">
              Founder Journey &amp; Education Motivation
            </div>
            <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
              Sharing his journey from humble beginnings through education,
              dedication and entrepreneurship — motivating students, researchers
              and aspiring founders to create opportunities through learning.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-border flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-text-tertiary">
            <span className="flex items-center gap-1.5 text-text-primary font-semibold">
              <span className="material-symbols-outlined text-[16px] text-accent-gold">
                groups
              </span>{' '}
              Learning &amp; Inspiration
            </span>
            <span className="text-[#5B21B6] dark:text-indigo-300 font-semibold">Founder Story</span>
          </div>
        </div>

        {/* Keynote 02 */}
        <div className="executive-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="card-head-row border-slate-border">
              <span className="badge-pill text-[11px] font-mono-metric bg-amber-500/10 border-amber-500/20 text-accent-gold tracking-wider">
                PROFESSIONAL INTERACTIONS
              </span>
              <span className="card-head-meta text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                BNI • Rotary • Business Forums
              </span>
            </div>
            <h3
              className="text-xl font-bold text-text-primary mb-3 leading-snug"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              “Building Businesses, Research Networks &amp; Community Collaboration”
            </h3>
            <div className="text-mono-metric font-mono-metric text-accent-gold text-[13px] font-semibold mb-4">
              BNI Member since 2022 • Rotary Member since 2024
            </div>
            <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
              Active in business and professional communities — supporting
              entrepreneur relationships, collaboration and community contribution
              through BNI and Rotary networks.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-border flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-text-tertiary">
            <span className="flex items-center gap-1.5 text-text-primary font-semibold">
              <span className="material-symbols-outlined text-[16px] text-accent-gold">
                military_tech
              </span>{' '}
              BNI 2022 • Rotary 2024
            </span>
            <span className="text-accent-gold">Community Networks</span>
          </div>
        </div>

        {/* Keynote 03 */}
        <div className="executive-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="card-head-row border-slate-border">
              <span className="badge-pill text-[11px] font-mono-metric bg-cyan-500/10 border-cyan-400/25 text-[#075985] dark:text-cyan-400 tracking-wider">
                GLOBAL TRAVEL
              </span>
              <span className="card-head-meta text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                National &amp; International
              </span>
            </div>
            <h3
              className="text-xl font-bold text-text-primary mb-3 leading-snug"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              “Global Exposure Creates New Perspectives and Opportunities”
            </h3>
            <div className="text-mono-metric font-mono-metric text-[#075985] dark:text-cyan-300 text-[13px] font-semibold mb-4">
              Traveller &amp; Lifelong Learner
            </div>
            <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
              Travelled nationally and internationally — bringing global
              perspectives into technology businesses, research platforms and
              social initiatives for students and communities.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-border flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-text-tertiary">
            <span className="flex items-center gap-1.5 text-text-primary font-semibold">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">
                school
              </span>{' '}
              Lifelong Learning
            </span>
            <span className="text-[#075985] dark:text-cyan-300 font-semibold">Global Vision</span>
          </div>
        </div>
      </div>
      </Reveal>
      </div>
    </section>
  )
}
