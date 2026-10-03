/**
 * Shared form primitives for the admin panel.
 *
 * Extracted from AdminShell so the schema-driven `ContentForm` renders in the
 * same visual language as the hand-written forms it replaces, without either
 * file importing the other.
 */

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

/**
 * The admin panel's surfaces come from the `.admin-shell` custom properties in
 * styles.css, referenced with LITERAL `var()` utilities.
 *
 * Two reasons this is not just a theme token or a JS constant:
 *
 * 1. Correctness. Tailwind's `black`, `white` and neutral scale are remapped
 *    onto this project's brand variables, and those are theme-dependent —
 *    `--portfolio-black` is paper white (#fdfbf5) in the light theme and
 *    near-black in the dark one. So `bg-black/30`, which reads as "30% black",
 *    actually rendered as 30% *paper white* whenever <html> was not on `.dark`,
 *    and every input and list row washed out to a pale grey box.
 * 2. Tailwind scans source TEXT for class candidates, so `bg-[${x}]` generates
 *    no rule at all. The utilities below must stay literal.
 *
 * Surfaces step DOWN in lightness as they come forward — panel, then card, then
 * field — so a field reads as an inset well rather than a slab on top.
 */
export const inputClass =
  'w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-field)] px-4 py-2.5 text-[14px] text-[#f5efe0] outline-none transition-colors placeholder:text-[#7a8a80] hover:border-[var(--admin-border-strong)] focus:border-[var(--admin-gold)] focus:bg-[var(--admin-field-hover)] focus:shadow-[0_0_0_3px_var(--admin-ring)]'

export const buttonClass =
  'inline-flex items-center gap-1.5 rounded-lg border border-[var(--admin-border)] bg-transparent px-3 py-2 font-mono-metric text-[11px] uppercase tracking-wider text-[#b8c4bb] transition-colors hover:border-[var(--admin-gold)] hover:text-[var(--admin-gold)] disabled:cursor-not-allowed disabled:opacity-35'

export const containerClass =
  'rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]'

export function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-200"
    >
      {children}
    </p>
  )
}

export function Card({
  title,
  description,
  state,
  error,
  onSave,
  children,
}: {
  title: string
  description: string
  state: SaveState
  error: string | null
  onSave: () => void
  children: React.ReactNode
}) {
  return (
    <section className={`mb-6 p-6 ${containerClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-bold uppercase tracking-wide text-[#f5efe0]">
            {title}
          </h2>
          <p className="mt-1 text-[13px] text-[#7a8a80]">{description}</p>
        </div>
        <SaveButton state={state} onClick={onSave} />
      </div>

      <div className="mt-6 space-y-5">{children}</div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-200"
        >
          {error}
        </p>
      ) : null}
    </section>
  )
}

export function SaveButton({
  state,
  onClick,
}: {
  state: SaveState
  onClick: () => void
}) {
  const label =
    state === 'saving'
      ? 'Saving…'
      : state === 'saved'
        ? 'Saved ✓'
        : 'Save changes'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === 'saving'}
      className="shrink-0 rounded-lg bg-[#d4af37] px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider text-[#071a12] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  )
}

/** The uppercase caption above every field. */
export function fieldLabelClass(): string {
  return 'mb-1.5 block font-mono-metric text-[11px] uppercase tracking-[0.18em] text-[#b8c4bb]'
}

/** The small note under a field: character counts, examples, errors. */
export function hintClass(over = false): string {
  return `mt-1.5 block text-[12px] ${over ? 'text-red-300' : 'text-[#7a8a80]'}`
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono-metric text-[11px] uppercase tracking-[0.18em] text-[#b8c4bb]">
        {label}
      </span>
      {children}
      {hint && !error ? (
        <span className="mt-1.5 block text-[12px] text-[#7a8a80]">{hint}</span>
      ) : null}
      {error ? (
        <span className="mt-1.5 block text-[12px] text-red-300">{error}</span>
      ) : null}
    </label>
  )
}

/**
 * Turn a server-function error into something a non-technical manager can act
 * on. Server functions wrap handler errors, so the useful message can be nested
 * a few levels down as `message`.
 */
export function readServerError(err: unknown): string {
  const seen = new Set<unknown>()
  let current: unknown = err

  for (
    let depth = 0;
    depth < 6 && current && typeof current === 'object';
    depth++
  ) {
    if (seen.has(current)) break
    seen.add(current)

    const record = current as Record<string, unknown>
    const nested = record.data ?? record.cause
    const message =
      typeof record.message === 'string' ? record.message : undefined

    if (message && !/fetch failed|Internal Server Error/i.test(message)) {
      return message
    }
    if (!nested) {
      return 'Could not save. Please try again.'
    }
    current = nested
  }
  return 'Could not save. Please try again.'
}

/**
 * Server functions wrap the thrown Response, so the 401 can sit at the top
 * level or nested under `data`/`cause`. Walk a few levels rather than casting.
 */
export function isUnauthorized(err: unknown): boolean {
  let current: unknown = err
  for (
    let depth = 0;
    depth < 5 && current && typeof current === 'object';
    depth++
  ) {
    const record = current as Record<string, unknown>
    if (record.status === 401) return true
    const nested = record.data ?? record.cause
    if (!nested || nested === current) return false
    current = nested
  }
  return false
}