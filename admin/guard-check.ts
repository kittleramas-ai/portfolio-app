/**
 * Mints a real admin session, then asserts /admin renders WITH the cookie and
 * redirects WITHOUT it. This proves the server-side guard both ways, since a
 * browser cannot be driven from the shell here.
 *
 * Usage: npx tsx admin/guard-check.ts
 */

import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  buildSessionCookie,
  generateSessionToken,
  hashSessionToken,
} from './server/session-token.ts'

const BASE = process.env.BASE_URL ?? 'http://localhost:3001'
const PEPPER = 'dev-only-pepper-not-for-production' // matches env.ts dev default
const dir = mkdtempSync(join(tmpdir(), 'guard-'))

/**
 * The dev server occasionally drops a connection mid-run (Vite re-optimising
 * after the wrangler invocations touch the same state dir). Retry so a
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

/** spawnSync types stdout as string, but it is null when the process is killed. */
function out(res: { stdout: string | null; stderr: string | null }): string {
  return `${res.stdout ?? ''}\n${res.stderr ?? ''}`
}
function sql(stmt: string): string {
  const file = join(dir, 'q.sql')
  writeFileSync(file, stmt, 'utf8')
  const args = ['wrangler', 'd1', 'execute', 'portfolio', '--file', file]
  const res =
    process.platform === 'win32'
      ? spawnSync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', 'npx', ...args], {
          encoding: 'utf8',
        })
: spawnSync('npx', args, { encoding: 'utf8' })
  return out(res)
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

sql(`
  DELETE FROM admin_session WHERE token_hash = '${tokenHash}';
  INSERT INTO admin_session (id, user_id, token_hash, expires_at, created_at)
    SELECT '${crypto.randomUUID()}', id, '${tokenHash}', ${expires.getTime()}, ${Date.now()}
    FROM admin_user WHERE email = 'admin@portfolio.local';
`)

const exists = sql(
  `SELECT COUNT(*) AS c FROM admin_session WHERE token_hash = '${tokenHash}';`,
)
check('session row written to D1', /"c":\s*1/.test(exists))

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
  authedBody.includes('Site Settings'),
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
const expiredId = `${crypto.randomUUID()}-expired`
sql(`
  INSERT INTO admin_session (id, user_id, token_hash, expires_at, created_at)
    SELECT '${expiredId}', id, '${staleHash}', ${Date.now() - 1000}, ${Date.now()}
    FROM admin_user WHERE email = 'admin@portfolio.local';
`)
const stale = await get('/admin', { cookie: `admin_session=${staleToken}` })
check(
  'an expired session is rejected',
  stale.status === 307 || stale.status === 302,
  `${stale.status}`,
)

// --- cleanup
sql(`DELETE FROM admin_session WHERE token_hash IN ('${tokenHash}', '${staleHash}');`)
rmSync(dir, { recursive: true, force: true })

console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAILURE(S)`}`)
if (failures > 0) process.exitCode = 1