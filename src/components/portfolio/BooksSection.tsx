import { Reveal } from './Reveal'

type FavouriteBook = {
  title: string
  author: string
  subject: string
  note: string
  coverColor: string
  /** dark = champagne cover with bronze ink, light = paper cover with obsidian ink */
  tone: 'dark' | 'light'
}

/* Placeholder shelf — swap in Dr. R. Surendiran's actual titles. */
const FAVOURITE_BOOKS: FavouriteBook[] = [
  {
    title: 'The Lean Startup',
    author: 'Eric Ries',
    subject: 'Startups',
    note: 'Validated learning as a way to operate when the market will not hold still.',
    coverColor: 'bg-primary-container',
    tone: 'dark',
  },
  {
    title: 'Zero to One',
    author: 'Peter Thiel',
    subject: 'Strategy',
    note: 'A contrarian case for building something that cannot simply be copied.',
    coverColor: 'bg-slate-900',
    tone: 'dark',
  },
  {
    title: 'The Hard Thing About Hard Things',
    author: 'Ben Horowitz',
    subject: 'Leadership',
    note: 'The unglamorous, honest version of running a company day to day.',
    coverColor: 'bg-slate-700',
    tone: 'dark',
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    subject: 'Decision Science',
    note: 'A research-backed reminder that judgement under risk is a system, not a trait.',
    coverColor: 'bg-slate-800',
    tone: 'dark',
  },
  {
    title: 'The Innovator’s Dilemma',
    author: 'Clayton Christensen',
    subject: 'Innovation',
    note: 'Why good companies get disrupted — and what early warning actually looks like.',
    coverColor: 'bg-slate-100',
    tone: 'light',
  },
  {
    title: 'Good to Great',
    author: 'Jim Collins',
    subject: 'Organisation',
    note: 'The unglamorous disciplines behind firms that made a durable leap.',
    coverColor: 'bg-slate-300',
    tone: 'light',
  },
]

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

/* Books fanned out in the feature block — the three most-referenced. */
const FANNED = [FAVOURITE_BOOKS[0], FAVOURITE_BOOKS[1], FAVOURITE_BOOKS[3]]

/* Pull-quote for the feature block. Verify the wording against your copy of
   the book before publishing — editions paginate differently. */
const FEATURED_QUOTE = {
  text: 'A startup is a human institution designed to create a new product or service under conditions of extreme uncertainty.',
  title: 'The Lean Startup',
  author: 'Eric Ries',
}

const FAN_ROTATION = ['-rotate-6 -translate-y-4', 'rotate-1', 'rotate-6 translate-y-5']

export function BooksSection() {
  return (
    <section
      className="relative w-full border-t border-slate-border/50 py-24 sm:py-32"
      id="books"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
        <Reveal>
          <div className="mb-14">
            <span className="island-kicker mb-4 block">Off the shelf</span>
            <h2 className="font-headline-lg text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
              Favourite Books
            </h2>
          </div>
        </Reveal>

        {/* Feature block — fanned covers left, headline + copy right */}
        <Reveal delay={110}>
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
            <div className="relative flex justify-center py-6 md:py-0">
              <div className="relative h-[300px] w-[260px] sm:h-[340px] sm:w-[300px]">
                {FANNED.map((book, idx) => {
                  const ink = COVER_INK[book.tone]
                  return (
                    <div
                      key={book.title}
                      className={`absolute left-1/2 top-1/2 flex h-[240px] w-[168px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center overflow-hidden rounded-lg border border-slate-border/60 px-4 text-center shadow-[0_24px_48px_-18px_rgba(7,26,18,0.6)] sm:h-[270px] sm:w-[190px] ${FAN_ROTATION[idx]} ${book.coverColor}`}
                      style={{ zIndex: idx }}
                    >
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
                    </div>
                  )
                })}
              </div>

              {/* Handwritten annotation */}
              <span className="font-signature absolute -top-2 right-0 rotate-[-6deg] text-3xl leading-none text-accent-gold sm:-top-4 sm:right-6 sm:text-4xl">
                one of my favourites
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
                {FEATURED_QUOTE.text}
              </blockquote>
              <div className="mt-7 flex items-center justify-center gap-3 md:justify-start">
                <span className="h-px w-10 shrink-0 bg-[rgba(212,175,55,0.55)]" />
                <cite className="not-italic">
                  <span className="block font-headline-md text-sm font-bold text-text-primary">
                    {FEATURED_QUOTE.title}
                  </span>
                  <span className="mt-1 block font-mono-metric text-[11px] uppercase tracking-[0.18em] text-text-tertiary">
                    {FEATURED_QUOTE.author}
                  </span>
                </cite>
              </div>
              <a
                className="mt-9 inline-flex items-center gap-2 rounded-full bg-primary-container px-7 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90"
                href="#reading-shelf"
              >
                Suggest a title
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
                The shelf
              </h3>
              <span className="font-mono-metric text-[11px] uppercase tracking-[0.2em] text-text-tertiary">
                {FAVOURITE_BOOKS.length} titles
              </span>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {FAVOURITE_BOOKS.map((book, idx) => {
              const ink = COVER_INK[book.tone]
              return (
                <Reveal key={book.title} delay={idx * 70}>
                  <div className="executive-card group flex h-full gap-4 rounded-2xl p-5 sm:gap-5 sm:p-6">
                    <div
                      className={`relative flex h-[120px] w-[84px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg border border-slate-border/60 px-2 text-center shadow-lg ${book.coverColor}`}
                    >
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
