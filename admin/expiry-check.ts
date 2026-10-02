/**
 * Focused check: does resolveAdmin actually reject an expired session?
 *
 * Sends the cookie WITHOUT an Expires attribute so the HTTP client cannot
 * discard it before the request — otherwise a past-dated cookie never leaves
 * the process and the test proves nothing.
 *
 * This caught a real bug once: the expiry column was declared with Drizzle's
 * `mode: 'timestamp'` (SECONDS) while the app wrote `Date.now()` (MILLISECONDS),
 * so every expiry read back as a date in the year 58722 and expired sessions
 * kept working. Keep this test.
 */
import { openDb } from './lib/sqlite.ts'
import { generateSessionToken, hashSessionToken } from './server/session-token.ts'

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const PEPPER = 'dev-only-pepper-not-for-production'

/** Run SQL against the app's own SQLite file. */
function sql(stmt: string): string {
  const db = openDb()
  try {
    db.exec(stmt)
    return 'ok'
  } finally {
    db.close()
  }
}

async function fetchWithRetry(path: string, cookie: string) {
  let lastErr: unknown
  for (let i = 0; i < 4; i++) {
    try {
      return await fetch(`${BASE}${path}`, {
        headers: { cookie },
        redirect: 'manual',
      })
    } catch (err) {
      lastErr = err
      await new Promise((r) => setTimeout(r, 700))
    }
  }
  throw lastErr
}

async function probe(label: string, expiresAt: number) {
  const token = generateSessionToken()
  const hash = await hashSessionToken(token, PEPPER)

  sql(`
    INSERT OR REPLACE INTO admin_session (id, user_id, token_hash, expires_at, created_at)
      SELECT 'expdbg', id, '${hash}', ${expiresAt}, ${Date.now()}
      FROM admin_user WHERE email = 'admin@portfolio.local';
  `)

  // Raw cookie header — no Expires attribute for the client to evaluate.
  const resp = await fetchWithRetry('/admin', `admin_session=${token}`)
  const loc = resp.headers.get('location') ?? '(none)'
  const ok = resp.status === 307 || resp.status === 302
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${label} -> ${resp.status} ${loc}`,
  )

  sql(`DELETE FROM admin_session WHERE token_hash = '${hash}';`)
  return ok
}

const now = Date.now()

// Sanity: a future session MUST authenticate, or the probe proves nothing.
const token = generateSessionToken()
const hash = await hashSessionToken(token, PEPPER)
sql(`
  INSERT OR REPLACE INTO admin_session (id, user_id, token_hash, expires_at, created_at)
    SELECT 'freshdbg', id, '${hash}', ${now + 3600_000}, ${now}
    FROM admin_user WHERE email = 'admin@portfolio.local';
`)
const freshResp = await fetchWithRetry('/admin', `admin_session=${token}`)
const freshOk = freshResp.status === 200
console.log(
  `${freshOk ? 'PASS' : 'FAIL'}  future session authenticates -> ${freshResp.status}`,
)
sql(`DELETE FROM admin_session WHERE token_hash = '${hash}';`)

const pastOk = await probe('session expired 60s ago is rejected', now - 60_000)
const longPastOk = await probe(
  'session expired 8 days ago is rejected',
  now - 8 * 86_400_000,
)

const failed = [freshOk, pastOk, longPastOk].filter((x) => !x).length
console.log(`\n${failed === 0 ? 'ALL PASS' : `${failed} FAILURE(S)`}`)
if (failed > 0) process.exitCode = 1