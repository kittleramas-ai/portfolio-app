import { CountUp } from './CountUp'
import { Reveal } from './Reveal'

export function MilestonesSection() {
  return (
    <section
      className="border-y border-slate-800/80 bg-slate-950/80 relative z-20 section-hairline backdrop-blur-sm"
      id="milestones"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80">
          {/* Metric 1: UPTIME */}
          <div className="py-12 lg:py-16 px-6 lg:px-10 flex flex-col justify-between group hover:bg-white/[0.02] transition-colors duration-300">
            <div className="text-[12px] font-mono-metric text-text-tertiary tracking-[0.22em] uppercase mb-8">
              UPTIME
            </div>
            <div className="my-auto">
              <div
                className="flex items-baseline tracking-tight font-extrabold text-white"
                style={{
                  fontFamily: 'Anton, "Bebas Neue", "Space Grotesk", sans-serif',
                }}
              >
                <CountUp
                  target={100}
                  className="text-[56px] sm:text-[68px] lg:text-[76px] leading-none text-white"
                />
                <span className="text-[44px] sm:text-[54px] lg:text-[62px] leading-none text-white/40 ml-0.5 select-none font-sans font-light">
                  %
                </span>
              </div>
            </div>
            <div className="text-[12px] font-mono-metric text-text-tertiary/80 tracking-wide mt-8 lowercase">
              since deployment <span className="mx-1.5 text-white/20">·</span>{' '}
              zero-latency
            </div>
          </div>

          {/* Metric 2: TRANSACTIONS */}
          <div className="py-12 lg:py-16 px-6 lg:px-10 flex flex-col justify-between group hover:bg-white/[0.02] transition-colors duration-300">
            <div className="text-[12px] font-mono-metric text-text-tertiary tracking-[0.22em] uppercase mb-8">
              TRANSACTIONS
            </div>
            <div className="my-auto">
              <div
                className="flex items-baseline tracking-tight font-extrabold text-white"
                style={{
                  fontFamily: 'Anton, "Bebas Neue", "Space Grotesk", sans-serif',
                }}
              >
                <span className="text-[40px] sm:text-[50px] lg:text-[56px] leading-none text-accent-gold/80 mr-1 select-none font-sans">
                  ₹
                </span>
                <CountUp
                  target={120}
                  className="text-[56px] sm:text-[68px] lg:text-[76px] leading-none text-white"
                />
                <span className="text-[32px] sm:text-[42px] lg:text-[48px] leading-none text-white/80 font-bold ml-1 font-headline-sm">
                  Cr
                </span>
                <span className="text-[44px] sm:text-[54px] lg:text-[62px] leading-none text-white/40 ml-0.5 select-none font-sans font-light">
                  +
                </span>
              </div>
            </div>
            <div className="text-[12px] font-mono-metric text-text-tertiary/80 tracking-wide mt-8 lowercase">
              cumulative <span className="mx-1.5 text-white/20">·</span> bni regional
              network
            </div>
          </div>

          {/* Metric 3: MONTHLY ACTIVE */}
          <div className="py-12 lg:py-16 px-6 lg:px-10 flex flex-col justify-between group hover:bg-white/[0.02] transition-colors duration-300">
            <div className="text-[12px] font-mono-metric text-text-tertiary tracking-[0.22em] uppercase mb-8">
              MONTHLY ACTIVE
            </div>
            <div className="my-auto">
              <div
                className="flex items-baseline tracking-tight font-extrabold text-white"
                style={{
                  fontFamily: 'Anton, "Bebas Neue", "Space Grotesk", sans-serif',
                }}
              >
                <CountUp
                  target={500}
                  className="text-[56px] sm:text-[68px] lg:text-[76px] leading-none text-white"
                />
                <span className="text-[44px] sm:text-[54px] lg:text-[62px] leading-none text-white/40 ml-0.5 select-none font-sans font-light">
                  +
                </span>
              </div>
            </div>
            <div className="text-[12px] font-mono-metric text-text-tertiary/80 tracking-wide mt-8 lowercase">
              active leaders <span className="mx-1.5 text-white/20">·</span> across
              tamil nadu
            </div>
          </div>

          {/* Metric 4: ACCOUNTS / CITATIONS */}
          <div className="py-12 lg:py-16 px-6 lg:px-10 flex flex-col justify-between group hover:bg-white/[0.02] transition-colors duration-300">
            <div className="text-[12px] font-mono-metric text-text-tertiary tracking-[0.22em] uppercase mb-8">
              ACCOUNTS
            </div>
            <div className="my-auto">
              <div
                className="flex items-baseline tracking-tight font-extrabold text-white"
                style={{
                  fontFamily: 'Anton, "Bebas Neue", "Space Grotesk", sans-serif',
                }}
              >
                <CountUp
                  target={10000}
                  format="comma"
                  className="text-[56px] sm:text-[68px] lg:text-[76px] leading-none text-white"
                />
                <span className="text-[44px] sm:text-[54px] lg:text-[62px] leading-none text-white/40 ml-0.5 select-none font-sans font-light">
                  +
                </span>
              </div>
            </div>
            <div className="text-[12px] font-mono-metric text-text-tertiary/80 tracking-wide mt-8 lowercase">
              open access <span className="mx-1.5 text-white/20">·</span> ssrg
              journals global
            </div>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  )
}
