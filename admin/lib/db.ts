import { config } from 'dotenv'
import { sql } from 'drizzle-orm'

import { resolveDatabaseUrl } from '../../src/db/path.ts'

/**
 * Shared setup for the verification scripts in admin/.
 *
 * Loads the same env files `drizzle.config.ts` loads, so a check resolves the
 * same database the app does. `.env.local` previously carried a commented-out
 * `DATABASE_URL="dev.db"` with a note that it "silently redirected the app to a
 * different, non-existent database file than the CLI tools used" — which is
 * exactly the drift `resolveDatabaseUrl` now prevents, and this loader is what
 * stops the scripts drifting the other way.
 */
export function loadEnv(): void {
  config({ path: ['.env.local', '.env'], quiet: true })
}

/**
 * A Drizzle handle on the app's own database, for scripts that need to read or
 * write rows directly.
 *
 * These used to return a raw `better-sqlite3` connection and the checks called
 * `.exec()` / `.prepare()` with hand-built SQL strings. Everything now goes
 * through the query builder, or through the `sql` tag for the few statements
 * that are genuinely SQL-shaped (catalogue introspection). bookade is the
 * reference for this line: its app code contains zero driver-level calls, so
 * nothing can execute a string against the database except through Drizzle.
 *
 * The caller MUST call `closeCheckDb()` when finished — this opens its own pool
 * alongside the one the running app holds.
 */
export async function openCheckDb() {
  loadEnv()
  const { getDb, schemaState } = await import('../../src/db/index.ts')
  const db = getDb()

  let url: string
  try {
    url = resolveDatabaseUrl(process.env)
  } catch (err) {
    throw new Error((err as Error).message)
  }

  // Fail loudly rather than silently testing an empty database. That failure
  // mode is not hypothetical: `integration.ts` used to report ALL PASS against
  // a Cloudflare D1 file the app had not touched for months.
  let state
  try {
    state = await schemaState()
  } catch (err) {
    throw new Error(
      `Cannot reach MySQL at ${url.replace(/:[^:@/]+@/, ':***@')}. ` +
        `Is the server running, and is the database created?\n  (${
          (err as Error).message
        })`,
    )
  }
  if (!state.ready) {
    throw new Error(
      `Database is missing table(s): ${state.missing.join(', ')}. ` +
        'Run: npm run db:migrate',
    )
  }

  return { db, url }
}

/** Close the pool opened by `openCheckDb`. */
export async function closeCheckDb(): Promise<void> {
  const { closeDb } = await import('../../src/db/index.ts')
  await closeDb()
}

/** Re-exported so scripts need not import drizzle-orm just for a probe. */
export { sql }