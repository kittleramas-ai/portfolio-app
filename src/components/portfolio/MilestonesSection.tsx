import { CountUp } from './CountUp'
import { Reveal } from './Reveal'

export function MilestonesSection() {
  return (
    <section
      className="border-y border-slate-border bg-obsidian-base relative z-20 section-hairline backdrop-blur-sm"
      id="milestones"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-border">
          {/* Metric 1: PROFESSIONALS */}
          <div className="py-12 lg:py-16 px-6 lg:px-10 flex flex-col justify-between group hover:bg-slate-surface/60 transition-colors duration-300">
            <div className="text-[12px] font-mono-metric text-text-tertiary tracking-[0.22em] uppercase mb-8">
              PROFESSIONALS
            </div>
            <div className="my-auto">
              <div
                className="flex items-baseline tracking-tight font-extrabold text-text-primary"
                style={{
                  fontFamily: 'Anton, "Bebas Neue", "Space Grotesk", sans-serif',
                }}
              >
                <CountUp
                  target={50}
                  className="text-[56px] sm:text-[68px] lg:text-[76px] leading-none text-text-primary"
                />
                <span className="text-[44px] sm:text-[54px] lg:text-[62px] leading-none text-text-tertiary ml-0.5 select-none font-sans font-light">
                  +
                </span>
              </div>
            </div>
            <div className="text-[12px] font-mono-metric text-text-tertiary/80 tracking-wide mt-8 lowercase">
              infodazz team <span className="mx-1.5 text-text-tertiary/50">·</span>{' '}
              trichy • madurai • karaikudi • kumbakonam
            </div>
          </div>

          {/* Metric 2: VENTURES */}
          <div className="py-12 lg:py-16 px-6 lg:px-10 flex flex-col justify-between group hover:bg-slate-surface/60 transition-colors duration-300">
            <div className="text-[12px] font-mono-metric text-text-tertiary tracking-[0.22em] uppercase mb-8">
              VENTURES FOUNDED
            </div>
            <div className="my-auto">
              <div
                className="flex items-baseline tracking-tight font-extrabold text-text-primary"
                style={{
                  fontFamily: 'Anton, "Bebas Neue", "Space Grotesk", sans-serif',
                }}
              >
                <CountUp
                  target={4}
                  className="text-[56px] sm:text-[68px] lg:text-[76px] leading-none text-text-primary"
                />
              </div>
            </div>
            <div className="text-[12px] font-mono-metric text-text-tertiary/80 tracking-wide mt-8 lowercase">
              infodazz <span className="mx-1.5 text-text-tertiary/50">·</span> kittle{' '}
              <span className="mx-1.5 text-text-tertiary/50">·</span> seventh sense{' '}
              <span className="mx-1.5 text-text-tertiary/50">·</span> kaster trust
            </div>
          </div>

          {/* Metric 3: INTERNATIONAL JOURNALS */}
          <div className="py-12 lg:py-16 px-6 lg:px-10 flex flex-col justify-between group hover:bg-slate-surface/60 transition-colors duration-300">
            <div className="text-[12px] font-mono-metric text-text-tertiary tracking-[0.22em] uppercase mb-8">
              INTERNATIONAL JOURNALS
            </div>
            <div className="my-auto">
              <div
                className="flex items-baseline tracking-tight font-extrabold text-text-primary"
                style={{
                  fontFamily: 'Anton, "Bebas Neue", "Space Grotesk", sans-serif',
                }}
              >
                <CountUp
                  target={30}
                  className="text-[56px] sm:text-[68px] lg:text-[76px] leading-none text-text-primary"
                />
                <span className="text-[44px] sm:text-[54px] lg:text-[62px] leading-none text-text-tertiary ml-0.5 select-none font-sans font-light">
                  +
                </span>
              </div>
            </div>
            <div className="text-[12px] font-mono-metric text-text-tertiary/80 tracking-wide mt-8 lowercase">
              seventh sense <span className="mx-1.5 text-text-tertiary/50">·</span> research
              publishing platform
            </div>
          </div>

          {/* Metric 4: SCOPUS INDEXED */}
          <div className="py-12 lg:py-16 px-6 lg:px-10 flex flex-col justify-between group hover:bg-slate-surface/60 transition-colors duration-300">
            <div className="text-[12px] font-mono-metric text-text-tertiary tracking-[0.22em] uppercase mb-8">
              SCOPUS INDEXED
            </div>
            <div className="my-auto">
              <div
                className="flex items-baseline tracking-tight font-extrabold text-text-primary"
                style={{
                  fontFamily: 'Anton, "Bebas Neue", "Space Grotesk", sans-serif',
                }}
              >
                <CountUp
                  target={5}
                  className="text-[56px] sm:text-[68px] lg:text-[76px] leading-none text-text-primary"
                />
                <span className="text-[44px] sm:text-[54px] lg:text-[62px] leading-none text-text-tertiary ml-0.5 select-none font-sans font-light">
                  +
                </span>
              </div>
            </div>
            <div className="text-[12px] font-mono-metric text-text-tertiary/80 tracking-wide mt-8 lowercase">
              scopus journals <span className="mx-1.5 text-text-tertiary/50">·</span>{' '}
              academic collaboration support
            </div>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  )
}
