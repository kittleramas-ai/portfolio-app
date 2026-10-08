import { Reveal } from './Reveal'
import { AnimatedText } from './AnimatedText'
import { DEFAULT_SITE_SETTINGS } from '../../../admin/server/settings-schema'
import type { QuoteSettings } from '../../../admin/server/settings-schema'

const DEFAULT_QUOTE = DEFAULT_SITE_SETTINGS.quote

export function QuoteSection({
  settings = DEFAULT_QUOTE,
}: {
  /** Editable copy, supplied by the route from the database. */
  settings?: QuoteSettings
}) {
  return (
    <section
      className="py-28 md:py-36 px-6 md:px-12 relative overflow-hidden border-b border-slate-border"
      style={{
        background:
          'radial-gradient(800px 400px at 20% 10%, var(--portfolio-quote-glint), transparent 60%), radial-gradient(700px 380px at 85% 90%, var(--portfolio-quote-shadow), transparent 60%), var(--portfolio-quote-bg)',
      }}
    >
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <AnimatedText
          as="blockquote"
          split="words"
          mode="scrub"
          stagger={0.06}
          className="tracking-tight leading-[1.18] md:leading-[1.15] text-2xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          <span className="text-teal-100/70 inline">
            {settings.quoteLine1}
          </span>
          <span className="text-white inline">
            {' '}
            {settings.quoteLine2}
          </span>
        </AnimatedText>
        <Reveal>
        <div className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-white/80 shadow-lg shrink-0">
            <img
              alt={settings.portraitAlt}
              width={56}
              height={56}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover grayscale contrast-125"
              src={settings.portraitUrl}
            />
          </div>
          <div className="text-center sm:text-left">
            <div
              className="text-[16px] md:text-[18px] font-bold text-white leading-snug"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              {settings.attribution}
            </div>
            <div className="text-[12px] md:text-[13px] text-teal-100/80 font-mono-metric font-medium tracking-wide mt-0.5">
              {settings.roles}
            </div>
          </div>
        </div>
        <p className="mt-6 text-[13px] md:text-sm text-teal-100/70 font-mono-metric leading-relaxed max-w-2xl mx-auto">
          {settings.vision}
        </p>
        </Reveal>
      </div>
    </section>
  )
}