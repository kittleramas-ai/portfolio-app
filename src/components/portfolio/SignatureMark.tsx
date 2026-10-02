import signatureDark from '../../asserts/signature-dark.png'
import { cn } from '../../routes/lib/utils'

/**
 * Signature wordmark.
 *
 * A single real ink asset (`signature-dark.png`, near-black #071a12 strokes on
 * full transparency) plus a CSS `invert()` for the dark theme, rather than
 * shipping a second near-identical white PNG. Inverting dark ink yields clean
 * white ink and keeps the exact same alpha channel, so the strokes stay soft
 * and natural in both themes.
 *
 * This is deliberately a filter rather than a second asset: two separately
 * exported PNGs drifted apart in intrinsic aspect ratio (3.658:1 vs 3:1) and
 * in alpha density, so the mark visibly jumped size and weight when the theme
 * toggled. One asset removes that class of bug entirely.
 *
 * Intrinsic ratio of the asset is 1262x345 = 3.658:1. Callers set an explicit
 * `height` (via className) and `width` is left to `auto`, so the mark always
 * scales from its true proportions. The `width`/`height` attributes below are
 * the intrinsic size, used only to reserve layout space before the image
 * decodes and to avoid CLS.
 */
export function SignatureMark({
  className,
  width = 1262,
  height = 345,
}: {
  className?: string
  width?: number
  height?: number
}) {
  return (
    <img
      src={signatureDark}
      alt="Dr. R. Surendiran"
      width={width}
      height={height}
      decoding="async"
      className={cn(
        'h-auto w-auto select-none',
        // Dark ink -> white ink. `invert(1)` is enough for a near-black asset;
        // the hue-rotate counteracts the hue shift invert introduces on any
        // residual colour in the anti-aliased edges.
        'dark:invert dark:hue-rotate-180',
        className,
      )}
    />
  )
}
