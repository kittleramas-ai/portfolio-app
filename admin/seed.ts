/**
 * Seed the single admin user.
 *
 *   npm run admin:seed
 *
 * Generates a password when ADMIN_SEED_PASSWORD is not set, hashes it with the
 * same PBKDF2 the login path uses, then writes directly to the SQLite file.
 * (This used to shell out to `wrangler d1 execute`; the app is on a Node
 * server now, so it talks to the same database file the app does.)
 *
 * Re-running RESETS the password for the same email rather than erroring, so it
 * doubles as a recovery tool if the manager is locked out.
 */

import { hashPassword } from './server/password.ts'
import { ensureSchema } from '../src/db/index.ts'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

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

  // Create the tables if this is a brand-new database.
  ensureSchema()

  const { getDb } = await import('../src/db/index.ts')
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
}

await main()