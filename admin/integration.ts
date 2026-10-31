/**
 * Integration check for auth + settings against the app's OWN database.
 *
 * Covers what the pure-unit checks in verify.ts cannot: that the seeded rows
 * verify, that a session resolves only by its exact token hash, that an expired
 * session fails the expiry filter, and that the UNIQUE constraint on
 * admin_user.email is actually present in the database.
 *
 * ---------------------------------------------------------------------------
 * THIS USED TO TEST THE WRONG DATABASE
 * ---------------------------------------------------------------------------
 * It shelled out to `wrangler d1 execute` and asserted against
 * `.wrangler/state/v3/d1/…sqlite` — a Cloudflare D1 file orphaned when the app
 * moved to a Node server. Its header claimed it used "the exact engine the app
 * does", which had been false since that move. Compared side by side:
 *
 *   wrangler D1 copy        app database
 *   ----------------        -------------
 *   site_media MISSING      site_media present
 *   1 site_setting row      3 rows
 *
 * So it reported ALL PASS while exercising a database nothing served from, and
 * would have stayed green if the app's schema or constraints were broken. Every
 * statement now runs through Drizzle against the same file `resolveDatabasePath`
 * resolves, and `openCheckDb()` fails loudly if `admin_user` is absent — which is
 * what turns "silently testing the wrong thing" into an error.
 *
 * Usage:
 *   npx tsx admin/integration.ts
 *   npx tsx admin/integration.ts --write     (also exercises insert/update/delete)
 */

import { and, count, eq, gt, inArray, like } from 'drizzle-orm'

import { hashPassword, verifyPassword } from './server/password.ts'
import {
  generateSessionToken,
  hashSessionToken,
} from './server/session-token.ts'
import { closeCheckDb, openCheckDb } from './lib/db.ts'
import { adminSession, adminUser, siteSetting } from '../src/db/schema.ts'

let failures = 0
function check(label: string, ok: boolean, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failures++
}

const writeMode = process.argv.includes('--write')

const { db, url } = await openCheckDb()
console.log(`database under test: ${url.replace(/:[^:@/]+@/, ':***@')}`)

// --------------------------------------------------------------- password
/**
 * Round-trip a hash through the REAL database.
 *
 * This used to assert that the live admin's stored hash verified against the
 * hardcoded string `TestAdmin123!`. That only ever passed because the test ran
 * against the orphaned D1 copy, which had been seeded with that password; the
 * moment it pointed at the real database the assertion failed, which is the
 * point — it was testing a fixture, not the code.
 *
 * So the test now provisions its own row with a known password and removes it
 * afterwards. It verifies the same thing (hash → store → read → verify) without
 * depending on whatever password the manager actually chose.
 */
const PROBE_EMAIL = 'integration-probe@portfolio.local'
const PROBE_PASSWORD = 'IntegrationProbe123!'

const probeHash = await hashPassword(PROBE_PASSWORD)
await db
  .insert(adminUser)
  .values({
    id: crypto.randomUUID(),
    email: PROBE_EMAIL,
    passwordHash: probeHash,
    displayName: 'Integration Probe',
    createdAt: new Date(),
  })
  .onDuplicateKeyUpdate({
    set: { passwordHash: probeHash },
  })

const probe = await db
  .select({ id: adminUser.id, passwordHash: adminUser.passwordHash })
  .from(adminUser)
  .where(eq(adminUser.email, PROBE_EMAIL))
  .limit(1)

check(
  'probe admin row round-trips through the DB',
  Boolean(probe[0]),
  PROBE_EMAIL,
)
if (probe[0]) {
  check(
    'password verifies against the stored hash',
    await verifyPassword(PROBE_PASSWORD, probe[0].passwordHash),
  )
  check(
    'wrong password rejected',
    !(await verifyPassword('nope', probe[0].passwordHash)),
  )
}

// The real seeded admin must still exist — that is the row login depends on.
const seeded = await db
  .select({ email: adminUser.email })
  .from(adminUser)
  .where(eq(adminUser.email, 'admin@portfolio.local'))
  .limit(1)
check('seeded admin row exists', seeded.length === 1, seeded[0]?.email ?? 'missing')

// --------------------------------------------------------------- session
const pepper = 'dev-only-pepper-not-for-production' // matches env.ts default
const token = generateSessionToken()
const goodHash = await hashSessionToken(token, pepper)
const badHash = await hashSessionToken(token, 'a-different-pepper')
const unknownHash = await hashSessionToken(generateSessionToken(), pepper)

const nowMs = Date.now()

/**
 * Session rows this script owns use a fixed id namespace instead of random
 * UUIDs, and the namespace is swept both before and after the run.
 *
 * That makes the script idempotent and self-healing. With random ids a run that
 * died partway through left rows behind that the next run's cleanup could not
 * match, and the next run then failed on a primary-key collision. It also fixed
 * a genuine leak: the expired row was given its own random UUID, so the
 * `like(sessionId%)` cleanup never matched it and every run added a row.
 */
const SESSION_PREFIX = 'itest-session'
const sessionId = `${SESSION_PREFIX}-good`
const unknownId = `${SESSION_PREFIX}-unknown`
const expiredId = `${SESSION_PREFIX}-expired`

const sweepTestSessions = () =>
  db.delete(adminSession).where(like(adminSession.id, `${SESSION_PREFIX}%`))

await sweepTestSessions()

