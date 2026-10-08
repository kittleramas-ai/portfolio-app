import { Reveal } from './Reveal'
import { DEFAULT_SITE_SETTINGS } from '../../../admin/server/settings-schema'
import type { BooksSettings } from '../../../admin/server/settings-schema'

const DEFAULT_BOOKS = DEFAULT_SITE_SETTINGS.books

/* Placeholder shelf, now editable in the admin — swap in Dr. R. Surendiran's
   actual titles in the admin panel and drop this note. */

/* Fixed inks so cover type stays legible on both paper and obsidian covers,
   in either theme. */
const COVER_INK = {
  dark: {
    title: 'text-accent-gold',
    author: 'text-[rgba(245,239,224,0.72)]',
    rule: 'bg-[rgba(212,175,55,0.6)]',
    spine: 'bg-white/10',
    wash: 'from-black/25',
  },
  light: {
    title: 'text-[#071A12]',
    author: 'text-[rgba(7,26,18,0.62)]',
    rule: 'bg-[rgba(140,109,31,0.55)]',
    spine: 'bg-black/10',
    wash: 'from-black/[0.06]',
  },
} as const

/* The six cover swatches. The editable `cover` enum is resolved here, so the
   class strings stay in code and a content manager cannot break the palette. */
const COVER_CLASS = {
  primary: 'bg-primary-container',
  slate900: 'bg-slate-900',
  slate800: 'bg-slate-800',
  slate700: 'bg-slate-700',
  slate100: 'bg-slate-100',
  slate300: 'bg-slate-300',
} as const

/* Books fanned out in the feature block — the three most-referenced. */
const FAN_ROTATION = ['-rotate-6 -translate-y-4', 'rotate-1', 'rotate-6 translate-y-5']

export function BooksSection({
  settings = DEFAULT_BOOKS,
}: {
  /** Shelf copy, cover choices and the feature block. Managed in the admin panel. */
  settings?: BooksSettings
}) {
  const { books, featuredIds, featuredQuote } = settings
  /* Featured books are stored by id, so one deleted in the admin drops out of
     the fan instead of shifting the remaining covers along. */
  const fanned = featuredIds.flatMap((id) => {
    const book = books.find((candidate) => candidate.id === id)
    return book ? [book] : []
  })

  return (
    <section
      className="relative w-full border-t border-slate-border/50 py-24 sm:py-32"
      id="books"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
        <Reveal>
          <div className="mb-14">
            <span className="island-kicker mb-4 block">{settings.kicker}</span>
            <h2 className="font-headline-lg text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
              {settings.heading}
            </h2>
          </div>
        </Reveal>

        {/* Feature block — fanned covers left, headline + copy right */}
        <Reveal delay={110}>
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
            <div className="relative flex justify-center py-6 md:py-0">
              <div className="relative h-[300px] w-[260px] sm:h-[340px] sm:w-[300px]">
                {fanned.map((book, idx) => {
                  const ink = COVER_INK[book.tone]
                  return (
                    <div
                      key={book.id}
                      className={`absolute left-1/2 top-1/2 flex h-[240px] w-[168px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center overflow-hidden rounded-lg border border-slate-border/60 px-4 text-center shadow-[0_24px_48px_-18px_rgba(7,26,18,0.6)] sm:h-[270px] sm:w-[190px] ${FAN_ROTATION[idx]} ${COVER_CLASS[book.cover]}`}
                      style={{ zIndex: idx }}
                    >
                      {book.coverImageUrl ? (
                        <img
                          src={book.coverImageUrl}
                          alt={book.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <>
                          <div
                            className={`pointer-events-none absolute inset-0 bg-gradient-to-tr ${ink.wash} to-transparent`}
                          />
                          <div
                            className={`pointer-events-none absolute left-3 top-0 bottom-0 w-px ${ink.spine}`}
                          />
                          <span
                            className={`absolute left-1/2 top-6 h-px w-9 -translate-x-1/2 ${ink.rule}`}
                          />
                          <span
                            className={`relative z-10 font-serif text-base font-bold leading-tight ${ink.title}`}
                          >
                            {book.title}
                          </span>
                          <span
                            className={`relative z-10 mt-2 font-mono-metric text-[9px] uppercase tracking-[0.18em] ${ink.author}`}
                          >
                            {book.author}
                          </span>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Handwritten annotation */}
              <span className="font-signature absolute -top-2 right-0 rotate-[-6deg] text-3xl leading-none text-accent-gold sm:-top-4 sm:right-6 sm:text-4xl">
                {settings.annotation}
              </span>
            </div>

            <div className="text-center md:text-left">
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[44px] leading-none text-[rgba(201,162,39,0.45)]"
              >
                format_quote
              </span>
              <blockquote className="mt-3 font-serif text-[26px] italic leading-[1.25] text-text-primary sm:text-3xl lg:text-[2.05rem]">
                {featuredQuote.text}
              </blockquote>
              <div className="mt-7 flex items-center justify-center gap-3 md:justify-start">
                <span className="h-px w-10 shrink-0 bg-[rgba(212,175,55,0.55)]" />
                <cite className="not-italic">
                  <span className="block font-headline-md text-sm font-bold text-text-primary">
                    {featuredQuote.title}
                  </span>
                  <span className="mt-1 block font-mono-metric text-[11px] uppercase tracking-[0.18em] text-text-tertiary">
                    {featuredQuote.author}
                  </span>
                </cite>
              </div>
              <a
                className="mt-9 inline-flex items-center gap-2 rounded-full bg-primary-container px-7 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90"
                href={settings.ctaHref}
              >
                {settings.ctaLabel}
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </a>
            </div>
          </div>
        </Reveal>

        {/* The shelf */}
        <div className="mt-20" id="reading-shelf">
          <Reveal>
            <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 border-b border-slate-border pb-5">
              <h3 className="font-headline-md text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
                {settings.shelfHeading}
              </h3>
              <span className="font-mono-metric text-[11px] uppercase tracking-[0.2em] text-text-tertiary">
                {books.length} titles
              </span>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {books.map((book, idx) => {
              const ink = COVER_INK[book.tone]
              return (
                <Reveal key={book.id} delay={idx * 70}>
                  <div className="executive-card group flex h-full gap-4 rounded-2xl p-5 sm:gap-5 sm:p-6">
                    <div
                      className={`relative flex h-[120px] w-[84px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg border border-slate-border/60 px-2 text-center shadow-lg ${COVER_CLASS[book.cover]}`}
                    >
                      {book.coverImageUrl ? (
                        <img
                          src={book.coverImageUrl}
                          alt={book.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <>
                          <div
                            className={`pointer-events-none absolute inset-0 bg-gradient-to-tr ${ink.wash} to-transparent`}
                          />
                          <div
                            className={`pointer-events-none absolute left-2 top-0 bottom-0 w-px ${ink.spine}`}
                          />
                          <span
                            className={`relative z-10 font-serif text-[11px] font-bold leading-tight ${ink.title}`}
                          >
                            {book.title}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="font-mono-metric text-[10px] uppercase tracking-[0.18em] text-accent-gold">
                        {book.subject}
                      </span>
                      <h4 className="mt-2 font-headline-md text-[15px] font-bold leading-snug text-text-primary transition-colors group-hover:text-accent-gold sm:text-base">
                        {book.title}
                      </h4>
                      <p className="mt-1 font-mono-metric text-[11px] text-text-tertiary">
                        {book.author}
                      </p>
                      <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
                        {book.note}
                      </p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
