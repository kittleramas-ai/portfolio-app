import * as React from 'react'
import { prefersReducedMotion, isMobileDevice } from '../../lib/gsap'
import { loadGsap } from '../../lib/gsapLoader'

export function AboutSection() {
  const sectionRef = React.useRef<HTMLElement | null>(null)
  const bgRef = React.useRef<HTMLDivElement | null>(null)

  // Desktop: pin the golden-ratio backdrop for the section's scroll range
  // (pinSpacing:false, so layout is untouched). Content scrolls over the
  // fixed diagram; it releases when the section ends. Mobile uses native
  // CSS sticky instead (see .gr-bg), reduced-motion/SSR stay static.
  React.useEffect(() => {
    if (isMobileDevice()) return
    const section = sectionRef.current
    const bg = bgRef.current
    if (!section || !bg || typeof window === 'undefined') return
    if (prefersReducedMotion()) return

    let cancelled = false
    let revert: (() => void) | null = null

    loadGsap().then(
      ({ gsap, ScrollTrigger }) => {
        if (cancelled || !sectionRef.current || !bgRef.current) return
        const ctx = gsap.context(() => {
          ScrollTrigger.create({
            trigger: bg,
            start: 'top top',
            end: () =>
              `+=${Math.max(0, section.offsetHeight - window.innerHeight)}`,
            pin: bg,
            pinSpacing: false,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          })
        }, section)
        revert = () => ctx.revert()
        ScrollTrigger.refresh()
      },
      () => {
        /* GSAP failed — static backdrop remains */
      },
    )

    return () => {
      cancelled = true
      revert?.()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-24 w-full border-b border-slate-border relative overflow-x-clip section-hairline bg-[var(--portfolio-about-bg)]"
      id="about"
    >
      {/* Golden-ratio spiral backdrop — pure CSS nested squares + arcs.
          Exact φ tiling (% of width): 61.80 · 38.20 · 23.61 · 14.59 · 9.02 ·
          5.57 · 3.44 · 2.13 · 1.32 · 0.81 (= Fibonacci 89·55·34·21·13·8·5·3·2·1
          scaled, container aspect 1.618:1). Each ::before is a 200% circle
          clipped to a seamless 90° arc. Strictly a background: absolute,
          non-interactive, z-index 0. */}
      <div aria-hidden ref={bgRef} className="gr-bg">
        <div className="gr-frame">
          <div className="gr">
          <div className="gr-box gr-b1" />
          <div className="gr-box gr-b2" />
          <div className="gr-box gr-b3" />
          <div className="gr-box gr-b4" />
          <div className="gr-box gr-b5" />
          <div className="gr-box gr-b6" />
          <div className="gr-box gr-b7" />
          <div className="gr-box gr-b8" />
          <div className="gr-box gr-b9" />
          <div className="gr-box gr-b10" />
          <div className="gr-dot" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
      <div className="w-full max-w-6xl mx-auto mb-16 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-label-badge font-label-badge bg-slate-surface border border-blue-500/30 text-blue-400 mb-4">
            <span className="material-symbols-outlined text-[14px]">cognition</span>
            <span>STRATEGIC PHILOSOPHY • CORE THESIS</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
          {/* Left Floating Pills */}
          <div className="lg:col-span-3 flex flex-col gap-4 lg:gap-5 justify-center items-center lg:items-end">
            <div className="float-pill-1 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-surface border border-blue-500/30 shadow-[0_0_20px_var(--portfolio-glow-cyan)] hover:border-blue-400/50 hover:shadow-[0_0_28px_var(--portfolio-glow-cyan-hover)] hover:scale-105 transition-all duration-300 cursor-pointer select-none">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px]">cloud</span>
              </div>
              <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
                Enterprise Cloud &amp; AI
              </span>
            </div>

            <div className="float-pill-2 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-surface border border-blue-400/25 shadow-[0_0_16px_var(--portfolio-glow-blue)] hover:border-blue-400/45 hover:shadow-[0_0_24px_var(--portfolio-glow-blue-hover)] hover:scale-105 transition-all duration-300 cursor-pointer select-none lg:mr-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
              </div>
              <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
                Distributed Systems &amp; ERP
              </span>
            </div>

            <div className="float-pill-3 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-surface border border-slate-border shadow-lg hover:border-blue-500/40 hover:shadow-[0_0_20px_var(--portfolio-glow-cyan)] hover:scale-105 transition-all duration-300 cursor-pointer select-none">
              <div className="w-7 h-7 rounded-full bg-slate-surface border border-slate-border flex items-center justify-center text-blue-500 shadow-sm shrink-0">
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
              <span className="text-text-primary font-bold">
                unifying academic precision
              </span>
              <span className="text-text-secondary font-normal">, </span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                fault-tolerant enterprise code
              </span>
              <span className="text-text-secondary font-normal">, and </span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">
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
            <div className="float-pill-4 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-surface border border-blue-500/30 shadow-[0_0_20px_var(--portfolio-glow-cyan)] hover:border-blue-400/50 hover:shadow-[0_0_28px_var(--portfolio-glow-cyan-hover)] hover:scale-105 transition-all duration-300 cursor-pointer select-none">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px] font-bold">
                  hub
                </span>
              </div>
              <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
                Ecosystem Scale (BNI)
              </span>
            </div>

            <div className="float-pill-5 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-surface border border-blue-400/25 shadow-[0_0_16px_var(--portfolio-glow-blue)] hover:border-blue-400/45 hover:shadow-[0_0_24px_var(--portfolio-glow-blue-hover)] hover:scale-105 transition-all duration-300 cursor-pointer select-none lg:ml-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px]">
                  currency_rupee
                </span>
              </div>
              <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
                Regional High-Trust Commerce
              </span>
            </div>

            <div className="float-pill-6 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-surface border border-indigo-400/25 shadow-[0_0_16px_var(--portfolio-glow-indigo)] hover:border-indigo-400/45 hover:shadow-[0_0_24px_var(--portfolio-glow-indigo-hover)] hover:scale-105 transition-all duration-300 cursor-pointer select-none">
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
          <div className="max-w-xl px-6 py-4 rounded-2xl md:rounded-3xl bg-slate-surface border border-slate-border text-text-secondary text-[15px] md:text-[16px] leading-relaxed bubble-glow transition-all duration-300 hover:border-blue-400/35">
            &ldquo;How do you connect high-throughput enterprise cloud engineering with
            grassroots regional commerce and peer-reviewed academic rigor?&rdquo;
          </div>
        </div>

        {/* 2. Executive Pillar I */}
        <div className="flex justify-start w-full">
          <div className="w-full max-w-2xl p-6 md:p-7 rounded-2xl md:rounded-3xl executive-card executive-card-glow-blue relative group transition-all duration-300 hover:border-blue-400/40">
            <div className="flex items-center gap-3 mb-3.5">
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-surface rounded-md border border-slate-border shrink-0">
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
              <span className="text-[12px] font-mono-metric font-semibold tracking-[0.2em] text-blue-600 dark:text-blue-300 uppercase">
                INFODAZZ • PILLAR I
              </span>
            </div>
            <p className="text-[15px] md:text-[16px] text-text-secondary leading-relaxed mb-4">
              <strong className="text-text-primary font-semibold">
                Enterprise Cloud &amp; AI Architecture
              </strong>{' '}
              — Delivering zero-latency fault tolerance, microservice systems, and
              high-throughput AI automation across regional &amp; domestic enterprise
              clients. Turning complex distributed code into mission-critical
              business engines.
            </p>
            <div className="pt-3 border-t border-slate-border flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-text-tertiary">
              <span>Specialties: Distributed Systems • SaaS &amp; Cloud Infrastructure</span>
              <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 text-[16px]">
                terminal
              </span>
            </div>
          </div>
        </div>

        {/* 3. Prompt Bubble */}
        <div className="flex justify-end w-full">
          <div className="max-w-xl px-6 py-4 rounded-2xl md:rounded-3xl bg-slate-surface border border-slate-border text-text-secondary text-[15px] md:text-[16px] leading-relaxed bubble-glow transition-all duration-300 hover:border-blue-400/35">
            &ldquo;And how does that technical leverage translate into real economic scale
            for regional business leaders?&rdquo;
          </div>
        </div>

        {/* 4. Executive Pillar II */}
        <div className="flex justify-start w-full">
          <div className="w-full max-w-2xl p-6 md:p-7 rounded-2xl md:rounded-3xl executive-card executive-card-glow-amber relative group transition-all duration-300 hover:border-blue-400/40">
            <div className="flex items-center gap-3 mb-3.5">
              <div className="w-6 h-6 rounded-md bg-blue-500/15 border border-blue-400/35 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <span className="material-symbols-outlined text-[15px]">hub</span>
              </div>
              <span className="text-[12px] font-mono-metric font-semibold tracking-[0.2em] text-blue-600 dark:text-blue-300 uppercase">
                BNI MADURAI • PILLAR II
              </span>
            </div>
            <p className="text-[15px] md:text-[16px] text-text-secondary leading-relaxed mb-4">
              <strong className="text-text-primary font-semibold">
                High-Trust Economic Synergy
              </strong>{' '}
              — Spearheading regional commercial acceleration through structured
              referral systems, organizing flagship trade conclaves, and actively
              mentoring founders to break regional boundaries into national and
              global markets.
            </p>
            <div className="pt-3 border-t border-slate-border flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-text-tertiary">
              <span>Focus: ₹120+ Cr Facilitated • Tier-2 High-Trust Networks</span>
              <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 text-[16px]">
                payments
              </span>
            </div>
          </div>
        </div>

        {/* 5. Prompt Bubble */}
        <div className="flex justify-end w-full">
          <div className="max-w-xl px-6 py-4 rounded-2xl md:rounded-3xl bg-slate-surface border border-slate-border text-text-secondary text-[15px] md:text-[16px] leading-relaxed bubble-glow transition-all duration-300 hover:border-blue-400/35">
            &ldquo;Where does the foundational research and long-term intellectual
            validation come from?&rdquo;
          </div>
        </div>

        {/* 6. Executive Pillar III */}
        <div className="flex justify-start w-full">
          <div className="w-full max-w-2xl p-6 md:p-7 rounded-2xl md:rounded-3xl executive-card executive-card-glow-cyan relative group transition-all duration-300 hover:border-cyan-400/40">
            <div className="flex items-center gap-3 mb-3.5">
              <div className="w-6 h-6 rounded-md bg-cyan-500/15 border border-cyan-400/35 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                <span className="material-symbols-outlined text-[15px]">
                  school
                </span>
              </div>
              <span className="text-[12px] font-mono-metric font-semibold tracking-[0.2em] text-cyan-600 dark:text-cyan-300 uppercase">
                SSRG JOURNALS • PILLAR III
              </span>
            </div>
            <p className="text-[15px] md:text-[16px] text-text-secondary leading-relaxed mb-4">
              <strong className="text-text-primary font-semibold">
                Academic Rigor &amp; Global Open Access
              </strong>{' '}
              — Harnessing Ph.D. research foundations in computer science to shepherd
              SSRG International Journals (Seventh Sense Research Group), indexing
              10,000+ scientific publications across 45+ international universities.
            </p>
            <div className="pt-3 border-t border-slate-border flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-text-tertiary">
              <span>Indexed: Global Open Access • Double-Blind Peer Review</span>
              <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-[16px]">
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
