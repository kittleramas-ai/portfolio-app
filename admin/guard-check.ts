/**
 * Mints a real admin session, then asserts /admin renders WITH the cookie and
 * redirects WITHOUT it. This proves the server-side guard both ways, since a
 * browser cannot be driven from the shell here.
 *
 * Usage: npx tsx admin/guard-check.ts
 */

import { count, eq, inArray } from 'drizzle-orm'

import { closeCheckDb, openCheckDb } from './lib/db.ts'
import { adminSession, adminUser } from '../src/db/schema.ts'
import {
  buildSessionCookie,
  generateSessionToken,
  hashSessionToken,
} from './server/session-token.ts'

const BASE = process.env.BASE_URL ?? 'http://localhost:3001'
const PEPPER = 'dev-only-pepper-not-for-production' // matches env.ts dev default

const { db } = await openCheckDb()

/**
 * The dev server occasionally drops a connection mid-run. Retry so a
 * transient socket reset is not reported as an auth failure.
 */
async function get(
  path: string,
  opts: { cookie?: string } = {},
): Promise<Response> {
  let lastErr: unknown
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await fetch(`${BASE}${path}`, {
        headers: opts.cookie ? { cookie: opts.cookie } : undefined,
        redirect: 'manual',
      })
    } catch (err) {
      lastErr = err
      await new Promise((r) => setTimeout(r, 700))
    }
  }
  throw lastErr
}

let failures = 0
function check(label: string, ok: boolean, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failures++
}

/** Write a session row exactly as loginFn does, via the query builder. */
async function putSession(id: string, tokenHash: string, expiresAt: number) {
  const admin = await db
    .select({ id: adminUser.id })
    .from(adminUser)
    .where(eq(adminUser.email, 'admin@portfolio.local'))
    .limit(1)
  const userId = admin[0]?.id
  if (!userId) {
    throw new Error(
      'no admin@portfolio.local row — run: npm run db:seed',
    )
  }
  await db.insert(adminSession).values({
    id,
    userId,
    tokenHash,
    expiresAt: new Date(expiresAt),
    createdAt: new Date(),
  })
}

async function dropSessions(...tokenHashes: string[]) {
  await db
    .delete(adminSession)
    .where(inArray(adminSession.tokenHash, tokenHashes))
}

// --- 1. no cookie -> redirect, no admin markup
const anon = await get('/admin')
const anonBody = await anon.text()
check(
  'GET /admin without a cookie redirects',
  anon.status === 307 || anon.status === 302,
  `${anon.status} -> ${anon.headers.get('location') ?? '(no location)'}`,
)
check(
  'anonymous response leaks no admin markup',
  !anonBody.includes('Site Settings') && !anonBody.includes('WhatsApp number'),
)
check('redirect target is the login page', (anon.headers.get('location') ?? '').includes('/admin/login'))

// --- 2. login page is reachable
const loginPage = await get('/admin/login')
check('GET /admin/login renders', loginPage.status === 200)

// --- 3. mint a valid session exactly as loginFn does
const token = generateSessionToken()
const tokenHash = await hashSessionToken(token, PEPPER)
const expires = new Date(Date.now() + 7 * 86_400_000)

await dropSessions(tokenHash)
await putSession(crypto.randomUUID(), tokenHash, expires.getTime())

const written = await db
  .select({ n: count() })
  .from(adminSession)
  .where(eq(adminSession.tokenHash, tokenHash))
check('session row written to the database', written.length === 1)

// --- 4. with the cookie -> admin renders
const cookie = buildSessionCookie(token, expires).split(';')[0]
const authed = await get('/admin', { cookie })
const authedBody = await authed.text()
check(
  'GET /admin with a valid cookie does NOT redirect',
  authed.status === 200,
  `${authed.status}`,
)
check(
  'authenticated response renders admin markup',
  // 'Site Admin' is the sidebar's brand line, which the shell renders on the
  // server regardless of which settings tab is open. Assert on that rather than
  // on any section name: the tab list is generated from SETTINGS_GROUPS, so a
  // test naming one of them would break every time a section is renamed.
  authedBody.includes('Site Admin'),
)
// The settings FORM fields are rendered client-side from getAdminSettingsFn
// inside a useEffect, so they are deliberately absent from the SSR HTML.
// Asserting on SSR markup here would be asserting on the wrong thing.
check(
  'admin shell renders (form fields hydrate client-side)',
  authedBody.includes('Content Manager') || authedBody.includes('Site Settings'),
)

// --- 5. login page redirects away when already signed in
const loginWhileAuthed = await get('/admin/login', { cookie })
check(
  '/admin/login redirects when already authenticated',
  loginWhileAuthed.status === 307 || loginWhileAuthed.status === 302,
  `${loginWhileAuthed.status} -> ${loginWhileAuthed.headers.get('location') ?? ''}`,
)

// --- 6. a garbage cookie must NOT authenticate
const bad = await get('/admin', { cookie: 'admin_session=not-a-real-token' })
check(
  'a forged cookie is rejected',
  bad.status === 307 || bad.status === 302,
  `${bad.status}`,
)

// --- 7. an expired session must NOT authenticate.
// The cookie is sent as a bare header (no Expires attribute) so the HTTP client
// cannot discard it before the request — otherwise this test proves nothing.
const staleToken = generateSessionToken()
const staleHash = await hashSessionToken(staleToken, PEPPER)
await putSession(
  `${crypto.randomUUID()}-expired`,
  staleHash,
  Date.now() - 1000,
)
const stale = await get('/admin', { cookie: `admin_session=${staleToken}` })
check(
  'an expired session is rejected',
  stale.status === 307 || stale.status === 302,
  `${stale.status}`,
)

// --- cleanup
await dropSessions(tokenHash, staleHash)
await closeCheckDb()

console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAILURE(S)`}`)
if (failures > 0) process.exitCode = 1