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
            <span className="inline-block max-w-full px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-label-badge font-label-badge bg-primary/10 border border-primary/30 text-primary uppercase tracking-wider sm:tracking-widest leading-relaxed break-words whitespace-normal text-center sm:text-left">
              BEYOND BUSINESS // ENTREPRENEURSHIP • KNOWLEDGE • SOCIAL IMPACT
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
            BEYOND BUSINESS — THREE COMMITMENTS
          </h2>
        </div>
        <p className="text-mono-metric font-mono-metric text-text-tertiary max-w-md">
          Entrepreneurship, Knowledge and Social Impact — building technology
          companies, supporting research &amp; education, and helping students
          overcome barriers.
        </p>
      </div>
      </Reveal>

      <Reveal delay={100}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Article 01 */}
        <article className="executive-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between group">
          <div>
            <div className="card-head-row border-slate-border">
              <span className="badge-pill text-[11px] font-mono-metric bg-cyan-500/10 border-cyan-400/20 text-cyan-400 tracking-wider">
                ENTREPRENEURSHIP
              </span>
              <span className="card-head-meta text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                Infodazz • Kittle
              </span>
            </div>
            <h3
              className="text-xl font-bold text-text-primary mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors leading-snug"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              “Building Technology Companies and Digital Ecosystems”
            </h3>
            <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
              From academic research into entrepreneurship — Infodazz (Estd 2022,
              50+ professionals, 11 services) and Kittle Pvt Ltd helping
              businesses grow through technology, SaaS, ERP, Web/Mobile and
              digital transformation.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-border flex items-center justify-between text-mono-metric font-mono-metric text-[12px]">
            <span className="text-text-tertiary">Technology Businesses</span>
            <span className="material-symbols-outlined text-[18px] text-cyan-400 group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
        </article>

        {/* Article 02 */}
        <article className="executive-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between group">
          <div>
            <div className="card-head-row border-slate-border">
              <span className="badge-pill text-[11px] font-mono-metric bg-amber-500/10 border-amber-500/20 text-accent-gold tracking-wider">
                KNOWLEDGE
              </span>
              <span className="card-head-meta text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                Seventh Sense Research
              </span>
            </div>
            <h3
              className="text-xl font-bold text-text-primary mb-3 group-hover:text-accent-gold transition-colors leading-snug"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              “Supporting Research, Education and Innovation”
            </h3>
            <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
              Seventh Sense Research Group — 30+ International Journals, 5+
              Scopus Indexed, publication ecosystem and collaboration support,
              plus research publications, patents and academic mentoring.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-border flex items-center justify-between text-mono-metric font-mono-metric text-[12px]">
            <span className="text-text-tertiary">Research &amp; Education</span>
            <span className="material-symbols-outlined text-[18px] text-accent-gold group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
        </article>

        {/* Article 03 */}
        <article className="executive-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between group">
          <div>
            <div className="card-head-row border-slate-border">
              <span className="badge-pill text-[11px] font-mono-metric bg-emerald-500/10 border-emerald-500/20 text-emerald-400 tracking-wider">
                SOCIAL IMPACT
              </span>
              <span className="card-head-meta text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                Kaster Trust
              </span>
            </div>
            <h3
              className="text-xl font-bold text-text-primary mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors leading-snug"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              “Helping Students Overcome Educational Barriers”
            </h3>
            <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
              Kaster Trust helps deserving students continue education by
              supporting fees and reducing financial barriers — encouraging
              learning opportunities and student growth.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-border flex items-center justify-between text-mono-metric font-mono-metric text-[12px]">
            <span className="text-text-tertiary">Education Support</span>
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
