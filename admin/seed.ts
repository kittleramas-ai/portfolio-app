/**
 * Seed the single admin user.
 *
 *   npm run admin:seed              local dev D1
 *   npm run admin:seed -- --remote production D1
 *
 * Generates a password here (so it never appears in source or git history),
 * hashes it with the same PBKDF2 the login path uses, then pipes a parameterised
 * INSERT to `wrangler d1 execute --file`. Statements are executed by D1 itself,
 * so there is no second connection path to keep in sync.
 *
 * Re-running RESETS the password for the same email rather than erroring, so
 * it doubles as a recovery tool if the manager is locked out.
 */

import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { hashPassword } from './server/password.ts'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

function randomPassword(length = 20): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
}

/** Escape a value for a single-quoted SQL literal. */
function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

async function main() {
  const remote = process.argv.includes('--remote')
  const email =
    process.env.ADMIN_SEED_EMAIL?.trim() || 'admin@portfolio.local'
  const password = process.env.ADMIN_SEED_PASSWORD || randomPassword()
  const generated = !process.env.ADMIN_SEED_PASSWORD

  process.stdout.write(`hashing password (PBKDF2-SHA256, 210k iterations)...\n`)
  const passwordHash = await hashPassword(password)

  const id = crypto.randomUUID()
  const nowSeconds = Math.floor(Date.now() / 1000)

  // D1/SQLite has no ON CONFLICT DO UPDATE before 3.35; the modern syntax is
  // supported, so reset-or-insert in a single statement.
  const sql = `
INSERT INTO admin_user (id, email, password_hash, display_name, created_at)
VALUES (${sqlLiteral(id)}, ${sqlLiteral(email)}, ${sqlLiteral(passwordHash)}, 'Administrator', ${nowSeconds})
ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash;
`

  const dir = mkdtempSync(join(tmpdir(), 'admin-seed-'))
  const file = join(dir, 'seed.sql')
  writeFileSync(file, sql, 'utf8')

  const args = ['d1', 'execute', 'portfolio', '--file', file]
  if (remote) args.push('--remote')

  try {
    // Piped, not inherited: PowerShell mangles wrangler's stderr (it renders
    // as an empty `node.exe :` block), which hides the real constraint error.
    // NOT `shell: true` — that triggers Node's DEP0190 arg-injection warning.
    // On Windows npx is npx.cmd, so invoke it through ComSpec directly.
    const isWindows = process.platform === 'win32'
    const result = isWindows
      ? spawnSync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', 'npx', 'wrangler', ...args], { encoding: 'utf8' })
      : spawnSync('npx', ['wrangler', ...args], { encoding: 'utf8' })
    if (result.stdout) process.stdout.write(result.stdout)
    if (result.stderr) process.stderr.write(result.stderr)

    if (result.status !== 0) {
      console.error(`\nSeed failed (wrangler exited ${result.status}).`)
      process.exitCode = 1
      return
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }

  console.log('\n─────────────────────────────────────────────')
  console.log(`  email    : ${email}`)
  console.log(`  password : ${generated ? password : '(from ADMIN_SEED_PASSWORD)'}`)
  console.log('─────────────────────────────────────────────')
  if (generated) {
    console.log('Save this now — it is not recoverable.')
  }
  console.log(`\nTarget: ${remote ? 'PRODUCTION (--remote)' : 'local dev'}\n`)
}

await main()