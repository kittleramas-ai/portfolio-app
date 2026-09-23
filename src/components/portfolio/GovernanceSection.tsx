import { Reveal } from './Reveal'

export function GovernanceSection() {
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
            <span className="px-2.5 py-1 rounded-full text-label-badge font-label-badge bg-primary/10 border border-primary/30 text-primary uppercase tracking-widest">
              CORPORATE GOVERNANCE // FIDUCIARY &amp; ADVISORY ROLES
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
            EXECUTIVE ADVISORY &amp; BOARD GOVERNANCE
          </h2>
        </div>
        <p className="text-mono-metric font-mono-metric text-text-tertiary max-w-md">
          Guiding growth-stage enterprises, industry bodies, and academic
          institutions through architectural modernization, scaling bottlenecks,
          and executive governance.
        </p>
      </div>
      </Reveal>

      <Reveal delay={100}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Role 01 */}
        <div className="executive-card rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 mb-6 shadow-md">
              <span className="material-symbols-outlined text-[26px]">memory</span>
            </div>
            <div className="text-mono-metric font-mono-metric text-cyan-400 text-[12px] uppercase tracking-wider mb-2 font-semibold">
              ROLE 01 // ENTERPRISE ARCHITECTURE
            </div>
            <h3
              className="text-2xl font-bold text-white mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Enterprise Technology Board Advisor
            </h3>
            <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
              Guiding industrial ERP migrations, zero-latency cloud redundancy,
              and technical debt elimination for domestic enterprise accounts and
              manufacturing conglomerates.
            </p>
            <ul className="space-y-2 text-mono-metric font-mono-metric text-[12px] text-text-tertiary mb-6">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>Hybrid
                Cloud &amp; High-Availability Strategy
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Microservices Orchestration Audits
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>CTO
                &amp; VP Engineering Advisory
              </li>
            </ul>
          </div>
          <div className="pt-4 border-t border-slate-800">
            <span className="text-[11px] font-mono-metric text-text-secondary uppercase tracking-widest">
              Entity: Infodazz Strategic Mandates
            </span>
          </div>
        </div>

        {/* Role 02 */}
        <div className="executive-card rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center text-accent-gold mb-6 shadow-md">
              <span className="material-symbols-outlined text-[26px]">
                account_tree
              </span>
            </div>
            <div className="text-mono-metric font-mono-metric text-accent-gold text-[12px] uppercase tracking-wider mb-2 font-semibold">
              ROLE 02 // REGIONAL EXPANSION
            </div>
            <h3
              className="text-2xl font-bold text-white mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Regional Economic Policy &amp; MSME Growth Mentor
            </h3>
            <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
              Fostering SME scaling pathways, export corridor facilitation, and
              commercial cluster resilience across Tamil Nadu &amp; South India
              business ecosystems.
            </p>
            <ul className="space-y-2 text-mono-metric font-mono-metric text-[12px] text-text-tertiary mb-6">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold"></span>
                500+ Regional Founders Mentored
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold"></span>
                Trade Conclave &amp; Summit Curation
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold"></span>
                Cross-Chapter Strategic Referrals
              </li>
            </ul>
          </div>
          <div className="pt-4 border-t border-slate-800">
            <span className="text-[11px] font-mono-metric text-text-secondary uppercase tracking-widest">
              Entity: BNI Madurai Executive Board
            </span>
          </div>
        </div>

        {/* Role 03 */}
        <div className="executive-card rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 shadow-md">
              <span className="material-symbols-outlined text-[26px]">school</span>
            </div>
            <div className="text-mono-metric font-mono-metric text-emerald-400 text-[12px] uppercase tracking-wider mb-2 font-semibold">
              ROLE 03 // ACADEMIC GOVERNANCE
            </div>
            <h3
              className="text-2xl font-bold text-white mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Academic Senate &amp; Research Advisory Committee
            </h3>
            <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
              Directing curriculum modernization, peer-review publishing
              standards, and distributed systems PhD research grant frameworks
              with international reach.
            </p>
            <ul className="space-y-2 text-mono-metric font-mono-metric text-[12px] text-text-tertiary mb-6">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Double-Blind Editorial Oversight
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                10,000+ Works Indexed Worldwide
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                University Research Partnerships
              </li>
            </ul>
          </div>
          <div className="pt-4 border-t border-slate-800">
            <span className="text-[11px] font-mono-metric text-text-secondary uppercase tracking-widest">
              Entity: SSRG Research Group Senate
            </span>
          </div>
        </div>
      </div>
      </Reveal>
      </div>
    </section>
  )
}
