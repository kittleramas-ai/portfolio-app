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
            <span className="inline-block max-w-full px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-label-badge font-label-badge bg-primary/10 border border-primary/30 text-primary uppercase tracking-wider sm:tracking-widest leading-relaxed break-words whitespace-normal text-center sm:text-left">
              LEADERSHIP &amp; NETWORK // FOUNDER ROLES
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
            FOUNDER LEADERSHIP &amp; COMMUNITY ROLES
          </h2>
        </div>
        <p className="text-mono-metric font-mono-metric text-text-tertiary max-w-md">
          Leading technology companies, research publishing platforms and social
          initiatives — combined with BNI and Rotary community leadership and
          academic mentoring.
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
              ROLE 01 // TECHNOLOGY BUSINESSES
            </div>
            <h3
              className="text-2xl font-bold text-text-primary mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Founder &amp; CEO — Infodazz • Founder — Kittle
            </h3>
            <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
              Building technology companies and digital ecosystems — Infodazz
              (Estd 2022, Trichy HQ, Madurai / Karaikudi / Kumbakonam, 50+
              professionals) and Kittle Pvt Ltd (Trichy, IT solutions &amp;
              consulting).
            </p>
            <ul className="space-y-2 text-mono-metric font-mono-metric text-[12px] text-text-tertiary mb-6">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>ERP •
                SaaS • Web &amp; Mobile Apps
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Digital Marketing • SEO • Design • VFX
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>Software
                Solutions • Technology Consulting
              </li>
            </ul>
          </div>
          <div className="pt-4 border-t border-slate-border">
            <span className="text-[11px] font-mono-metric text-text-secondary uppercase tracking-widest">
              Entities: Infodazz • Kittle Pvt Ltd
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
              ROLE 02 // RESEARCH &amp; EDUCATION
            </div>
            <h3
              className="text-2xl font-bold text-text-primary mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Founder — Seventh Sense Research Group
            </h3>
            <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
              Supporting research, education and innovation — 30+ International
              Journals including 5+ Scopus Indexed, plus research publications,
              patents, academic mentoring and research guidance.
            </p>
            <ul className="space-y-2 text-mono-metric font-mono-metric text-[12px] text-text-tertiary mb-6">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold"></span>
                Ph.D — Madurai Kamaraj University
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold"></span>
                MCA — Thiagarajar School of Management
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold"></span>
                B.Sc Mathematics — GAC Kumbakonam
              </li>
            </ul>
          </div>
          <div className="pt-4 border-t border-slate-border">
            <span className="text-[11px] font-mono-metric text-text-secondary uppercase tracking-widest">
              Entity: Seventh Sense Research Group
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
              ROLE 03 // SOCIAL IMPACT &amp; NETWORKS
            </div>
            <h3
              className="text-2xl font-bold text-text-primary mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Founder / Trustee — Kaster Trust
            </h3>
            <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
              Helping students overcome educational barriers — fee support,
              learning opportunities and student growth. BNI Member since 2022,
              Rotary Member since 2024.
            </p>
            <ul className="space-y-2 text-mono-metric font-mono-metric text-[12px] text-text-tertiary mb-6">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Educational fee support
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                BNI since 2022 • Rotary since 2024
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Motivational sessions • Global travel
              </li>
            </ul>
          </div>
          <div className="pt-4 border-t border-slate-border">
            <span className="text-[11px] font-mono-metric text-text-secondary uppercase tracking-widest">
              Entities: Kaster Trust • BNI • Rotary
            </span>
          </div>
        </div>
      </div>
      </Reveal>
      </div>
    </section>
  )
}
