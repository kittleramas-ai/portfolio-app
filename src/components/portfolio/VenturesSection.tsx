import { CountUp } from './CountUp'
import { Reveal } from './Reveal'

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
            VENTURE PORTFOLIO • 2014 — PRESENT
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
            Institutional Leadership &amp; Operational Directorships
          </h2>
        </div>
        <p className="text-mono-metric font-mono-metric text-text-tertiary max-w-md">
          Active governance across enterprise technology engineering, regional
          commerce acceleration, and global scientific publications.
        </p>
      </div>
      </Reveal>

      {/* 3-Card Container with Linking SVG Connectors */}
      <Reveal delay={110}>
      <div className="relative w-full py-6 lg:py-12">
        {/* SVG Connection Arcs */}
        <svg
          className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible opacity-30"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 1200 680"
        >
          <path
            d="M 380 220 C 440 130, 410 70, 480 80 C 530 90, 470 210, 520 230 C 540 240, 570 240, 590 230"
            stroke="var(--portfolio-sky-400)"
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
          <circle cx="480" cy="80" fill="var(--portfolio-sky-400)" r="3" />
          <path
            d="M 780 260 C 850 180, 830 110, 890 120 C 940 130, 890 240, 940 260 C 960 270, 980 270, 1000 260"
            stroke="var(--portfolio-amber-500)"
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
          <circle cx="890" cy="120" fill="var(--portfolio-amber-500)" r="3" />
        </svg>

        {/* Grid of 3 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
          {/* CARD 01: Infodazz Technologies */}
          <div className="executive-card rounded-3xl p-6 sm:p-8 md:p-9 flex flex-col justify-between border-l-4 border-l-cyan-400 relative lg:-rotate-1">
            <div>
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-border">
                <span
                  className="text-stat-counter font-stat-counter text-text-primary tracking-tighter"
                  style={{
                    fontFamily: 'Anton, "Bebas Neue", sans-serif',
                    fontSize: '64px',
                    lineHeight: '0.9',
                  }}
                >
                  01
                </span>
                <div className="flex flex-col items-end gap-1">
                  <span className="badge-pill text-[11px] font-mono-metric bg-cyan-500/10 border-cyan-400/20 text-cyan-400 tracking-wider">
                    FLAGSHIP TECH
                  </span>
                  <span className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    2014 — Present • 11 Yrs
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h3
                  className="text-headline-md font-headline-md text-text-primary mb-1"
                  style={{
                    fontFamily: 'Anton, "Bebas Neue", sans-serif',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    fontSize: '26px',
                  }}
                >
                  Infodazz Technologies
                </h3>
                <div className="text-mono-metric font-mono-metric text-primary text-[13px] font-semibold">
                  Founder &amp; Chief Executive Officer
                </div>
              </div>

              <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
                Enterprise digital engineering and cloud consultancy. Delivers
                zero-latency microservices, custom industrial ERPs, and
                high-throughput AI automation roadmaps for regional enterprises and
                domestic industrial clients across India.
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-6">
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Deployments
                  </div>
                  <div className="text-body-sm font-bold text-text-primary">
                    <CountUp target={100} suffix="+" /> Enterprise
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Architecture
                  </div>
                  <div className="text-body-sm font-bold text-text-primary">
                    Hybrid &amp; AI Cloud
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Clientele
                  </div>
                  <div className="text-body-sm font-bold text-text-primary">
                    Mid-Market &amp; Enterprise
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Footprint
                  </div>
                  <div className="text-body-sm font-bold text-text-primary">
                    Tamil Nadu &amp; South
                  </div>
                </div>
              </div>
            </div>

            <a
              className="inline-flex items-center justify-between w-full px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 hover:bg-cyan-500/20 transition-all font-mono-metric text-mono-metric group"
              href="https://infodazz.org"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span>infodazz.org</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                arrow_outward
              </span>
            </a>
          </div>

          {/* CARD 02: BNI Madurai */}
          <div
            className="executive-card rounded-3xl p-6 sm:p-8 md:p-9 flex flex-col justify-between border-l-4 border-l-amber-500 relative lg:rotate-1 lg:-mt-2"
            id="bni"
          >
            <div>
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-border">
                <span
                  className="text-stat-counter font-stat-counter text-accent-gold tracking-tighter"
                  style={{
                    fontFamily: 'Anton, "Bebas Neue", sans-serif',
                    fontSize: '64px',
                    lineHeight: '0.9',
                  }}
                >
                  02
                </span>
                <div className="flex flex-col items-end gap-1">
                  <span className="badge-pill text-[11px] font-mono-metric bg-accent-gold/10 border-accent-gold/20 text-accent-gold tracking-wider">
                    REGIONAL NETWORK
                  </span>
                  <span className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Executive Leadership
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h3
                  className="text-headline-md font-headline-md text-text-primary mb-1"
                  style={{
                    fontFamily: 'Anton, "Bebas Neue", sans-serif',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    fontSize: '26px',
                  }}
                >
                  BNI Madurai
                </h3>
                <div className="text-mono-metric font-mono-metric text-accent-gold text-[13px] font-semibold">
                  Senior Leadership &amp; Regional Growth Architect
                </div>
              </div>

              <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
                Key force in BNI Madurai regional executive infrastructure.
                Spearheading structured referral frameworks, organizing landmark
                trade conclaves, and scaling tier-2 city entrepreneurs to achieve
                national and global market penetration.
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-6">
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Facilitated Value
                  </div>
                  <div className="text-body-sm font-bold text-accent-gold">
                    ₹<CountUp target={120} suffix="+" /> Crores
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Mentored Scope
                  </div>
                  <div className="text-body-sm font-bold text-text-primary">
                    <CountUp target={500} suffix="+" /> Founders
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Trade Conclaves
                  </div>
                  <div className="text-body-sm font-bold text-text-primary">
                    <CountUp target={12} suffix="+" /> Major Summits
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Honor Standing
                  </div>
                  <div className="text-body-sm font-bold text-text-primary">
                    Gold Club Member
                  </div>
                </div>
              </div>
            </div>

            <a
              className="inline-flex items-center justify-between w-full px-4 py-3 rounded-xl bg-accent-gold/10 border border-accent-gold/20 text-accent-gold hover:bg-accent-gold/20 transition-all font-mono-metric text-mono-metric group"
              href="#advisory"
            >
              <span>BNI Executive Inquiries</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                groups
              </span>
            </a>
          </div>

          {/* CARD 03: SSRG International Journals */}
          <div className="executive-card rounded-3xl p-6 sm:p-8 md:p-9 flex flex-col justify-between border-l-4 border-l-indigo-400 relative lg:rotate-1">
            <div>
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-border">
                <span
                  className="text-stat-counter font-stat-counter text-indigo-400 tracking-tighter"
                  style={{
                    fontFamily: 'Anton, "Bebas Neue", sans-serif',
                    fontSize: '64px',
                    lineHeight: '0.9',
                  }}
                >
                  03
                </span>
                <div className="flex flex-col items-end gap-1">
                  <span className="badge-pill text-[11px] font-mono-metric bg-indigo-500/10 border-indigo-400/20 text-indigo-300 tracking-wider">
                    ACADEMIC RESEARCH
                  </span>
                  <span className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Global Open-Access
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h3
                  className="text-headline-md font-headline-md text-text-primary mb-1"
                  style={{
                    fontFamily: 'Anton, "Bebas Neue", sans-serif',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    fontSize: '26px',
                  }}
                >
                  SSRG International Journals
                </h3>
                <div className="text-mono-metric font-mono-metric text-indigo-300 text-[13px] font-semibold">
                  Founder &amp; Managing Editor
                </div>
              </div>

              <p className="text-body-sm font-body-sm text-text-secondary leading-relaxed mb-6">
                Seventh Sense Research Group fosters scholarly dissemination across
                computer science, electronics, and engineering. Anchored in Ph.D.
                research rigor, publishing double-blind peer-reviewed
                contributions from 60+ countries.
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-6">
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Published Papers
                  </div>
                  <div className="text-body-sm font-bold text-indigo-300">
                    <CountUp target={10000} format="comma" suffix="+" /> Works
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Global Networks
                  </div>
                  <div className="text-body-sm font-bold text-text-primary">
                    <CountUp target={45} suffix="+" /> Universities
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Disciplinary Range
                  </div>
                  <div className="text-body-sm font-bold text-text-primary">
                    <CountUp target={14} /> Journals
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-surface border border-slate-border">
                  <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Peer Protocol
                  </div>
                  <div className="text-body-sm font-bold text-text-primary">
                    Double-Blind
                  </div>
                </div>
              </div>
            </div>

            <a
              className="inline-flex items-center justify-between w-full px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 hover:bg-indigo-500/20 transition-all font-mono-metric text-mono-metric group"
              href="https://internationaljournalssrg.org"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span>internationaljournalssrg.org</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                arrow_outward
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
