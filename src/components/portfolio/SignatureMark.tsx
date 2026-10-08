import signatureDark from '../../asserts/signature-dark.png'
import { cn } from '../../routes/lib/utils'

/**
 * Signature wordmark.
 *
 * Source priority:
 *   1. an admin upload for the `signature` slot (from the public loader data)
 *   2. the bundled `signature-dark.png` fallback, so the site is never broken
 *
 * The bundled fallback is a single real ink asset (near-black #071a12 strokes on
 * full transparency) plus a CSS `invert()` for the dark theme, rather than
 * shipping a second near-identical white PNG. Inverting dark ink yields clean
 * white ink and keeps the exact same alpha channel, so the strokes stay soft
 * and natural in both themes.
 *
 * The filter is deliberately a filter rather than a second asset: two
 * separately exported PNGs drifted apart in intrinsic aspect ratio (3.658:1 vs
 * 3:1) and in alpha density, so the mark visibly jumped size and weight when
 * the theme toggled. One asset removes that class of bug entirely.
 *
 * Uploaded images are NOT inverted: a manager-supplied signature may already be
 * light or dark, and flipping it would be wrong half the time. The filter is
 * applied only to the bundled fallback, which is known to be dark ink.
 */
export function SignatureMark({
  className,
  width = 1262,
  height = 345,
  src,
  alt = 'Dr. R. Surendiran',
}: {
  className?: string
  width?: number
  height?: number
  /** Admin-uploaded signature. Falls back to the bundled asset. */
  src?: string | null
  alt?: string
}) {
  const isUpload = Boolean(src)
  return (
    <img
      src={src ?? signatureDark}
      alt={alt}
      width={width}
      height={height}
      decoding="async"
      style={{ maxWidth: '180px', maxHeight: '50px', objectFit: 'contain' }}
      className={cn(
        'h-auto w-auto max-w-[180px] max-h-[50px] select-none',
        // Only the bundled asset needs dark -> white conversion.
        !isUpload && 'dark:invert dark:hue-rotate-180',
        className,
      )}
    />
  )
}
