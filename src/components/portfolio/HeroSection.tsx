import { Reveal } from './Reveal'
import { AnimatedText } from './AnimatedText'
import heroImage from '../../asserts/hero-standing-cutout.png'

/* Shared shell — every section uses max-w-7xl + px-6/md:px-12, so the hero's
   left/right edges line up with the content below it. */

/* The oversized "D" that opens the name. A gold gradient clipped to the glyph
   stands in for a 3D letterform render: it needs no extra asset, scales with
   the viewport, and picks up the same champagne-bronze ramp as the palette.
   Sized in vw (not vh) so the letterform is driven by viewport WIDTH, which is
   the axis it actually competes on: it shares a horizontal row with the figure
   and the name, so a tall/narrow phone would otherwise render a D far too wide
   for its column. Anton's visual cap is ~0.73em and the line box is 0.78em, so
   the painted height is ~0.57 x font-size. */
const D_CLASS =
  'block shrink-0 bg-clip-text font-display uppercase leading-[0.78] tracking-[-0.045em] text-[clamp(5rem,23vw,12rem)] lg:text-[clamp(8rem,40vh,28rem)]'

/* Full-length standing figure, grounded on the same baseline as the D so he
   reads as leaning against the letterform rather than floating in front of it.
   The cut-out is 177x423 (0.418:1), so the height drives the width and `w-auto`
   is left to preserve that ratio.
   Width-scoped (vw) for the same reason as the D — on a 375px phone a vh-based
   height of 28vh is only ~187px, which makes him small next to the letterform. */
const FIGURE_CLASS =
  'relative z-10 -mr-[1.5vw] h-[clamp(9.5rem,50vw,22rem)] w-auto shrink-0 object-contain object-bottom lg:h-[clamp(11rem,33vh,23rem)]'

/* Shared champagne-bronze ramp. The glyphs are filled with this via
   background-clip:text, so the D and the name are lit from the same angle and
   read as one metallic treatment rather than two unrelated gold colours.
   Stops run light->dark top-left to bottom-right, matching the light source on
   the reference letterform. */
const GOLD_RAMP =
  'linear-gradient(150deg, #fdf3d4 0%, #f0d98d 14%, #d4af37 42%, #b08d2e 66%, #8a6a1c 88%, #6f5416 100%)'

const D_STYLE = {
  backgroundImage: GOLD_RAMP,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  // Shadow tuned for the dark hero backdrop. Kept tight and slightly offset so
  // it reads as the letterform casting onto the scene, not a blurred outline.
  filter: 'drop-shadow(0 8px 14px rgba(4,16,11,0.45))',
} as React.CSSProperties

/* "R. SURENDIRAN". Set in solid gold rather than a gradient fill: this text is
   animated by GSAP SplitText, which wraps each word in its own transformed
   element. background-clip:text on an ancestor of transformed descendants is
   fragile, and because the fill relies on `color:transparent`, a clip that
   fails to resolve leaves the name invisible rather than merely ungradiented.
   The gradient treatment stays on the static D, where it is safe. */
const NAME_STYLE = {
  color: '#C9A227',
  // Warm highlight above, bronze shade below — fakes the bevel of the
  // letterform without depending on a gradient fill.
  textShadow:
    '0 1px 0 rgba(255,255,255,0.28), 0 -1px 0 rgba(90,68,16,0.35), 0 4px 10px rgba(4,16,11,0.4)',
} as React.CSSProperties

/* "R. SURENDIRAN" needs ~5.46em of set size (11 caps @0.46em + period + space).
   That figure is the whole reason the unit has to change per breakpoint:

   - Below lg the name is width-constrained and sits on its OWN row beneath the
     lockup, so 15vw keeps it inside a 327px content box on a 375px phone
     (15vw of 375 = 56px -> ~306px wide, just inside the box).
   - From lg the name shares a single non-wrapping row with the D, and the
     composition is balanced by height rather than width, so vh takes over and
     keeps the name locked to the D's cap height at any aspect ratio.

   Using vh at both sizes overflowed the viewport by ~292px on an iPhone SE. */
const NAME_CLASS =
  'block font-display uppercase leading-[0.82] tracking-[-0.012em] text-[clamp(1.4rem,15vw,4.5rem)] lg:text-[clamp(1.35rem,15vh,10rem)]'

