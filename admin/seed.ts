/**
 * Seed the single admin user.
 *
 *   npm run db:seed        (or: npm run seed:all, which migrates first)
 *
 * Generates a password when ADMIN_SEED_PASSWORD is not set, hashes it with the
 * same PBKDF2 the login path uses, then writes through the Drizzle query
 * builder. (This used to shell out to `wrangler d1 execute`; the app is on a
 * Node server now, so it talks to the same database file the app does.)
 *
 * Re-running RESETS the password for the same email rather than erroring, so it
 * doubles as a recovery tool if the manager is locked out.
 *
 * Migrations are NOT run here. This script previously called an
 * `ensureSchema()` that created tables on the fly; that is gone, because the
 * schema now comes from `drizzle/*.sql` via `npm run db:migrate`. Instead it
 * checks and refuses with an actionable message, which is the discipline
 * bookade uses: its `instrumentation.ts` says only "run `npm run seed:all`
 * after migrations", and `seed:all` is defined as `db:migrate && db:seed`.
 */

import { config } from 'dotenv'

import { hashPassword } from './server/password.ts'

config({ path: ['.env.local', '.env'], quiet: true })

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

function randomPassword(length = 20): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
}

async function main() {
  const email =
    process.env.ADMIN_SEED_EMAIL?.trim() || 'admin@portfolio.local'
  const password = process.env.ADMIN_SEED_PASSWORD || randomPassword()
  const generated = !process.env.ADMIN_SEED_PASSWORD

  process.stdout.write(
    'hashing password (PBKDF2-SHA256, 210k iterations)...\n',
  )
  const passwordHash = await hashPassword(password)

  // Migrations are an explicit step, so verify rather than create. Under MySQL
  // this is a straight "do the tables exist" check — unlike SQLite there is no
  // bookkeeping table to compare a version against, and nothing to baseline.
  const { closeDb, getDb, schemaState } = await import(
    '../src/db/index.ts'
  )

  let state
  try {
    state = await schemaState()
  } catch (err) {
    console.error(
      `\nCannot reach MySQL. Is the server running, and is DATABASE_URL correct?\n` +
        `  (${(err as Error).message})\n`,
    )
    await closeDb()
    process.exit(1)
  }

  if (!state.ready) {
    console.error(
      `\nThe database is missing table(s): ${state.missing.join(', ')}.\n\n` +
        '  npm run db:migrate\n',
    )
    await closeDb()
    process.exit(1)
  }

  const { eq } = await import('drizzle-orm')
  const { adminUser } = await import('../src/db/schema.ts')

  const db = getDb()
  const existing = await db
    .select()
    .from(adminUser)
    .where(eq(adminUser.email, email))
    .limit(1)

  const now = new Date()

  if (existing.length > 0) {
    await db
      .update(adminUser)
      .set({ passwordHash })
      .where(eq(adminUser.id, existing[0].id))
    console.log(`\nreset password for existing user: ${email}`)
  } else {
    await db.insert(adminUser).values({
      id: crypto.randomUUID(),
      email,
      passwordHash,
      displayName: 'Administrator',
      createdAt: now,
    })
    console.log(`\ncreated admin user: ${email}`)
  }

  console.log('─────────────────────────────────────────────')
  console.log(`  email    : ${email}`)
  console.log(`  password : ${generated ? password : '(from ADMIN_SEED_PASSWORD)'}`)
  console.log('─────────────────────────────────────────────')
  if (generated) {
    console.log('Save this now — it is not recoverable.')
  }
  console.log()
  await closeDb()
}

await main()