/**
 * Focused check: does resolveAdmin actually reject an expired session?
 * Sends the cookie WITHOUT an Expires attribute so the HTTP client cannot
 * discard it client-side — otherwise a past-dated cookie never leaves the
 * process and the test proves nothing.
 */
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { generateSessionToken, hashSessionToken } from './server/session-token.ts'

const BASE = process.env.BASE_URL ?? 'http://localhost:3001'
const PEPPER = 'dev-only-pepper-not-for-production'
const dir = mkdtempSync(join(tmpdir(), 'exp-'))

/** spawnSync types stdout as string, but it is null when the process is killed. */
function out(res: { stdout: string | null; stderr: string | null }): string {
  return `${res.stdout ?? ''}\n${res.stderr ?? ''}`
}
function sql(stmt: string): string {
  const f = join(dir, 'q.sql')
  writeFileSync(f, stmt, 'utf8')
  const args = ['wrangler', 'd1', 'execute', 'portfolio', '--file', f]
  const r =
    process.platform === 'win32'
      ? spawnSync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', 'npx', ...args], { encoding: 'utf8' })
: spawnSync('npx', args, { encoding: 'utf8' })
  return out(r)
}

async function probe(label: string, expiresAt: number) {
  const token = generateSessionToken()
  const hash = await hashSessionToken(token, PEPPER)

  sql(`
    INSERT INTO admin_session (id, user_id, token_hash, expires_at, created_at)
      SELECT 'expdbg', id, '${hash}', ${expiresAt}, ${Date.now()}
      FROM admin_user WHERE email = 'admin@portfolio.local';
  `)

  // Raw cookie header — no Expires attribute for the client to evaluate.
  const resp = await fetch(`${BASE}/admin`, {
    headers: { cookie: `admin_session=${token}` },
    redirect: 'manual',
  })
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
const freshOk = await (async () => {
  const token = generateSessionToken()
  const hash = await hashSessionToken(token, PEPPER)
  sql(`
    INSERT INTO admin_session (id, user_id, token_hash, expires_at, created_at)
      SELECT 'freshdbg', id, '${hash}', ${now + 3600_000}, ${now}
      FROM admin_user WHERE email = 'admin@portfolio.local';
  `)
  const resp = await fetch(`${BASE}/admin`, {
    headers: { cookie: `admin_session=${token}` },
    redirect: 'manual',
  })
  const ok = resp.status === 200
  console.log(`${ok ? 'PASS' : 'FAIL'}  future session authenticates -> ${resp.status}`)
  sql(`DELETE FROM admin_session WHERE token_hash = '${hash}';`)
  return ok
})()

const pastOk = await probe('session expired 60s ago is rejected', now - 60_000)
const longPastOk = await probe('session expired 8 days ago is rejected', now - 8 * 86_400_000)

rmSync(dir, { recursive: true, force: true })
const failed = [freshOk, pastOk, longPastOk].filter((x) => !x).length
console.log(`\n${failed === 0 ? 'ALL PASS' : `${failed} FAILURE(S)`}`)
if (failed > 0) process.exitCode = 1