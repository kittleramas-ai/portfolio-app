import { useEffect, useState } from 'react'
import { useRouter } from '@tanstack/react-router'

import {
  currentAdminFn,
  getAdminSettingsFn,
  logoutFn,
  saveContactSettingsFn,
  saveHeroSettingsFn,
} from '../server/api.ts'
import type { ContactSettings, HeroSettings, SiteSettings } from '../server/settings-schema.ts'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

/**
 * Settings editor — the manager-facing surface.
 *
 * One form per settings group, saved independently. Splitting the writes means
 * a validation failure in the hero copy cannot block saving the WhatsApp
 * number, and the two rows never race each other.
 */
export function AdminShell() {
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [who, setWho] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    // A ref, not a `let`: the linter narrows a closure-mutated `let` to the
    // literal `false` and then flags `if (cancelled)` as dead code, which it is
    // not — React sets it in the cleanup below.
    const cancelled = { current: false }
    void (async () => {
      try {
        const [s, me] = await Promise.all([
          getAdminSettingsFn(),
          currentAdminFn(),
        ])
        if (cancelled.current) return
        setSettings(s.settings)
        setWho(me?.displayName ?? me?.email ?? null)
      } catch (err) {
        if (cancelled.current) return
        // A 401 here means the session lapsed mid-visit: send them back to login.
        if (isUnauthorized(err)) {
          await router.navigate({ to: '/admin/login' })
          return
        }
        setLoadError(
          err instanceof Error ? err.message : 'Failed to load settings',
        )
      }
    })()
    return () => {
      cancelled.current = true
    }
  }, [router])

  async function signOut() {
    await logoutFn()
    await router.invalidate()
    await router.navigate({ to: '/admin/login' })
  }

  if (loadError) {
    return (
      <Shell who={who} onSignOut={signOut}>
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">
          {loadError}
        </p>
      </Shell>
    )
  }

  if (!settings) {
    return (
      <Shell who={who} onSignOut={signOut}>
        <p className="text-[#7a8a80]">Loading settings…</p>
      </Shell>
    )
  }

  return (
    <Shell who={who} onSignOut={signOut}>
      <ContactForm
        value={settings.contact}
        onChange={(contact) => setSettings((s) => (s ? { ...s, contact } : s))}
      />
      <HeroForm
        value={settings.hero}
        onChange={(hero) => setSettings((s) => (s ? { ...s, hero } : s))}
      />

      <section className="mt-10 rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-mono-metric text-[11px] uppercase tracking-[0.24em] text-[#d4af37]">
          Where this shows up
        </h2>
        <ul className="mt-3 space-y-1.5 text-[13px] text-[#b8c4bb]">
          <li>
            <strong className="text-[#f5efe0]">WhatsApp number</strong> → the
            floating button, bottom-right of every page.
          </li>
          <li>
            <strong className="text-[#f5efe0]">Hero statement</strong> → the
            opening line on the home page.
          </li>
        </ul>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block font-mono-metric text-[11px] uppercase tracking-wider text-[#d4af37] underline-offset-4 hover:underline"
        >
          View the site ↗
        </a>
      </section>
    </Shell>
  )
}

