import { Reveal } from './Reveal'
import { AnimatedText } from './AnimatedText'

export function HeroSection() {
  return (
    <section
      className="relative w-full pt-24 sm:pt-32 md:pt-44 pb-16 md:pb-28 border-b border-slate-border/50 section-hairline"
      id="hero"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
      {/* Diagnostic / Status Pill */}
      <Reveal>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] sm:text-[12px] font-label-badge bg-glow-cyan border border-primary/30 text-primary w-fit">
          <span className="material-symbols-outlined text-[14px]">terminal</span>
          <span className="tracking-tight sm:tracking-normal">
            ENTERPRISE ARCHITECTURE • REGIONAL SCALE
          </span>
        </div>
        <div className="hidden sm:inline text-text-tertiary text-mono-metric font-mono-metric">
          |
        </div>
        <div className="inline-flex items-center gap-1.5 text-text-secondary text-mono-metric font-mono-metric text-[11px] sm:text-xs">
          <span
            className="material-symbols-outlined text-[14px] text-accent-gold"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            verified
          </span>
          <span>Doctorate in Computer Science &amp; Engineering</span>
        </div>
      </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end">
        {/* Left Column: Hero Typography, CTAs, & Trust Badges */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6 sm:space-y-8 z-10">
          {/* Headline & Subtitle — GSAP word stagger on load (no nested Reveal: avoids double-hide above fold) */}
          <div className="space-y-4 sm:space-y-6">
            <AnimatedText
              as="h1"
              split="words"
              mode="load"
              stagger={0.05}
              duration={0.7}
              y={28}
              delay={0.1}
              className="headline-glow text-3xl sm:text-5xl lg:text-[64px] font-display-hero text-white tracking-tight leading-tight"
            >
              <span
                style={{
                  fontFamily: 'Anton, "Bebas Neue", sans-serif',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                }}
              >
                Architecting Next-Gen Enterprise Technology.{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-tertiary to-secondary">
                  Catalyzing Regional Business Networks.
                </span>
              </span>
            </AnimatedText>
            <p className="text-body-md md:text-body-lg font-body-md md:font-body-lg text-text-secondary max-w-2xl leading-relaxed line-clamp-3 md:line-clamp-none">
              Founder &amp; CEO of{' '}
              <strong className="text-text-primary font-semibold">Infodazz</strong>,{' '}
              <strong className="text-text-primary font-semibold">
                BNI Madurai
              </strong>{' '}
              Executive &amp; CS Ph.D. Bridging enterprise software engineering with
              regional business ecosystems to power exponential scale.
            </p>
          </div>

          {/* Primary Action CTA Button Group + Micro-caption */}
          <Reveal delay={160}>
          <div className="space-y-4 pt-1 sm:pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <a
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl text-base sm:text-[16px] text-text-primary font-semibold bg-gradient-to-r from-primary-container to-secondary-container hover:opacity-95 shadow-[0_0_24px_var(--portfolio-glow-cta)] transition-all duration-200"
                href="#ventures"
              >
                <span>Explore Infodazz Solutions</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </a>
              <a
                className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-sm sm:text-base text-text-primary hover:text-primary transition-colors duration-150 group font-semibold py-1"
                href="#bni"
              >
                <span>BNI Madurai Initiatives</span>
                <span className="material-symbols-outlined text-[18px] sm:text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </a>
            </div>
            <div className="flex items-start sm:items-center gap-2 text-mono-metric font-mono-metric text-text-tertiary text-[11px] sm:text-[12px] pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0 mt-1 sm:mt-0"></span>
              <span>
                Direct Secretariat Line • Available for Board, Advisory &amp;
                Enterprise Architecture Mandates
              </span>
            </div>
          </div>
          </Reveal>

          {/* Credential / Certification Trust Badges */}
          <Reveal delay={220}>
          <div className="pt-6 border-t border-slate-border/80">
            <div className="text-mono-metric font-mono-metric text-text-tertiary text-[10px] sm:text-[11px] uppercase tracking-wider mb-4">
              Verified Credentials &amp; Institutional Governance
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Badge 1: Ph.D. Doctorate */}
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full bg-slate-surface border-2 border-primary/40 flex items-center justify-center text-primary shadow-md relative shrink-0 group-hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-[24px]">
                    school
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-text-primary tracking-tight">
                    Ph.D. Doctorate
                  </span>
                  <span className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Distributed Computing
                  </span>
                </div>
              </div>

              {/* Badge 2: BNI Madurai Leadership */}
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full bg-slate-surface border-2 border-accent-gold/40 flex items-center justify-center text-accent-gold shadow-md relative shrink-0 group-hover:border-accent-gold transition-colors">
                  <span className="material-symbols-outlined text-[24px]">
                    military_tech
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-text-primary tracking-tight">
                    BNI Gold Club
                  </span>
                  <span className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    Regional Leadership Council
                  </span>
                </div>
              </div>

              {/* Badge 3: SSRG & Enterprise AI */}
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full bg-indigo-500/15 border-2 border-indigo-300/60 flex items-center justify-center text-indigo-200 shadow-[0_0_18px_var(--portfolio-glow-indigo-strong)] relative shrink-0 group-hover:border-indigo-200 transition-colors">
                  <span
                    className="material-symbols-outlined text-[24px]"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    verified
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-text-primary tracking-tight">
                    SSRG Managing Editor
                  </span>
                  <span className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                    10,000+ Research Papers
                  </span>
                </div>
              </div>
            </div>
          </div>
          </Reveal>
        </div>

        {/* Right Column: Prominent CEO Portrait */}
        <Reveal delay={140} className="lg:col-span-5">
        <div className="relative flex justify-center lg:justify-end items-end">
          <div className="absolute -top-10 right-4 w-72 h-72 bg-primary-container/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute bottom-0 right-10 w-64 h-64 bg-secondary/15 rounded-full blur-2xl pointer-events-none -z-10"></div>

          <div className="relative w-full max-w-md executive-card rounded-2xl p-3 pb-0 border border-slate-800/80 group overflow-hidden shadow-2xl ring-1 ring-white/10 hover:ring-cyan-400/30 transition-all duration-300">
            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden">
              <img
                className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
                alt="Executive portrait of Dr. S. K."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHt-GFa9dNcxzSQIPTzFtGZugzZXCsvmWUvaqptV3qQcHQQYDqNzfMo7KKVdXQkA80dq9Nn4yb-_AlK94JMjQDCyVXNLPSrJs8y1rPtrLu7C7EuDrAnm3keIkJSnYgXalwhTBmHAPamsx5UZK_L4PJ0d359cuEDwQstjoUbJJDsHmNdpGtFtBjOu9RNrveJRQbHvZyhCDT77BNJcKE43ohJGvXLQDTWIc-L3795cw"
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-obsidian-base via-obsidian-base/60 to-transparent"></div>
            </div>
          </div>
        </div>
        </Reveal>
      </div>
      </div>
    </section>
  )
}