const userId = (
  await db
    .select({ id: adminUser.id })
    .from(adminUser)
    .where(eq(adminUser.email, 'admin@portfolio.local'))
    .limit(1)
)[0]?.id
if (!userId) {
  console.error('cannot continue without the seeded admin id')
  await db.delete(adminUser).where(eq(adminUser.email, PROBE_EMAIL))
  await closeCheckDb()
  process.exit(1)
}

await db
  .delete(adminSession)
  .where(inArray(adminSession.tokenHash, [goodHash, badHash, unknownHash, `${unknownHash}-exp`]))

await db.insert(adminSession).values([
  {
    id: sessionId,
    userId,
    tokenHash: goodHash,
    expiresAt: new Date(nowMs + 604_800_000),
    createdAt: new Date(nowMs),
  },
  {
    id: unknownId,
    userId,
    tokenHash: unknownHash,
    expiresAt: new Date(nowMs + 604_800_000),
    createdAt: new Date(nowMs),
  },
])

const resolved = await db
  .select({ id: adminSession.id })
  .from(adminSession)
  .where(eq(adminSession.tokenHash, goodHash))
  .limit(1)
check('valid session resolves by exact token hash', resolved[0]?.id === sessionId)

const byWrongPepper = await db
  .select({ id: adminSession.id })
  .from(adminSession)
  .where(eq(adminSession.tokenHash, badHash))
  .limit(1)
check(
  'same token under a different pepper does not resolve',
  byWrongPepper.length === 0,
)

const byUnknown = await db
  .select({ id: adminSession.id })
  .from(adminSession)
  .where(eq(adminSession.tokenHash, unknownHash))
  .limit(1)
check(
  'a different random token does not resolve the same session',
  byUnknown[0]?.id !== sessionId,
  byUnknown[0] ? 'present but as its own row' : 'absent',
)

await db.insert(adminSession).values({
  id: expiredId,
  userId,
  tokenHash: `${unknownHash}-exp`,
  expiresAt: new Date(nowMs - 1000),
  createdAt: new Date(nowMs),
})
const expiredLive = await db
  .select({ id: adminSession.id })
  .from(adminSession)
  .where(
    // Both conditions together: the row exists, but not past its expiry.
    and(
      eq(adminSession.tokenHash, `${unknownHash}-exp`),
      gt(adminSession.expiresAt, new Date(nowMs)),
    ),
  )
  .limit(1)
check('expired session fails the expiry filter', expiredLive.length === 0)

// One sweep covers all three rows, including the expired one. The token-hash
// delete is kept so rows from older runs with the same hashes are cleared too.
await db
  .delete(adminSession)
  .where(eq(adminSession.tokenHash, `${unknownHash}-exp`))
await sweepTestSessions()

// --------------------------------------------------------------- settings
if (writeMode) {
  const n1 = '919555123456'
  const n2 = '919000111222'
  const json = JSON.stringify({
    whatsappNumber: n1,
    whatsappMessage: 'integration check',
    contactEmail: '',
    contactPhoneDisplay: '',
  })

  await db
    .insert(siteSetting)
    .values({
      key: 'contact_itest',
      value: json,
      groupKey: 'contact',
      updatedAt: new Date(),
    })
    .onDuplicateKeyUpdate({
        set: { value: json, updatedAt: new Date() },
    })
  const first = await db
    .select({ value: siteSetting.value })
    .from(siteSetting)
    .where(eq(siteSetting.key, 'contact_itest'))
    .limit(1)
  check('settings upsert writes the row', first[0]?.value.includes(n1) === true)

  const json2 = JSON.stringify({ ...JSON.parse(json), whatsappNumber: n2 })
  await db
    .insert(siteSetting)
    .values({
      key: 'contact_itest',
      value: json2,
      groupKey: 'contact',
      updatedAt: new Date(),
    })
    .onDuplicateKeyUpdate({
        set: { value: json2, updatedAt: new Date() },
    })
  const second = await db
    .select({ n: count(), value: siteSetting.value })
    .from(siteSetting)
    .where(eq(siteSetting.key, 'contact_itest'))
  check('upsert updates in place (no duplicate row)', second[0]?.n === 1)
  check('upsert wrote the new value', second[0]?.value.includes(n2) === true)

  await db.delete(siteSetting).where(eq(siteSetting.key, 'contact_itest'))
  const gone = await db
    .select({ n: count() })
    .from(siteSetting)
    .where(eq(siteSetting.key, 'contact_itest'))
  check('cleanup removes the test row', gone[0]?.n === 0)
} else {
  console.log('SKIP  settings write tests (re-run with --write)')
}

// ------------------------------------------------------- unique constraint
const dupHash = await hashPassword('x')
let dupRejected = false
try {
  await db.insert(adminUser).values({
    id: crypto.randomUUID(),
    email: 'admin@portfolio.local',
    passwordHash: dupHash,
    displayName: 'Dup',
    createdAt: new Date(),
  })
} catch {
  dupRejected = true
}
check(
  'duplicate admin email is rejected by the DB',
  dupRejected,
  'UNIQUE constraint on admin_user.email',
)

// Remove the probe row so a re-run starts clean and the real admin table is
// left exactly as it was found.
await db.delete(adminUser).where(eq(adminUser.email, PROBE_EMAIL))

await closeCheckDb()

console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAILURE(S)`}`)
if (failures > 0) process.exitCode = 1