function Shell({
  who,
  onSignOut,
  children,
}: {
  who: string | null
  onSignOut: () => void
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh bg-[#071a12]">
      <header className="border-b border-white/10 bg-[#0d281e]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="font-mono-metric text-[10px] uppercase tracking-[0.24em] text-[#7a8a80]">
              Content Manager
            </p>
            <h1 className="font-display text-xl uppercase text-[#f5efe0]">
              Site Settings
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {who ? (
              <span className="hidden font-mono-metric text-[11px] text-[#b8c4bb] sm:inline">
                {who}
              </span>
            ) : null}
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-lg border border-white/15 px-4 py-2 font-mono-metric text-[11px] uppercase tracking-wider text-[#b8c4bb] transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>
    </div>
  )
}

function Card({
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
    <section className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-6">
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

function SaveButton({
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

function Field({
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

const inputClass =
  'w-full rounded-lg border border-white/15 bg-black/30 px-4 py-2.5 text-[14px] text-[#f5efe0] outline-none transition-colors placeholder:text-[#7a8a80] focus:border-[#d4af37]'

function ContactForm({
  value,
  onChange,
}: {
  value: ContactSettings
  onChange: (next: ContactSettings) => void
}) {
  const [state, setState] = useState<SaveState>('idle')
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setState('saving')
    setError(null)
    try {
      await saveContactSettingsFn({ data: { contact: value } })
      setState('saved')
      setTimeout(() => setState('idle'), 2500)
    } catch (err) {
      setState('error')
      setError(readServerError(err))
    }
  }

  // Live preview of the URL the button will produce, so a bad number is
  // obvious before saving rather than after.
  const preview = `https://wa.me/${value.whatsappNumber || '…'}`

  return (
    <Card
      title="Contact & WhatsApp"
      description="Drives the floating WhatsApp button on every page."
      state={state}
      error={error}
      onSave={save}
    >
      <Field
        label="WhatsApp number"
        hint={`Country code and digits only. Result: ${preview}`}
      >
        <input
          type="text"
          inputMode="numeric"
          value={value.whatsappNumber}
          onChange={(e) =>
            onChange({
              ...value,
              whatsappNumber: e.target.value.replace(/[^\d]/g, ''),
            })
          }
          className={inputClass}
          placeholder="919876543210"
        />
      </Field>

      <Field
        label="Pre-filled message"
        hint="What the visitor's chat opens with. Keep it short."
      >
        <textarea
          value={value.whatsappMessage}
          onChange={(e) =>
            onChange({ ...value, whatsappMessage: e.target.value })
          }
          rows={3}
          className={inputClass}
        />
      </Field>

      <Field label="Contact email" hint="Optional. Shown in the contact section.">
        <input
          type="email"
          value={value.contactEmail}
          onChange={(e) => onChange({ ...value, contactEmail: e.target.value })}
          className={inputClass}
          placeholder="name@company.com"
        />
      </Field>

      <Field
        label="Phone (display)"
        hint="Optional. Formatting is free — this is shown, not dialled."
      >
        <input
          type="text"
          value={value.contactPhoneDisplay}
          onChange={(e) =>
            onChange({ ...value, contactPhoneDisplay: e.target.value })
          }
          className={inputClass}
          placeholder="+91 98765 43210"
        />
      </Field>
    </Card>
  )
}

function HeroForm({
  value,
  onChange,
}: {
  value: HeroSettings
  onChange: (next: HeroSettings) => void
}) {
  const [state, setState] = useState<SaveState>('idle')
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setState('saving')
    setError(null)
    try {
      await saveHeroSettingsFn({ data: { hero: value } })
      setState('saved')
      setTimeout(() => setState('idle'), 2500)
    } catch (err) {
      setState('error')
      setError(readServerError(err))
    }
  }

  return (
    <Card
      title="Hero Section"
      description="The opening statement and the two buttons on the home page."
      state={state}
      error={error}
      onSave={save}
    >
      <Field label="Statement — line 1">
        <input
          value={value.statementLine1}
          onChange={(e) =>
            onChange({ ...value, statementLine1: e.target.value })
          }
          className={inputClass}
        />
      </Field>
      <Field label="Statement — line 2">
        <input
          value={value.statementLine2}
          onChange={(e) =>
            onChange({ ...value, statementLine2: e.target.value })
          }
          className={inputClass}
        />
      </Field>
      <Field label="Statement — line 3">
        <input
          value={value.statementLine3}
          onChange={(e) =>
            onChange({ ...value, statementLine3: e.target.value })
          }
          className={inputClass}
        />
      </Field>

      <div className="rounded-lg border border-white/10 bg-black/20 p-4">
        <p className="mb-3 font-mono-metric text-[10px] uppercase tracking-[0.18em] text-[#7a8a80]">
          Preview
        </p>
        <p className="text-[17px] font-bold leading-snug text-[#f5efe0]">
          {value.statementLine1}{' '}
          <span className="text-[#7a8a80]">{value.statementLine2}</span>{' '}
          <span className="font-light text-[#d4af37]">{value.statementLine3}</span>
        </p>
      </div>

      <Field label="Closing counter-statement">
        <input
          value={value.counterStatement}
          onChange={(e) =>
            onChange({ ...value, counterStatement: e.target.value })
          }
          className={inputClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Primary button — label">
          <input
            value={value.ctaPrimaryLabel}
            onChange={(e) =>
              onChange({ ...value, ctaPrimaryLabel: e.target.value })
            }
            className={inputClass}
          />
        </Field>
        <Field label="Primary button — link" hint="Use a #section id.">
          <input
            value={value.ctaPrimaryHref}
            onChange={(e) =>
              onChange({ ...value, ctaPrimaryHref: e.target.value })
            }
            className={inputClass}
          />
        </Field>
        <Field label="Secondary button — label">
          <input
            value={value.ctaSecondaryLabel}
            onChange={(e) =>
              onChange({ ...value, ctaSecondaryLabel: e.target.value })
            }
            className={inputClass}
          />
        </Field>
        <Field label="Secondary button — link">
          <input
            value={value.ctaSecondaryHref}
            onChange={(e) =>
              onChange({ ...value, ctaSecondaryHref: e.target.value })
            }
            className={inputClass}
          />
        </Field>
      </div>
    </Card>
  )
}

/**
 * Server functions wrap the thrown Response, so the 401 can sit at the top
 * level or nested under `data`/`cause`. Walk a few levels rather than casting.
 */
function isUnauthorized(err: unknown): boolean {
  let current: unknown = err
  for (let depth = 0; depth < 5 && current && typeof current === 'object'; depth++) {
    const record = current as Record<string, unknown>
    if (record.status === 401) return true
    const nested = record.data ?? record.cause
    if (!nested || nested === current) return false
    current = nested
  }
  return false
}

/**
 * Turn a server-function error into something a non-technical manager can act
 * on. Server functions wrap handler errors, so the useful message can be nested
 * a few levels down as `message`.
 */
function readServerError(err: unknown): string {
  const seen = new Set<unknown>()
  let current: unknown = err

  for (let depth = 0; depth < 6 && current && typeof current === 'object'; depth++) {
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