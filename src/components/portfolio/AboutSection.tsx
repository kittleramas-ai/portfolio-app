import { Reveal } from './Reveal'

export function AboutSection() {
  return (
    <section style={{ backgroundColor: '#DFDBE5', backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='42' height='44' viewBox='0 0 42 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='Page-1' fill='none' fill-rule='evenodd'%3E%3Cg id='brick-wall' fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M0 0h42v44H0V0zm1 1 h40v20H1V1zM0 23h20v20H0V23zm22 0h20v20H22V23z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
      className="py-24 max-w-7xl mx-auto px-6 md:px-12 border-b border-slate-border relative overflow-hidden section-hairline"
      id="about"
    >
      {/* Ambient Atmospheric Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-900/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="w-full max-w-6xl mx-auto mb-16 relative">
        <Reveal>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-label-badge font-label-badge bg-slate-surface border border-slate-border text-primary mb-4">
            <span className="material-symbols-outlined text-[14px]">cognition</span>
            <span>STRATEGIC PHILOSOPHY • CORE THESIS</span>
          </div>
        </div>
        </Reveal>
        <Reveal delay={120}>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
          {/* Left Floating Pills */}
          <div className="lg:col-span-3 flex flex-col gap-4 lg:gap-5 justify-center items-center lg:items-end">
            <div className="float-pill-1 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#101726]/95 border border-cyan-400/40 shadow-[0_0_20px_rgba(14,165,233,0.22)] hover:border-cyan-300 hover:shadow-[0_0_28px_rgba(14,165,233,0.4)] hover:scale-105 transition-all duration-300 cursor-pointer select-none">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px]">cloud</span>
              </div>
              <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
                Enterprise Cloud &amp; AI
              </span>
            </div>

            <div className="float-pill-2 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#151226]/95 border border-purple-500/35 shadow-[0_0_18px_rgba(168,85,247,0.18)] hover:border-purple-400 hover:shadow-[0_0_26px_rgba(168,85,247,0.35)] hover:scale-105 transition-all duration-300 cursor-pointer select-none lg:mr-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
              </div>
              <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
                Distributed Systems &amp; ERP
              </span>
            </div>

            <div className="float-pill-3 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#11161f]/95 border border-slate-border-highlight/80 shadow-lg hover:border-slate-600 hover:shadow-cyan-950/20 hover:scale-105 transition-all duration-300 cursor-pointer select-none">
              <div className="w-7 h-7 rounded-full bg-slate-surface border border-slate-border flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px]">
                  verified_user
                </span>
              </div>
              <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
                Enterprise Governance
              </span>
            </div>
          </div>

          {/* Center Philosophy Headline */}
          <div className="lg:col-span-6 text-center px-2 sm:px-6">
            <h2
              className="text-2xl sm:text-3xl lg:text-[36px] font-bold tracking-tight leading-[1.25] text-text-primary"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              <span className="text-text-secondary font-normal">
                My focus is on{' '}
              </span>
              <span className="text-white font-bold">
                unifying academic precision
              </span>
              <span className="text-text-secondary font-normal">, </span>
              <span className="text-primary font-bold">
                fault-tolerant enterprise code
              </span>
              <span className="text-text-secondary font-normal">, and </span>
              <span className="text-accent-gold font-bold">
                high-trust commerce
              </span>
              <span className="text-text-secondary font-normal">
                {' '}
                to craft business engines that solve mission-critical scale.
              </span>
            </h2>
            <p className="text-body-md font-body-md text-text-tertiary mt-6 leading-relaxed max-w-xl mx-auto">
              Synthesizing scientific discovery, enterprise technology, and regional
              business into a singular commercial flywheel.
            </p>
          </div>

          {/* Right Floating Pills */}
          <div className="lg:col-span-3 flex flex-col gap-4 lg:gap-5 justify-center items-center lg:items-start">
            <div className="float-pill-4 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#1a150e]/95 border border-accent-gold/40 shadow-[0_0_18px_rgba(245,158,11,0.2)] hover:border-accent-gold hover:shadow-[0_0_26px_rgba(245,158,11,0.35)] hover:scale-105 transition-all duration-300 cursor-pointer select-none">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-obsidian-base shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px] font-bold">
                  hub
                </span>
              </div>
              <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
                Ecosystem Scale (BNI)
              </span>
            </div>

            <div className="float-pill-5 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#1c111a]/95 border border-pink-400/40 shadow-[0_0_18px_rgba(244,63,94,0.18)] hover:border-pink-400 hover:shadow-[0_0_26px_rgba(244,63,94,0.35)] hover:scale-105 transition-all duration-300 cursor-pointer select-none lg:ml-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px]">
                  currency_rupee
                </span>
              </div>
              <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
                Regional High-Trust Commerce
              </span>
            </div>

            <div className="float-pill-6 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#0c1917]/95 border border-emerald-400/40 shadow-[0_0_18px_rgba(52,211,153,0.2)] hover:border-emerald-300 hover:shadow-[0_0_26px_rgba(52,211,153,0.35)] hover:scale-105 transition-all duration-300 cursor-pointer select-none">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-obsidian-base shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px] font-bold">
                  school
                </span>
              </div>
              <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
                Scholarly Rigor (SSRG)
              </span>
            </div>
          </div>
        </div>
        </Reveal>
      </div>

      {/* Staggered Speech Bubble Dialogue Thread */}
      <Reveal delay={80}>
      <div className="max-w-4xl mx-auto flex flex-col space-y-7 py-4">
        {/* 1. Prompt Bubble */}
        <div className="flex justify-end w-full">
          <div className="max-w-xl px-6 py-4 rounded-2xl md:rounded-3xl bg-[#141424]/90 border border-purple-500/25 text-[#E1E2EC] text-[15px] md:text-[16px] leading-relaxed shadow-lg shadow-purple-950/30 backdrop-blur-md">
            “How do you connect high-throughput enterprise cloud engineering with
            grassroots regional commerce and peer-reviewed academic rigor?”
          </div>
        </div>

        {/* 2. Executive Pillar I */}
        <div className="flex justify-start w-full">
          <div className="w-full max-w-2xl p-6 md:p-7 rounded-2xl md:rounded-3xl bg-[#131224]/95 border border-purple-500/30 shadow-xl shadow-purple-950/40 backdrop-blur-xl relative group transition-all duration-200 hover:border-purple-400/45">
            <div className="flex items-center gap-3 mb-3.5">
              <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-md border border-white/10 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-300"></span>
              </div>
              <span className="text-[12px] font-mono-metric font-semibold tracking-[0.2em] text-purple-300 uppercase">
                INFODAZZ • PILLAR I
              </span>
            </div>
            <p className="text-[15px] md:text-[16px] text-[#E1E2EC] leading-relaxed mb-4">
              <strong className="text-white font-semibold">
                Enterprise Cloud &amp; AI Architecture
              </strong>{' '}
              — Delivering zero-latency fault tolerance, microservice systems, and
              high-throughput AI automation across regional &amp; domestic enterprise
              clients. Turning complex distributed code into mission-critical
              business engines.
            </p>
            <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-purple-300/80">
              <span>Specialties: Distributed Systems • SaaS &amp; Cloud Infrastructure</span>
              <span className="material-symbols-outlined text-primary text-[16px]">
                terminal
              </span>
            </div>
          </div>
        </div>

        {/* 3. Prompt Bubble */}
        <div className="flex justify-end w-full">
          <div className="max-w-xl px-6 py-4 rounded-2xl md:rounded-3xl bg-[#141424]/90 border border-purple-500/25 text-[#E1E2EC] text-[15px] md:text-[16px] leading-relaxed shadow-lg shadow-purple-950/30 backdrop-blur-md">
            “And how does that technical leverage translate into real economic scale
            for regional business leaders?”
          </div>
        </div>

        {/* 4. Executive Pillar II */}
        <div className="flex justify-start w-full">
          <div className="w-full max-w-2xl p-6 md:p-7 rounded-2xl md:rounded-3xl bg-[#131224]/95 border border-amber-500/30 shadow-xl shadow-amber-950/20 backdrop-blur-xl relative group transition-all duration-200 hover:border-accent-gold/50">
            <div className="flex items-center gap-3 mb-3.5">
              <div className="w-6 h-6 rounded-md bg-accent-gold/15 border border-accent-gold/40 flex items-center justify-center text-accent-gold shrink-0">
                <span className="material-symbols-outlined text-[15px]">hub</span>
              </div>
              <span className="text-[12px] font-mono-metric font-semibold tracking-[0.2em] text-accent-gold uppercase">
                BNI MADURAI • PILLAR II
              </span>
            </div>
            <p className="text-[15px] md:text-[16px] text-[#E1E2EC] leading-relaxed mb-4">
              <strong className="text-white font-semibold">
                High-Trust Economic Synergy
              </strong>{' '}
              — Spearheading regional commercial acceleration through structured
              referral systems, organizing flagship trade conclaves, and actively
              mentoring founders to break regional boundaries into national and
              global markets.
            </p>
            <div className="pt-3 border-t border-amber-500/20 flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-accent-gold/80">
              <span>Focus: ₹120+ Cr Facilitated • Tier-2 High-Trust Networks</span>
              <span className="material-symbols-outlined text-accent-gold text-[16px]">
                payments
              </span>
            </div>
          </div>
        </div>

        {/* 5. Prompt Bubble */}
        <div className="flex justify-end w-full">
          <div className="max-w-xl px-6 py-4 rounded-2xl md:rounded-3xl bg-[#141424]/90 border border-purple-500/25 text-[#E1E2EC] text-[15px] md:text-[16px] leading-relaxed shadow-lg shadow-purple-950/30 backdrop-blur-md">
            “Where does the foundational research and long-term intellectual
            validation come from?”
          </div>
        </div>

        {/* 6. Executive Pillar III */}
        <div className="flex justify-start w-full">
          <div className="w-full max-w-2xl p-6 md:p-7 rounded-2xl md:rounded-3xl bg-[#131224]/95 border border-cyan-500/30 shadow-xl shadow-cyan-950/20 backdrop-blur-xl relative group transition-all duration-200 hover:border-primary/50">
            <div className="flex items-center gap-3 mb-3.5">
              <div className="w-6 h-6 rounded-md bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[15px]">
                  school
                </span>
              </div>
              <span className="text-[12px] font-mono-metric font-semibold tracking-[0.2em] text-primary uppercase">
                SSRG JOURNALS • PILLAR III
              </span>
            </div>
            <p className="text-[15px] md:text-[16px] text-[#E1E2EC] leading-relaxed mb-4">
              <strong className="text-white font-semibold">
                Academic Rigor &amp; Global Open Access
              </strong>{' '}
              — Harnessing Ph.D. research foundations in computer science to shepherd
              SSRG International Journals (Seventh Sense Research Group), indexing
              10,000+ scientific publications across 45+ international universities.
            </p>
            <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-cyan-300/80">
              <span>Indexed: Global Open Access • Double-Blind Peer Review</span>
              <span className="material-symbols-outlined text-primary text-[16px]">
                menu_book
              </span>
            </div>
          </div>
        </div>
      </div>
      </Reveal>
    </section>
  )
}
