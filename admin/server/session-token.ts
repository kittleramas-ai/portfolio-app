/**
 * Admin session tokens.
 *
 * Design copied from bookade-src/server/auth/security.ts, which is the one
 * genuinely good thing in that project:
 *
 *   - 48 bytes of CSPRNG randomness as the raw token
 *   - the DB stores sha256(rawToken + pepper), NEVER the raw token
 *   - the raw token lives only in an httpOnly cookie
 *
 * So a leaked database dump yields no usable session, and there is no JWT to
 * revoke or invalidate. The pepper lives in a Worker secret, not in the repo.
 *
 * Deliberately NOT copied: JWT_SECRET (dead config there, nothing reads it),
 * account lockout, concurrent-session limits, password expiry — all of which
 * exist for a multi-tenant system with many users.
 */

const SESSION_COOKIE = 'admin_session'
const SESSION_TTL_DAYS = 7

function getCrypto(): Crypto {
  if (typeof globalThis.crypto === 'undefined') {
    throw new Error('WebCrypto unavailable — sessions require a secure runtime')
  }
  return globalThis.crypto
}

function toHex(bytes: Uint8Array): string {
  let out = ''
  for (const b of bytes) out += b.toString(16).padStart(2, '0')
  return out
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

/** 48 random bytes -> 96 hex chars. */
export function generateSessionToken(): string {
  const bytes = getCrypto().getRandomValues(new Uint8Array(48))
  return toHex(bytes)
}

export async function hashSessionToken(
  token: string,
  pepper: string,
): Promise<string> {
  const subtle = getCrypto().subtle
  const data = new TextEncoder().encode(`${token}.${pepper}`)
  const digest = await subtle.digest('SHA-256', data)
  return toHex(new Uint8Array(digest))
}

/** Length-safe comparison. Not strictly required here (the input is a hash
 * lookup, not a secret comparison) but cheap insurance against future edits. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function sessionExpiry(from = new Date()): Date {
  return new Date(from.getTime() + SESSION_TTL_DAYS * 86_400_000)
}

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const eq = part.indexOf('=')
    if (eq < 1) continue
    const k = part.slice(0, eq).trim()
    const v = part.slice(eq + 1).trim()
    if (!k) continue
    try {
      out[k] = decodeURIComponent(v)
    } catch {
      out[k] = v
    }
  }
  return out
}

export function readSessionCookie(request: Request): string | null {
  const cookies = parseCookies(request.headers.get('cookie'))
  return cookies[SESSION_COOKIE] ?? null
}

/** httpOnly so JS (and any XSS) cannot read the token. */
export function buildSessionCookie(token: string, expires: Date): string {
  const attrs = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Expires=${expires.toUTCString()}`,
  ]
  if (typeof location !== 'undefined' && location.protocol === 'https:') {
    attrs.push('Secure')
  }
  return attrs.join('; ')
}

export function buildClearSessionCookie(): string {
  return [
    `${SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ].join('; ')
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE
export const __testing = { toHex, fromHex }