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
 *
 * Session rows are written through the query builder rather than the
 * `INSERT OR REPLACE ... SELECT ... FROM admin_user` strings this used to
 * build. The builder takes the user id as a bound parameter, so there is no
 * string interpolation to get wrong, and `onConflictDoUpdate` states the
 * upsert intent instead of the `OR REPLACE` euphemism.
 */
import { eq } from 'drizzle-orm'

import { closeCheckDb, openCheckDb } from './lib/db.ts'
import { adminSession, adminUser } from '../src/db/schema.ts'
import { generateSessionToken, hashSessionToken } from './server/session-token.ts'

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const PEPPER = 'dev-only-pepper-not-for-production'

const { db } = await openCheckDb()

const seeded = await db
  .select({ id: adminUser.id })
  .from(adminUser)
  .where(eq(adminUser.email, 'admin@portfolio.local'))
  .limit(1)
const userId = seeded[0]?.id
if (!userId) {
  console.error(
    'no admin@portfolio.local row — run: npm run db:seed',
  )
  await closeCheckDb()
  process.exit(1)
}

/** Insert (or replace) a session row for the seeded admin. */
async function putSession(id: string, tokenHash: string, expiresAt: number) {
  await db
    .insert(adminSession)
    .values({
      id,
      userId,
      tokenHash,
      expiresAt: new Date(expiresAt),
      createdAt: new Date(),
    })
    .onDuplicateKeyUpdate({
      set: { expiresAt: new Date(expiresAt), userId },
    })
}

async function dropSession(tokenHash: string) {
  await db.delete(adminSession).where(eq(adminSession.tokenHash, tokenHash))
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

  await putSession('expdbg', hash, expiresAt)

  // Raw cookie header — no Expires attribute for the client to evaluate.
  const resp = await fetchWithRetry('/admin', `admin_session=${token}`)
  const loc = resp.headers.get('location') ?? '(none)'
  const ok = resp.status === 307 || resp.status === 302
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${label} -> ${resp.status} ${loc}`,
  )

  await dropSession(hash)
  return ok
}

const now = Date.now()

// Sanity: a future session MUST authenticate, or the probe proves nothing.
const token = generateSessionToken()
const hash = await hashSessionToken(token, PEPPER)
await putSession('freshdbg', hash, now + 3600_000)
const freshResp = await fetchWithRetry('/admin', `admin_session=${token}`)
const freshOk = freshResp.status === 200
console.log(
  `${freshOk ? 'PASS' : 'FAIL'}  future session authenticates -> ${freshResp.status}`,
)
await dropSession(hash)

const pastOk = await probe('session expired 60s ago is rejected', now - 60_000)
const longPastOk = await probe(
  'session expired 8 days ago is rejected',
  now - 8 * 86_400_000,
)

await closeCheckDb()
const failed = [freshOk, pastOk, longPastOk].filter((x) => !x).length
console.log(`\n${failed === 0 ? 'ALL PASS' : `${failed} FAILURE(S)`}`)
if (failed > 0) process.exitCode = 1