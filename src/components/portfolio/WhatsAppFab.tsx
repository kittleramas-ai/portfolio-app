import { cn } from '../../routes/lib/utils'

/**
 * Placeholder WhatsApp deep link. Swap the number for the real one.
 * wa.me expects a country code with no `+`, spaces or dashes.
 */
const WHATSAPP_NUMBER = '919000000000'

const WHATSAPP_MESSAGE =
  "Hello Dr. Surendiran, I'd like to discuss a collaboration."

const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}`

/** WhatsApp glyph, 24x24 (brand mark path). */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.896 9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.585 0 11.946-5.336 11.949-11.896a11.82 11.82 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

/**
 * Fixed WhatsApp button, pinned to the bottom-right corner.
 *
 * Must be rendered OUTSIDE `SmoothProvider` — GSAP ScrollSmoother transforms
 * its content subtree, and a transformed ancestor turns `position: fixed`
 * into scroll-relative positioning (same reason the Navbar sits outside).
 */
export function WhatsAppFab({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8',
        'print:hidden',
        className,
      )}
    >
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
        className={cn(
          'group relative flex size-14 items-center justify-center rounded-full sm:size-16',
          'bg-[#25D366] text-white',
          'shadow-[0_8px_25px_-4px_rgba(37,211,102,0.55)]',
          'ring-1 ring-white/70',
          'transition-[transform,box-shadow,background-color] duration-300 ease-out',
          'hover:scale-110 hover:bg-[#20bd5a] hover:shadow-[0_10px_30px_-4px_rgba(37,211,102,0.7)]',
          'active:scale-95',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400',
          'motion-reduce:transition-none motion-reduce:hover:scale-100',
        )}
      >
        <WhatsAppGlyph className="size-7 drop-shadow-sm sm:size-8" />

        <span
          className={cn(
            'pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 translate-x-1',
            'whitespace-nowrap rounded-lg border border-slate-border bg-obsidian-base/90 px-3 py-1.5',
            'font-mono-metric text-[12px] font-semibold text-text-primary shadow-xl backdrop-blur-sm',
            'opacity-0 transition-all duration-200',
            'group-hover:translate-x-0 group-hover:opacity-100',
            'group-focus-visible:translate-x-0 group-focus-visible:opacity-100',
            'motion-reduce:transition-none',
          )}
        >
          Chat on WhatsApp
        </span>
      </a>
    </div>
  )
}
