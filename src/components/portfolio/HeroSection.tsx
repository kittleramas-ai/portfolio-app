import type { CSSProperties } from 'react'
import { ArrowRight } from 'lucide-react'
import { Reveal } from './Reveal'
import heroImage from '../../asserts/background-removed.webp'
import type { HeroSettings } from '../../../admin/server/settings-schema'
import { DEFAULT_SITE_SETTINGS } from '../../../admin/server/settings-schema'
import type { SignatureMedia } from './media-types'

const DEFAULT_HERO = DEFAULT_SITE_SETTINGS.hero

/* Same max-w-7xl + px-6/md:px-12 shell every other section uses, so the
   name's left/right edges line up with the content below it. The font-size
   is capped so "SURENDIRAN" can never grow past the container's content
   box (Anton is ~0.46em per cap, 10 caps => 4.6em of the set size). */
const NAME_CLASS =
  'text-center uppercase leading-[1] tracking-[-0.02em] text-[#C9A227] break-words text-[clamp(2.25rem,15vw,13.5rem)]'
const NAME_STYLE = { fontFamily: 'Anton, "Bebas Neue", sans-serif' }

/* The name is spelled out as words rather than passed through SplitText.
   `--hero-word-index` is what staggers them; `.hero-name-word` owns the motion.
   Written here in the markup instead of split at runtime because a runtime
   split means the words do not exist until GSAP has loaded — which is exactly
   the delay this replaces. See `.hero-name-drop` in styles.css. */
const NAME_WORDS = ['Dr.', 'R.', 'Surendiran'] as const

export function HeroSection({
  settings = DEFAULT_HERO,
  portrait,
}: {
  /** Editable copy, supplied by the route from the database. */
  settings?: HeroSettings
  /** Admin-uploaded portrait; falls back to the bundled asset. */
  portrait?: SignatureMedia | null
}) {
  return (
    <section
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden border-b border-slate-border/50 section-hairline lg:min-h-[96vh]"
      id="hero"
    >
      {/* Name on two lines, behind the portrait. Shares the site's
          max-w-7xl / px-6 md:px-12 shell so it lines up with every other
          section. pt clears the fixed header; each word drops in from
          y=0.42em, staggered by `--hero-word-index`. */}
      <div className="relative z-0 mx-auto w-full max-w-7xl px-6 pt-24 sm:pt-32 md:px-12 lg:pt-32">
        <h1 className={NAME_CLASS} style={NAME_STYLE}>
          {NAME_WORDS.map((word, index) => (
            <span key={word}>
              <span
                className="hero-name-word"
                style={{ '--hero-word-index': index } as CSSProperties}
              >
                {word}
              </span>
              {/* The original split put "Dr. R." on one line and "Surendiran"
                  on the next; the break lives here rather than inside a word
                  so the two lines stay separate inline-block items. */}
              {index === 1 ? <br /> : index === 0 ? ' ' : null}
            </span>
          ))}
        </h1>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-end gap-6 px-6 pb-10 sm:gap-8 md:px-12 lg:grid-cols-12 lg:pb-12">
        {/* Left — statement, actions, proof. Centred on mobile, left-aligned
            from lg up where it sits in its own column. */}
        <div className="order-2 flex flex-col items-center gap-4 text-center sm:gap-5 lg:order-1 lg:col-span-3 lg:items-start lg:text-left">
          <Reveal eager>
            <p className="max-w-xs text-xl font-bold leading-tight text-text-primary sm:text-2xl lg:text-[1.75rem]">
              {settings.statementLine1}{' '}
              <span className="text-text-tertiary">
                {settings.statementLine2}
              </span>{' '}
              <span className="text-primary font-light">
                {settings.statementLine3}
              </span>
            </p>
          </Reveal>

          <Reveal eager>
            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <a
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-container px-6 py-3 text-base font-semibold text-white shadow-[0_0_24px_var(--portfolio-glow-cta)] transition-opacity hover:opacity-90"
                href={settings.ctaPrimaryHref}
              >
                {settings.ctaPrimaryLabel}
                <ArrowRight className="size-[18px]" aria-hidden="true" />
              </a>
              <a
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-border px-6 py-3 text-base font-semibold text-text-primary transition-colors hover:border-accent-gold hover:text-accent-gold"
                href={settings.ctaSecondaryHref}
              >
                {settings.ctaSecondaryLabel}
              </a>
            </div>
          </Reveal>
        </div>

        {/* Centre — portrait, overlapping the name. The frame is driven by the
            cut-out's portrait aspect (4:5) so object-cover crops nothing. */}
        <div className="order-1 flex justify-center lg:order-2 lg:col-span-6 lg:items-end">
          <div className="-mt-[6vw] lg:-mt-[12vw]">
            <div className="relative aspect-[4/5] w-[64vw] max-w-[270px] overflow-hidden bg-transparent sm:w-[46vw] sm:max-w-[300px] lg:w-[22vw] lg:min-w-[240px] lg:max-w-[320px]">
              <picture>
                {portrait?.responsiveSrcSet ? (
                  <source
                    type="image/webp"
                    srcSet={portrait.responsiveSrcSet}
                    sizes="(max-width: 639px) 270px, (max-width: 1023px) 300px, 320px"
                  />
                ) : null}
                <img
                  src={portrait?.url ?? heroImage}
                  srcSet={portrait?.responsiveSrcSet ?? undefined}
                  alt={portrait?.altText || 'Dr. R. Surendiran'}
                  width={portrait?.width ?? 690}
                  height={portrait?.height ?? 814}
                  sizes="(max-width: 639px) 270px, (max-width: 1023px) 300px, 320px"
                  decoding="async"
                  fetchPriority="high"
                  className="block h-full w-full scale-[1.06] bg-transparent object-cover object-center lg:scale-[1.03]"
                  style={{
                    backgroundColor: 'transparent',
                    objectPosition: 'center',
                  }}
                />
              </picture>
            </div>
          </div>
        </div>

        {/* Right — the counter-statement */}
        <div className="order-3 lg:order-3 lg:col-span-3 lg:flex lg:items-center">
          <Reveal eager>
            <p className="mx-auto max-w-xs text-center text-lg font-semibold leading-snug text-text-secondary sm:text-xl lg:mx-0 lg:text-left lg:text-[1.375rem]">
              {settings.counterStatement}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