/**
 * Hero — editorial lockup: a full-length standing figure leaning against an
 * oversized gold "D", with the name set to the right of the letterform.
 *
 * The figure and the D share one `items-end` flex row rather than being
 * positioned independently. That single constraint is what makes the
 * composition work: bottom-aligning them puts his feet on the same baseline as
 * the D, so the letterform reads as the thing he is standing against. A negative
 * right margin pulls his shoulder over the D's left stem, and `z-10` keeps him
 * painted in front of it. Absolutely positioning either one would break that
 * shared baseline and reintroduce the floating-figure problem.
 *
 * He leads the row in the DOM so on narrow viewports he sits under the name
 * rather than beside it, where there is no room for a 0.418:1 figure.
 */
export function HeroSection() {
  return (
    <section
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden border-b border-slate-border/50 section-hairline lg:min-h-[96vh]"
      id="hero"
    >
      <div className="relative z-0 mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pt-24 sm:pt-28 md:px-12 lg:pt-32">
        {/* Name lockup. h1 is labelled with the full name for assistive tech and
            the visual pieces are hidden, so it reads "Dr. R. Surendiran"
            rather than "D" + "R. Surendiran". */}
        <h1
          aria-label="Dr. R. Surendiran"
          className="flex flex-wrap items-end gap-x-1 sm:gap-x-2 lg:flex-nowrap lg:gap-x-0"
        >
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            width={177}
            height={423}
            decoding="async"
            className={FIGURE_CLASS}
          />

          <span aria-hidden="true" className={D_CLASS} style={D_STYLE}>
            D
          </span>

          {/* basis-full forces the name onto its own row below lg, so the D and
              the figure never have to share horizontal space with a 12-glyph
              word. lg:basis-auto returns it to the single-row lockup. */}
          <span
            aria-hidden="true"
            className="w-full min-w-0 basis-full pb-[0.08em] lg:w-auto lg:flex-1 lg:basis-auto lg:pl-[0.12em]"
          >
            <AnimatedText
              as="span"
              split="words"
              mode="load"
              stagger={0.08}
              duration={1.5}
              y={90}
              ease="elastic.out(1, 0.55)"
              className={NAME_CLASS}
              style={NAME_STYLE}
            >
              R. Surendiran
            </AnimatedText>
          </span>
        </h1>

        {/* Supporting copy. Offset to clear the standing figure on lg so the
            statement aligns under the name instead of colliding with him. */}
        <div className="relative z-20 mt-auto grid w-full grid-cols-1 items-end gap-8 pb-10 sm:gap-10 lg:grid-cols-12 lg:gap-6 lg:pb-12">
          <div className="order-2 flex flex-col items-center gap-4 text-center sm:gap-5 lg:order-1 lg:col-span-5 lg:col-start-7 lg:items-start lg:text-left">
            <Reveal delay={100}>
              <p className="max-w-xs text-xl font-bold leading-tight text-text-primary sm:text-2xl lg:text-[1.75rem]">
                Build the business{' '}
                <span className="text-text-tertiary">you&apos;ve always</span>{' '}
                <span className="text-primary font-light">dreamed about...</span>
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                <a
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-container px-6 py-3 text-base font-semibold text-white shadow-[0_0_24px_var(--portfolio-glow-cta)] transition-opacity hover:opacity-90"
                  href="#ventures"
                >
                  Explore Solutions
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </a>
                <a
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-border px-6 py-3 text-base font-semibold text-text-primary transition-colors hover:border-accent-gold hover:text-accent-gold"
                  href="#about"
                >
                  Founder Journey
                </a>
              </div>
            </Reveal>
          </div>

          {/* Counter-statement — hangs off the far right, bottom-aligned with
              the statement block. */}
          <div className="order-3 lg:order-2 lg:col-span-3 lg:col-start-10 lg:flex lg:items-end">
            <Reveal delay={150}>
              <p className="mx-auto max-w-xs text-center text-lg font-semibold leading-snug text-text-secondary sm:text-xl lg:mx-0 lg:text-left lg:text-[1.375rem]">
                <span className="text-primary font-light">...without</span> losing
                yourself in it along{' '}
                <span className="text-text-tertiary">the way.</span>
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
