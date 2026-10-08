import { Fragment } from 'react'
import { CountUp } from './CountUp'
import { Reveal } from './Reveal'
import { DEFAULT_SITE_SETTINGS } from '../../../admin/server/settings-schema'
import type { MilestonesSettings } from '../../../admin/server/settings-schema'

const DEFAULT_MILESTONES = DEFAULT_SITE_SETTINGS.milestones

/**
 * Every metric cell shared this exact wrapper className before the cells were
 * data-driven, so it lives in one const rather than being repeated per metric.
 */
const CELL_CLASS =
  'py-12 lg:py-16 px-6 lg:px-10 flex flex-col justify-between group hover:bg-slate-surface/60 transition-colors duration-300'

export function MilestonesSection({
  settings = DEFAULT_MILESTONES,
}: {
  /** Editable copy, supplied by the route from the database. */
  settings?: MilestonesSettings
}) {
  return (
    <section
      className="border-y border-slate-border bg-obsidian-base relative z-20 section-hairline backdrop-blur-sm"
      id="milestones"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-border">
          {settings.metrics.map((m) => (
            <div key={m.id} className={CELL_CLASS}>
              <div className="text-[12px] font-mono-metric text-text-tertiary tracking-[0.22em] uppercase mb-8">
                {m.label}
              </div>
              <div className="my-auto">
                <div
                  className="flex items-baseline tracking-tight font-extrabold text-text-primary"
                  style={{
                    fontFamily: 'Anton, "Bebas Neue", "Space Grotesk", sans-serif',
                  }}
                >
                  <CountUp
                    target={m.value}
                    className="text-[56px] sm:text-[68px] lg:text-[76px] leading-none text-text-primary"
                  />
                  {m.suffix ? (
                    <span className="text-[44px] sm:text-[54px] lg:text-[62px] leading-none text-text-tertiary ml-0.5 select-none font-sans font-light">
                      {m.suffix}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="text-[12px] font-mono-metric text-text-secondary tracking-wide mt-8 lowercase">
                {/* The middle-dot separators are their own dimmer spans, each
                    padded with a space, rather than part of the footnote text.
                    Splitting on the character means a manager can retype a
                    footnote without losing that treatment. */}
                {m.footnote.split(' · ').map((part, i) => (
                  <Fragment key={`${m.id}-fn-${i}`}>
                    {i > 0 ? (
                      <>
                        {' '}
                        <span className="mx-1.5 text-text-tertiary">·</span>{' '}
                      </>
                    ) : null}
                    {part}
                  </Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
        </Reveal>
      </div>
    </section>
  )
}