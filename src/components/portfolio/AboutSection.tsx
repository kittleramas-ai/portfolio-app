export function AboutSection() {
  return (
    <section
      className="py-24 w-full border-b border-slate-border relative overflow-hidden section-hairline bg-[var(--portfolio-about-bg)]"
      id="about"
    >
      {/* Static SVG backdrop — no GSAP, no animation */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <linearGradient id="bg-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--portfolio-about-blue-deep)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="var(--portfolio-about-blue-mid)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--portfolio-about-bg)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="phil-axis" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--portfolio-blue-500)" />
            <stop offset="100%" stopColor="var(--portfolio-about-purple)" />
          </linearGradient>
          <pattern id="bg-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60 0 L0 0 0 60" fill="none" stroke="var(--portfolio-about-blue)" strokeWidth="0.5" opacity="0.10" />
          </pattern>
        </defs>
        <rect width="1200" height="800" fill="url(#bg-grad)" />
        <rect width="1200" height="800" fill="url(#bg-grid)" />
        <ellipse cx="600" cy="400" rx="500" ry="300" fill="none" stroke="var(--portfolio-about-blue)" strokeWidth="1" opacity="0.14" />
        <ellipse cx="600" cy="400" rx="350" ry="210" fill="none" stroke="var(--primary-container)" strokeWidth="0.8" opacity="0.12" />
        <line x1="0" y1="400" x2="1200" y2="400" stroke="url(#phil-axis)" strokeWidth="0.5" opacity="0.09" />
        <line x1="600" y1="0" x2="600" y2="800" stroke="url(#phil-axis)" strokeWidth="0.5" opacity="0.09" />
        <g opacity="0.22" fill="var(--portfolio-blue-500)">
          {/* Small circles with dots inside */}
          <circle cx="350" cy="420" r="8" fill="none" stroke="var(--portfolio-blue-500)" strokeWidth="0.6" opacity="0.7" />
          <circle cx="350" cy="420" r="1.8" opacity="0.85" />
          <circle cx="880" cy="350" r="6" fill="none" stroke="var(--primary-container)" strokeWidth="0.6" opacity="0.65" />
          <circle cx="880" cy="350" r="1.5" opacity="0.75" />
          <circle cx="200" cy="200" r="2.5" opacity="0.20" />
          <circle cx="1000" cy="250" r="2.5" opacity="0.18" />
          <circle cx="150" cy="600" r="2.5" opacity="0.18" />
          <circle cx="1050" cy="650" r="2.5" opacity="0.15" />
          <circle cx="600" cy="100" r="2" opacity="0.22" />
          <circle cx="600" cy="700" r="2" opacity="0.18" />
          {/* Extra scattered dots */}
          <circle cx="180" cy="350" r="1.8" opacity="0.16" />
          <circle cx="950" cy="480" r="2" opacity="0.14" />
          <circle cx="420" cy="580" r="1.6" opacity="0.17" />
          <circle cx="750" cy="280" r="1.9" opacity="0.12" />
          <circle cx="300" cy="150" r="1.5" opacity="0.14" />
          <circle cx="1100" cy="600" r="1.7" opacity="0.11" />
        </g>
      </svg>

      {/* Minimal CSS glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-[15%] h-[28rem] w-[28rem] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute top-1/3 right-[10%] h-[24rem] w-[24rem] rounded-full bg-cyan-500/4 blur-[100px]" />
        <div className="absolute bottom-0 left-[40%] h-[20rem] w-[20rem] rounded-full bg-indigo-600/4 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
      <div className="w-full max-w-6xl mx-auto mb-16 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-label-badge font-label-badge bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-4">
            <span className="material-symbols-outlined text-[14px]">cognition</span>
            <span>STRATEGIC PHILOSOPHY • CORE THESIS</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
          {/* Left Floating Pills */}
          <div className="lg:col-span-3 flex flex-col gap-4 lg:gap-5 justify-center items-center lg:items-end">
            <div className="float-pill-1 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-blue-900/20 border border-blue-500/30 shadow-[0_0_20px_var(--portfolio-glow-cyan)] hover:border-blue-400/50 hover:shadow-[0_0_28px_var(--portfolio-glow-cyan-hover)] hover:scale-105 transition-all duration-300 cursor-pointer select-none">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px]">cloud</span>
              </div>
              <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
                Enterprise Cloud &amp; AI
              </span>
            </div>

            <div className="float-pill-2 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-blue-900/15 border border-blue-400/25 shadow-[0_0_16px_var(--portfolio-glow-blue)] hover:border-blue-400/45 hover:shadow-[0_0_24px_var(--portfolio-glow-blue-hover)] hover:scale-105 transition-all duration-300 cursor-pointer select-none lg:mr-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
              </div>
              <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
                Distributed Systems &amp; ERP
              </span>
            </div>

            <div className="float-pill-3 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-900/60 border border-slate-700/60 shadow-lg hover:border-blue-500/40 hover:shadow-[0_0_20px_var(--portfolio-glow-cyan)] hover:scale-105 transition-all duration-300 cursor-pointer select-none">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shadow-sm shrink-0">
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
              <span className="text-slate-400 font-normal">
                My focus is on{' '}
              </span>
              <span className="text-white font-bold">
                unifying academic precision
              </span>
              <span className="text-slate-400 font-normal">, </span>
              <span className="text-blue-400 font-bold">
                fault-tolerant enterprise code
              </span>
              <span className="text-slate-400 font-normal">, and </span>
              <span className="text-cyan-400 font-bold">
                high-trust commerce
              </span>
              <span className="text-slate-400 font-normal">
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
            <div className="float-pill-4 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-blue-900/20 border border-blue-500/30 shadow-[0_0_20px_var(--portfolio-glow-cyan)] hover:border-blue-400/50 hover:shadow-[0_0_28px_var(--portfolio-glow-cyan-hover)] hover:scale-105 transition-all duration-300 cursor-pointer select-none">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px] font-bold">
                  hub
                </span>
              </div>
              <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
                Ecosystem Scale (BNI)
              </span>
            </div>

            <div className="float-pill-5 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-blue-900/15 border border-blue-400/25 shadow-[0_0_16px_var(--portfolio-glow-blue)] hover:border-blue-400/45 hover:shadow-[0_0_24px_var(--portfolio-glow-blue-hover)] hover:scale-105 transition-all duration-300 cursor-pointer select-none lg:ml-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px]">
                  currency_rupee
                </span>
              </div>
              <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
                Regional High-Trust Commerce
              </span>
            </div>

            <div className="float-pill-6 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-blue-900/15 border border-indigo-400/25 shadow-[0_0_16px_var(--portfolio-glow-indigo)] hover:border-indigo-400/45 hover:shadow-[0_0_24px_var(--portfolio-glow-indigo-hover)] hover:scale-105 transition-all duration-300 cursor-pointer select-none">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
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
      </div>

      {/* Staggered Speech Bubble Dialogue Thread */}
      <div className="max-w-4xl mx-auto flex flex-col space-y-7 py-4 relative z-10">
        {/* 1. Prompt Bubble */}
        <div className="flex justify-end w-full">
          <div className="max-w-xl px-6 py-4 rounded-2xl md:rounded-3xl bg-blue-950/40 border border-blue-500/20 text-blue-100/90 text-[15px] md:text-[16px] leading-relaxed shadow-lg shadow-blue-950/30 backdrop-blur-md transition-all duration-300 hover:border-blue-400/35 hover:shadow-blue-900/40">
            &ldquo;How do you connect high-throughput enterprise cloud engineering with
            grassroots regional commerce and peer-reviewed academic rigor?&rdquo;
          </div>
        </div>

        {/* 2. Executive Pillar I */}
        <div className="flex justify-start w-full">
          <div className="w-full max-w-2xl p-6 md:p-7 rounded-2xl md:rounded-3xl bg-blue-950/50 border border-blue-500/25 shadow-xl shadow-blue-950/40 backdrop-blur-xl relative group transition-all duration-300 hover:border-blue-400/40">
            <div className="flex items-center gap-3 mb-3.5">
              <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-md border border-white/10 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-300"></span>
              </div>
              <span className="text-[12px] font-mono-metric font-semibold tracking-[0.2em] text-blue-300 uppercase">
                INFODAZZ • PILLAR I
              </span>
            </div>
            <p className="text-[15px] md:text-[16px] text-blue-100/85 leading-relaxed mb-4">
              <strong className="text-white font-semibold">
                Enterprise Cloud &amp; AI Architecture
              </strong>{' '}
              — Delivering zero-latency fault tolerance, microservice systems, and
              high-throughput AI automation across regional &amp; domestic enterprise
              clients. Turning complex distributed code into mission-critical
              business engines.
            </p>
            <div className="pt-3 border-t border-blue-500/20 flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-blue-300/70">
              <span>Specialties: Distributed Systems • SaaS &amp; Cloud Infrastructure</span>
              <span className="material-symbols-outlined text-blue-400 text-[16px]">
                terminal
              </span>
            </div>
          </div>
        </div>

        {/* 3. Prompt Bubble */}
        <div className="flex justify-end w-full">
          <div className="max-w-xl px-6 py-4 rounded-2xl md:rounded-3xl bg-blue-950/40 border border-blue-500/20 text-blue-100/90 text-[15px] md:text-[16px] leading-relaxed shadow-lg shadow-blue-950/30 backdrop-blur-md transition-all duration-300 hover:border-blue-400/35 hover:shadow-blue-900/40">
            &ldquo;And how does that technical leverage translate into real economic scale
            for regional business leaders?&rdquo;
          </div>
        </div>

        {/* 4. Executive Pillar II */}
        <div className="flex justify-start w-full">
          <div className="w-full max-w-2xl p-6 md:p-7 rounded-2xl md:rounded-3xl bg-blue-950/50 border border-blue-500/25 shadow-xl shadow-blue-950/30 backdrop-blur-xl relative group transition-all duration-300 hover:border-blue-400/40">
            <div className="flex items-center gap-3 mb-3.5">
              <div className="w-6 h-6 rounded-md bg-blue-500/15 border border-blue-400/35 flex items-center justify-center text-blue-400 shrink-0">
                <span className="material-symbols-outlined text-[15px]">hub</span>
              </div>
              <span className="text-[12px] font-mono-metric font-semibold tracking-[0.2em] text-blue-300 uppercase">
                BNI MADURAI • PILLAR II
              </span>
            </div>
            <p className="text-[15px] md:text-[16px] text-blue-100/85 leading-relaxed mb-4">
              <strong className="text-white font-semibold">
                High-Trust Economic Synergy
              </strong>{' '}
              — Spearheading regional commercial acceleration through structured
              referral systems, organizing flagship trade conclaves, and actively
              mentoring founders to break regional boundaries into national and
              global markets.
            </p>
            <div className="pt-3 border-t border-blue-500/20 flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-blue-300/70">
              <span>Focus: ₹120+ Cr Facilitated • Tier-2 High-Trust Networks</span>
              <span className="material-symbols-outlined text-blue-400 text-[16px]">
                payments
              </span>
            </div>
          </div>
        </div>

        {/* 5. Prompt Bubble */}
        <div className="flex justify-end w-full">
          <div className="max-w-xl px-6 py-4 rounded-2xl md:rounded-3xl bg-blue-950/40 border border-blue-500/20 text-blue-100/90 text-[15px] md:text-[16px] leading-relaxed shadow-lg shadow-blue-950/30 backdrop-blur-md transition-all duration-300 hover:border-blue-400/35 hover:shadow-blue-900/40">
            &ldquo;Where does the foundational research and long-term intellectual
            validation come from?&rdquo;
          </div>
        </div>

        {/* 6. Executive Pillar III */}
        <div className="flex justify-start w-full">
          <div className="w-full max-w-2xl p-6 md:p-7 rounded-2xl md:rounded-3xl bg-blue-950/50 border border-cyan-500/25 shadow-xl shadow-cyan-950/20 backdrop-blur-xl relative group transition-all duration-300 hover:border-cyan-400/40">
            <div className="flex items-center gap-3 mb-3.5">
              <div className="w-6 h-6 rounded-md bg-cyan-500/15 border border-cyan-400/35 flex items-center justify-center text-cyan-400 shrink-0">
                <span className="material-symbols-outlined text-[15px]">
                  school
                </span>
              </div>
              <span className="text-[12px] font-mono-metric font-semibold tracking-[0.2em] text-cyan-300 uppercase">
                SSRG JOURNALS • PILLAR III
              </span>
            </div>
            <p className="text-[15px] md:text-[16px] text-blue-100/85 leading-relaxed mb-4">
              <strong className="text-white font-semibold">
                Academic Rigor &amp; Global Open Access
              </strong>{' '}
              — Harnessing Ph.D. research foundations in computer science to shepherd
              SSRG International Journals (Seventh Sense Research Group), indexing
              10,000+ scientific publications across 45+ international universities.
            </p>
            <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-cyan-300/70">
              <span>Indexed: Global Open Access • Double-Blind Peer Review</span>
              <span className="material-symbols-outlined text-cyan-400 text-[16px]">
                menu_book
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}
