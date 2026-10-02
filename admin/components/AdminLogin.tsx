import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'

import { loginFn } from '../server/api.ts'

/**
 * Admin sign-in.
 *
 * Deliberately plain and deliberately unstyled by the portfolio theme: this is
 * an internal tool, and reusing the public site's gold-on-emerald palette would
 * make it look like part of the site rather than a private area.
 */
export function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const result = await loginFn({ data: { email, password } })
      if (result.ok) {
        // Invalidate so the guard re-runs with the new session cookie.
        await router.invalidate()
        await router.navigate({ to: result.redirect })
      } else {
        setError(result.error)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#0d281e] px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-mono-metric text-[11px] uppercase tracking-[0.24em] text-[#d4af37]">
            Private Access
          </p>
          <h1 className="mt-3 font-display text-3xl uppercase text-[#f5efe0]">
            Site Admin
          </h1>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm"
        >
          <label className="block">
            <span className="mb-2 block font-mono-metric text-[11px] uppercase tracking-[0.18em] text-[#b8c4bb]">
              Email
            </span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-[15px] text-[#f5efe0] outline-none transition-colors placeholder:text-[#7a8a80] focus:border-[#d4af37]"
              placeholder="admin@portfolio.local"
            />
          </label>

          <label className="mt-5 block">
            <span className="mb-2 block font-mono-metric text-[11px] uppercase tracking-[0.18em] text-[#b8c4bb]">
              Password
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-[15px] text-[#f5efe0] outline-none transition-colors placeholder:text-[#7a8a80] focus:border-[#d4af37]"
              placeholder="••••••••••••"
            />
          </label>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-200"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-lg bg-[#d4af37] px-5 py-3 text-[14px] font-bold uppercase tracking-wider text-[#071a12] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <a
          href="/"
          className="mt-6 block text-center font-mono-metric text-[11px] text-[#7a8a80] transition-colors hover:text-[#d4af37]"
        >
          ← Back to the site
        </a>
      </div>
    </main>
  )
}