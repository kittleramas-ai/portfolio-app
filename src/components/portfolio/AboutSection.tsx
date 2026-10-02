import * as React from 'react'
import { prefersReducedMotion, isMobileDevice } from '../../routes/lib/gsap'
import { loadGsap } from '../../routes/lib/gsapLoader'

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
      <div className="w-full mb-16 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-label-badge font-label-badge bg-slate-surface border border-blue-500/30 text-blue-600 dark:text-[#E5C07B] mb-4">
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
                Infodazz • Estd 2022
              </span>
            </div>

            <div className="float-pill-2 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-surface border border-blue-400/25 shadow-[0_0_16px_var(--portfolio-glow-blue)] hover:border-blue-400/45 hover:shadow-[0_0_24px_var(--portfolio-glow-blue-hover)] hover:scale-105 transition-all duration-300 cursor-pointer select-none lg:mr-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
              </div>
              <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
                Kittle Pvt Ltd • Trichy
              </span>
            </div>

            <div className="float-pill-3 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-surface border border-slate-border shadow-lg hover:border-blue-500/40 hover:shadow-[0_0_20px_var(--portfolio-glow-cyan)] hover:scale-105 transition-all duration-300 cursor-pointer select-none">
              <div className="w-7 h-7 rounded-full bg-slate-surface border border-slate-border flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px]">
                  verified_user
                </span>
              </div>
              <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
                BNI since 2022 • Rotary since 2024
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
                Coming from a humble farmer family, my journey is about{' '}
              </span>
              <span className="text-text-primary font-bold">
                continuous learning and innovation
              </span>
              <span className="text-text-secondary font-normal">, </span>
              <span className="text-[#0D281E] dark:text-[#E5C07B] font-bold">
                building technology businesses
              </span>
              <span className="text-text-secondary font-normal">, and </span>
              <span className="text-[#8C6D1F] dark:text-[#D4AF37] font-bold">
                creating opportunities for others
              </span>
              <span className="text-text-secondary font-normal">
                {' '}
                — from academic research into entrepreneurship.
              </span>
            </h2>
            <p className="text-body-md font-body-md text-text-secondary mt-6 leading-relaxed max-w-xl mx-auto">
              Technology entrepreneur, research contributor and business leader across
              technology solutions, digital transformation, academic publishing and
              social responsibility.
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
                30+ Intl Journals • 5+ Scopus
              </span>
            </div>

            <div className="float-pill-5 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-surface border border-blue-400/25 shadow-[0_0_16px_var(--portfolio-glow-blue)] hover:border-blue-400/45 hover:shadow-[0_0_24px_var(--portfolio-glow-blue-hover)] hover:scale-105 transition-all duration-300 cursor-pointer select-none lg:ml-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px]">
                  currency_rupee
                </span>
              </div>
              <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
                Kaster Trust • Education Support
              </span>
            </div>

            <div className="float-pill-6 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-surface border border-indigo-400/25 shadow-[0_0_16px_var(--portfolio-glow-indigo)] hover:border-indigo-400/45 hover:shadow-[0_0_24px_var(--portfolio-glow-indigo-hover)] hover:scale-105 transition-all duration-300 cursor-pointer select-none">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[16px] font-bold">
                  school
                </span>
              </div>
              <span className="text-[13px] font-mono-metric font-semibold text-text-primary tracking-tight">
                Ph.D • MCA • B.Sc Mathematics
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
            &ldquo;How did your journey move from academic research into building
            technology companies?&rdquo;
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
              <span className="text-[12px] font-mono-metric font-semibold tracking-[0.2em] text-[#0D281E] dark:text-[#E5C07B] uppercase">
                INFODAZZ + KITTLE • PILLAR I — ENTREPRENEURSHIP
              </span>
            </div>
            <p className="text-[15px] md:text-[16px] text-text-secondary leading-relaxed mb-4">
              <strong className="text-text-primary font-semibold">
                Helping businesses grow through technology and digital transformation
              </strong>{' '}
              — Infodazz was established in 2022 with HQ in Trichy and branches in
              Madurai, Karaikudi and Kumbakonam, with 50+ professionals across ERP,
              SaaS, Web &amp; Mobile Apps, IT Solutions, Digital Marketing, SEO,
              Design, Animation/VFX, Photography/Videography and Event Management.
              Kittle Pvt Ltd, Trichy focuses on Software Solutions, IT Services,
              Digital Platforms and Technology Consulting.
            </p>
            <div className="pt-3 border-t border-slate-border flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-text-secondary">
              <span>Estd 2022 • Trichy HQ • 50+ Professionals • 11 Service Verticals</span>
              <span className="material-symbols-outlined text-[#0D281E] dark:text-[#E5C07B] text-[16px]">
                terminal
              </span>
            </div>
          </div>
        </div>

        {/* 3. Prompt Bubble */}
        <div className="flex justify-end w-full">
          <div className="max-w-xl px-6 py-4 rounded-2xl md:rounded-3xl bg-slate-surface border border-slate-border text-text-secondary text-[15px] md:text-[16px] leading-relaxed bubble-glow transition-all duration-300 hover:border-blue-400/35">
            &ldquo;How do you support researchers, academicians and students?&rdquo;
          </div>
        </div>

        {/* 4. Executive Pillar II */}
        <div className="flex justify-start w-full">
          <div className="w-full max-w-2xl p-6 md:p-7 rounded-2xl md:rounded-3xl executive-card executive-card-glow-amber relative group transition-all duration-300 hover:border-blue-400/40">
            <div className="flex items-center gap-3 mb-3.5">
              <div className="w-6 h-6 rounded-md bg-blue-500/15 border border-blue-400/35 flex items-center justify-center text-[#0D281E] dark:text-[#E5C07B] shrink-0">
                <span className="material-symbols-outlined text-[15px]">hub</span>
              </div>
              <span className="text-[12px] font-mono-metric font-semibold tracking-[0.2em] text-[#0D281E] dark:text-[#E5C07B] uppercase">
                SEVENTH SENSE + ACADEMICS • PILLAR II — KNOWLEDGE
              </span>
            </div>
            <p className="text-[15px] md:text-[16px] text-text-secondary leading-relaxed mb-4">
              <strong className="text-text-primary font-semibold">
                International research publishing platform for researchers and
                academicians
              </strong>{' '}
              — Seventh Sense Research Group supports 30+ International Journals
              including 5+ Scopus Indexed Journals, with research publication
              ecosystem and academic collaboration support. Academic background:
              Ph.D — Madurai Kamaraj University, MCA — Thiagarajar School of
              Management Madurai, B.Sc Mathematics — Govt. College of Arts and
              Science Kumbakonam. Contributions include research publications,
              patents, academic mentoring and research guidance.
            </p>
            <div className="pt-3 border-t border-slate-border flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-text-secondary">
              <span>30+ Journals • 5+ Scopus • Publications • Patents • Mentoring</span>
              <span className="material-symbols-outlined text-[#0D281E] dark:text-[#E5C07B] text-[16px]">
                payments
              </span>
            </div>
          </div>
        </div>

        {/* 5. Prompt Bubble */}
        <div className="flex justify-end w-full">
          <div className="max-w-xl px-6 py-4 rounded-2xl md:rounded-3xl bg-slate-surface border border-slate-border text-text-secondary text-[15px] md:text-[16px] leading-relaxed bubble-glow transition-all duration-300 hover:border-blue-400/35">
            &ldquo;What drives your leadership, travel and social impact work?&rdquo;
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
                KASTER TRUST + NETWORKS • PILLAR III — SOCIAL IMPACT
              </span>
            </div>
            <p className="text-[15px] md:text-[16px] text-text-secondary leading-relaxed mb-4">
              <strong className="text-text-primary font-semibold">
                Helping deserving students continue education by reducing financial
                barriers
              </strong>{' '}
              — Kaster Trust provides educational fee support and encourages learning
              opportunities. Active in business and professional communities as BNI
              Member since 2022 and Rotary Member since 2024. A passionate traveller
              and lifelong learner who shares knowledge through motivational sessions
              and professional interactions.
            </p>
            <div className="pt-3 border-t border-slate-border flex items-center justify-between text-mono-metric font-mono-metric text-[12px] text-text-secondary">
              <span>BNI since 2022 • Rotary since 2024 • Global Travel • Mentorship</span>
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
