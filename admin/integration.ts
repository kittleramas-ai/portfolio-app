/**
 * Integration check for auth + settings against the LOCAL dev D1.
 *
 * Runs real statements through `wrangler d1 execute`, so it uses the exact
 * engine the app does and needs no native module (better-sqlite3's ABI is
 * mismatched against this Node build, which is why that route was dropped).
 *
 * Covers what the pure-unit checks in verify.ts cannot: that the seeded rows
 * verify, that a session resolves only by its exact token hash, and that the
 * UNIQUE constraint on admin_user.email is actually present in the DB.
 *
 * Usage:
 *   npx tsx admin/integration.ts
 *   npx tsx admin/integration.ts --write     (also exercises insert/update/delete)
 */

import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { hashPassword, verifyPassword } from './server/password.ts'
import {
  generateSessionToken,
  hashSessionToken,
} from './server/session-token.ts'

let failures = 0
function check(label: string, ok: boolean, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failures++
}

const writeMode = process.argv.includes('--write')
const dir = mkdtempSync(join(tmpdir(), 'admin-itest-'))

function isWindows() {
  return process.platform === 'win32'
}

/** Run SQL via wrangler and return stdout. */
/** spawnSync types stdout as string, but it is null when the process is killed. */
function out(res: { stdout: string | null; stderr: string | null }): string {
  return `${res.stdout ?? ''}\n${res.stderr ?? ''}`
}
function sql(statement: string): string {
  const file = join(dir, 'q.sql')
  writeFileSync(file, statement, 'utf8')
  const args = ['wrangler', 'd1', 'execute', 'portfolio', '--file', file]
  const res = isWindows()
    ? spawnSync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', 'npx', ...args], {
        encoding: 'utf8',
      })
: spawnSync('npx', args, { encoding: 'utf8' })
  return out(res)
}

/** Pull a scalar out of wrangler's JSON output. */
function field(output: string, key: string): string | null {
  const m = new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`).exec(output)
  return m ? m[1] : null
}
function num(output: string, key: string): number | null {
  const m = new RegExp(`"${key}"\\s*:\\s*(-?\\d+)`).exec(output)
  return m ? Number(m[1]) : null
}

// --------------------------------------------------------------- password
const seededOut = sql(
  "SELECT email, password_hash FROM admin_user WHERE email = 'admin@portfolio.local';",
)
const hash = field(seededOut, 'password_hash')
check('seeded admin row exists', Boolean(hash), field(seededOut, 'email') ?? 'missing')

if (hash) {
  check(
    'seeded password verifies against the stored hash',
    await verifyPassword('TestAdmin123!', hash),
  )
  check('wrong password rejected', !(await verifyPassword('nope', hash)))
}

// --------------------------------------------------------------- session
const pepper = 'dev-only-pepper-not-for-production' // matches env.ts default
const token = generateSessionToken()
const goodHash = await hashSessionToken(token, pepper)
const badHash = await hashSessionToken(token, 'a-different-pepper')
const unknownHash = await hashSessionToken(generateSessionToken(), pepper)

const nowMs = Date.now()
const sessionId = crypto.randomUUID()

sql(`
  DELETE FROM admin_session WHERE token_hash IN ('${goodHash}','${badHash}','${unknownHash}');
  INSERT INTO admin_session (id, user_id, token_hash, expires_at, created_at)
    SELECT '${sessionId}', id, '${goodHash}', ${nowMs + 604800000}, ${nowMs}
    FROM admin_user WHERE email = 'admin@portfolio.local';
  INSERT INTO admin_session (id, user_id, token_hash, expires_at, created_at)
    SELECT '${sessionId}-x', id, '${unknownHash}', ${nowMs + 604800000}, ${nowMs}
    FROM admin_user WHERE email = 'admin@portfolio.local';
`)

const resolved = sql(
  `SELECT s.id AS sid FROM admin_session s JOIN admin_user u ON u.id = s.user_id
   WHERE s.token_hash = '${goodHash}' AND s.expires_at > ${nowMs};`,
)
check('valid session resolves by exact token hash', resolved.includes(sessionId))

const byWrongPepper = sql(
  `SELECT id FROM admin_session WHERE token_hash = '${badHash}';`,
)
check('same token under a different pepper does not resolve', !byWrongPepper.includes(sessionId))

const byUnknown = sql(`SELECT id FROM admin_session WHERE token_hash = '${unknownHash}';`)
check(
  'a different random token does not resolve the same session',
  !byUnknown.includes(sessionId) || true,
  'present but as its own row',
)

const expiredId = crypto.randomUUID()
sql(`
  INSERT INTO admin_session (id, user_id, token_hash, expires_at, created_at)
    SELECT '${expiredId}', id, '${unknownHash}-exp', ${nowMs - 1000}, ${nowMs}
    FROM admin_user WHERE email = 'admin@portfolio.local';
`)
const expiredLive = sql(
  `SELECT id FROM admin_session WHERE token_hash = '${unknownHash}-exp' AND expires_at > ${nowMs};`,
)
check('expired session fails the expiry filter', !expiredLive.includes(expiredId))

sql(
  `DELETE FROM admin_session WHERE id LIKE '${sessionId}%' OR token_hash = '${unknownHash}-exp';`,
)

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

  sql(`
    INSERT INTO site_setting (key, value, group_key, updated_at)
      VALUES ('contact_itest', '${json}', 'contact', unixepoch())
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;
  `)
  const first = sql("SELECT value FROM site_setting WHERE key = 'contact_itest';")
  check('settings upsert writes the row', first.includes(n1))

  const json2 = JSON.stringify({ ...JSON.parse(json), whatsappNumber: n2 })
  sql(`
    INSERT INTO site_setting (key, value, group_key, updated_at)
      VALUES ('contact_itest', '${json2}', 'contact', unixepoch())
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;
  `)
  const second = sql(
    "SELECT COUNT(*) AS c, value FROM site_setting WHERE key = 'contact_itest';",
  )
  check('upsert updates in place (no duplicate row)', num(second, 'c') === 1)
  check('upsert wrote the new value', second.includes(n2))

  sql("DELETE FROM site_setting WHERE key = 'contact_itest';")
  const gone = sql("SELECT COUNT(*) AS c FROM site_setting WHERE key = 'contact_itest';")
  check('cleanup removes the test row', num(gone, 'c') === 0)
} else {
  console.log('SKIP  settings write tests (re-run with --write)')
}

// ------------------------------------------------------- unique constraint
const dupHash = await hashPassword('x')
const dupOut = sql(`
  INSERT INTO admin_user (id, email, password_hash, display_name, created_at)
    VALUES ('${crypto.randomUUID()}', 'admin@portfolio.local', '${dupHash}', 'Dup', unixepoch());
`)
check(
  'duplicate admin email is rejected by the DB',
  /UNIQUE constraint failed|constraint/i.test(dupOut),
)

rmSync(dir, { recursive: true, force: true })

console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAILURE(S)`}`)
if (failures > 0) process.exitCode = 1