import { Reveal } from './Reveal'

export function PerspectivesSection() {
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
            <span className="px-2.5 py-1 rounded-full text-label-badge font-label-badge bg-primary/10 border border-primary/30 text-primary uppercase tracking-widest">
              RESEARCH &amp; ESSAYS // SCHOLARLY &amp; INDUSTRY MONOGRAPHS
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
            EXECUTIVE PERSPECTIVES &amp; PUBLICATIONS
          </h2>
        </div>
        <p className="text-mono-metric font-mono-metric text-text-tertiary max-w-md">
          Distilling decades of hands-on software architecture and regional
          leadership into high-impact research papers, policy memos, and industry
          commentary.
        </p>
      </div>
      </Reveal>

      <Reveal delay={100}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Article 01 */}
        <article className="executive-card rounded-3xl p-8 flex flex-col justify-between group">
          <div>
            <div className="card-head-row border-slate-800">
              <span className="badge-pill text-[11px] font-mono-metric bg-cyan-500/10 border-cyan-400/20 text-cyan-400 tracking-wider">
                TECHNICAL MONOGRAPH
              </span>
              <span className="card-head-meta text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                Infodazz Research
              </span>
            </div>
            <h3
              className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors leading-snug"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              “The Resilient Enterprise: Why Multi-Cloud Fault Tolerance is an
              Economic Imperative, Not an IT Feature”
            </h3>
            <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
              An executive case study into downtime systemic shocks, multi-region
              redundancy paradigms, and calculating business downtime risk for
              industrial supply-chain backbones.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-mono-metric font-mono-metric text-[12px]">
            <span className="text-text-tertiary">Read Essay</span>
            <span className="material-symbols-outlined text-[18px] text-cyan-400 group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
        </article>

        {/* Article 02 */}
        <article className="executive-card rounded-3xl p-8 flex flex-col justify-between group">
          <div>
            <div className="card-head-row border-slate-800">
              <span className="badge-pill text-[11px] font-mono-metric bg-amber-500/10 border-amber-500/20 text-accent-gold tracking-wider">
                POLICY &amp; COMMERCE
              </span>
              <span className="card-head-meta text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                Regional Business Review
              </span>
            </div>
            <h3
              className="text-xl font-bold text-white mb-3 group-hover:text-accent-gold transition-colors leading-snug"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              “Grassroots Capitalism: How High-Trust Referral Architectures Beat
              Algorithmic Marketplaces in Tier-2 Hubs”
            </h3>
            <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
              Examining empirical outcomes from ₹120+ Crore in localized
              transactions, demonstrating that human accountability networks
              outperform pure algorithmic intermediaries.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-mono-metric font-mono-metric text-[12px]">
            <span className="text-text-tertiary">Executive Memo</span>
            <span className="material-symbols-outlined text-[18px] text-accent-gold group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
        </article>

        {/* Article 03 */}
        <article className="executive-card rounded-3xl p-8 flex flex-col justify-between group">
          <div>
            <div className="card-head-row border-slate-800">
              <span className="badge-pill text-[11px] font-mono-metric bg-emerald-500/10 border-emerald-500/20 text-emerald-400 tracking-wider">
                PEER REVIEWED
              </span>
              <span className="card-head-meta text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                SSRG Int'l Journals
              </span>
            </div>
            <h3
              className="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors leading-snug"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              “A Survey on Distributed Consensus Protocols in Heterogeneous Edge
              Computing”
            </h3>
            <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
              Doctoral analysis examining consensus latency tradeoffs, Byzantine
              fault tolerance, and node synchronization across geographically
              dispersed IoT edge systems.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-mono-metric font-mono-metric text-[12px]">
            <span className="text-text-tertiary">Double-Blind Peer Reviewed</span>
            <span className="material-symbols-outlined text-[18px] text-emerald-400 group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
        </article>
      </div>
      </Reveal>
      </div>
    </section>
  )
}
