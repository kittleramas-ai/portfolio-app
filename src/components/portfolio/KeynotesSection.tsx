import { Reveal } from './Reveal'

export function KeynotesSection() {
  return (
    <section
      className="py-24 max-w-7xl mx-auto px-6 md:px-12 border-b border-slate-border relative section-hairline"
      id="keynotes"
      style={{ backgroundColor: '#000000' }}
    >
      <Reveal>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-slate-border gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full text-label-badge font-label-badge bg-primary/10 border border-primary/30 text-primary uppercase tracking-widest">
              EXECUTIVE ENGAGEMENTS // KEYNOTES &amp; CONCLAVES
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
            KEYNOTE ADDRESSES &amp; SUMMIT DIALOGUES
          </h2>
        </div>
        <div className="flex flex-col md:items-end gap-3 max-w-md">
          <p className="text-mono-metric font-mono-metric text-text-tertiary text-xs md:text-right">
            Delivering visionary perspectives on enterprise computing, grassroots
            economic clusters, and resilient technological architectures to global
            forums, industry summits, and academic convocations.
          </p>
          <a
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-label-badge font-label-badge bg-white text-obsidian-base font-bold uppercase tracking-wider hover:bg-slate-200 transition-all shadow-md"
            href="#advisory"
          >
            <span>Request Keynote Availability</span>
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
        <div className="executive-card rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono-metric font-semibold bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 uppercase tracking-wider">
                PLENARY KEYNOTE
              </span>
              <span className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                Chennai / South India
              </span>
            </div>
            <h3
              className="text-xl font-bold text-white mb-3 leading-snug"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              “Next-Decade Industrial Digitization: Scaling Tier-2 Tech Capitals
              into Domestic Corridors”
            </h3>
            <div className="text-mono-metric font-mono-metric text-indigo-300 text-[13px] font-semibold mb-4">
              Southern India Commerce &amp; IT Leadership Forum
            </div>
            <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
              Addressed over 800+ C-suite delegates, state policy makers, and
              industrial manufacturers on decentralizing enterprise compute from
              tier-1 capitals into emerging tier-2 clusters.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-text-tertiary">
            <span className="flex items-center gap-1.5 text-text-primary font-semibold">
              <span className="material-symbols-outlined text-[16px] text-accent-gold">
                groups
              </span>{' '}
              800+ C-Suite &amp; Govt
            </span>
            <span className="text-indigo-300">Industrial Cloud</span>
          </div>
        </div>

        {/* Keynote 02 */}
        <div className="executive-card rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono-metric font-semibold bg-amber-500/10 border border-amber-500/20 text-accent-gold uppercase tracking-wider">
                ECONOMIC CONCLAVE
              </span>
              <span className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                Tamil Nadu Region
              </span>
            </div>
            <h3
              className="text-xl font-bold text-white mb-3 leading-snug"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              “Ecosystem Synergy: How Structured Referral Networks Catalyze
              Regional GDP”
            </h3>
            <div className="text-mono-metric font-mono-metric text-accent-gold text-[13px] font-semibold mb-4">
              BNI Regional &amp; National Executive Conclave
            </div>
            <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
              Keynote delivered to 1,200+ founders showcasing empirical models
              where structured social capital and high-trust peer protocols
              directly accelerate transactional velocity.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-text-tertiary">
            <span className="flex items-center gap-1.5 text-text-primary font-semibold">
              <span className="material-symbols-outlined text-[16px] text-accent-gold">
                military_tech
              </span>{' '}
              1,200+ SME Founders
            </span>
            <span className="text-accent-gold">₹120Cr+ Facilitation</span>
          </div>
        </div>

        {/* Keynote 03 */}
        <div className="executive-card rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono-metric font-semibold bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 uppercase tracking-wider">
                GLOBAL SCIENTIFIC KEYNOTE
              </span>
              <span className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                Global Remote / Hybrid
              </span>
            </div>
            <h3
              className="text-xl font-bold text-white mb-3 leading-snug"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              “High-Throughput Distributed Architectures &amp; Resilient Cloud
              Infrastructures for Sovereign Scale”
            </h3>
            <div className="text-mono-metric font-mono-metric text-cyan-300 text-[13px] font-semibold mb-4">
              Intl Conf on Advanced Computing &amp; Distributed Systems
            </div>
            <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
              Synthesizing Ph.D. research in distributed fault tolerance into
              production paradigms for high-concurrency enterprise workloads and
              global cloud infrastructure resilience.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-text-tertiary">
            <span className="flex items-center gap-1.5 text-text-primary font-semibold">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">
                school
              </span>{' '}
              45+ Universities
            </span>
            <span className="text-cyan-300">SSRG Research Senate</span>
          </div>
        </div>
      </div>
      </Reveal>
    </section>
  )
}
