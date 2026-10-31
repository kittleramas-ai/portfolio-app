import { drizzle } from 'drizzle-orm/mysql2'
import type { MySql2Database } from 'drizzle-orm/mysql2'
import { sql } from 'drizzle-orm'
import mysql from 'mysql2/promise'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import * as schema from './schema.ts'
import { resolveDatabaseUrl } from './path.ts'

/**
 * MySQL database.
 *
 * Previously a SQLite file via `better-sqlite3`. Moved to MySQL so the engine
 * matches bookade (`mysql2` + `dialect: 'mysql'`), which is the reference this
 * project's Drizzle discipline is modelled on.
 *
 * `resolveDatabaseUrl` is shared with `drizzle.config.ts`, so the CLI and the
 * runtime always target the same database.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS CHANGE COSTS EVERY CALL SITE
 * ---------------------------------------------------------------------------
 * `better-sqlite3` is SYNCHRONOUS; `mysql2/promise` is not. Every read that
 * used `db.get()` / `db.all()` / `db.run()` synchronously is now awaited:
 *
 *   const row = db.get(...)   ->   const [row] = await db.select()...
 *   const rows = db.all(...)  ->   const rows = await db.select()...
 *   db.run(...)                ->   await db.execute(...)
 *
 * This is why `initDb()` returns a handle whose queries are all promises, and
 * why the verification scripts became async.
 *
 * The three pragmas the SQLite version needed have no MySQL equivalent and are
 * gone: `journal_mode = WAL` (a file-level setting), `foreign_keys = ON` (MySQL
 * enforces FKs by default via InnoDB) and `busy_timeout` (replaced by the
 * pool's own `connectTimeout`/`queueLimit`). What replaces them is pool
 * configuration, taken from bookade's `initDb()`.
 */

/** Where drizzle-kit writes and reads migrations. */
export const MIGRATIONS_FOLDER = resolve(process.cwd(), 'drizzle')

let _db: MySql2Database<typeof schema> | null = null
let _pool: mysql.Pool | null = null

/**
 * Open the pool and return the Drizzle handle. Idempotent.
 *
 * No connection is opened at import time: importing this module happens during
 * the build, and opening a database as a side effect of an import breaks route
 * analysis.
 */
export function initDb(): MySql2Database<typeof schema> {
  if (_db) return _db

   _pool = mysql.createPool({
     uri: resolveDatabaseUrl(process.env),
      timezone: '+05:30',
     // Queue rather than reject when every connection is busy: this app is
     // overwhelmingly reads with a single occasional admin write, so waiting is
     // always cheaper than a failed request.
     waitForConnections: true,
     connectionLimit: Number(process.env.DATABASE_POOL_SIZE ?? 10),
     queueLimit: 0,
     enableKeepAlive: true,
   })

  _db = drizzle(_pool, { schema, mode: 'default' })
  return _db
}

export function getDb(): MySql2Database<typeof schema> {
  return _db ?? initDb()
}

/** Drain and close the pool. For tests and scripts. */
export async function closeDb(): Promise<void> {
  if (_pool) {
    await _pool.end()
    _pool = null
  }
  _db = null
}

export type Db = ReturnType<typeof initDb>

/**
 * The module-level handle every caller should use.
 *
 * The Proxy resolves on first property access and BINDS each method to the live
 * handle, so `db.select()` keeps its `this` and an import can never observe
 * `undefined` before initialisation. This is bookade's `src/server/db/index.ts`
 * pattern, and it is also what makes the handle mockable in tests without a
 * dependency-injection container.
 */
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const client = getDb()
    const value = client[prop as keyof Db]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

/* --------------------------------------------------------------- schema state */

export type SchemaState = {
  /** True when every table this app expects is present. */
  ready: boolean
  tablesPresent: string[]
  missing: string[]
  /** Migrations drizzle-kit has committed to `drizzle/`. */
  expectedMigrations: number
}

const EXPECTED_TABLES = [
  'admin_user',
  'admin_session',
  'site_setting',
  'site_media',
  'advisory_enquiry',
] as const

/** How many migrations the journal declares. */
function expectedMigrationCount(): number {
  try {
    const journal = JSON.parse(
      readFileSync(join(MIGRATIONS_FOLDER, 'meta', '_journal.json'), 'utf8'),
    ) as { entries?: unknown[] }
    return Array.isArray(journal.entries) ? journal.entries.length : 0
  } catch {
    return 0
  }
}

/**
 * Is the database migrated?
 *
 * Under SQLite this compared `created_at` against drizzle's
 * `__drizzle_migrations` bookkeeping table. MySQL has no equivalent table —
 * drizzle tracks applied migrations only when you use its own programmatic
 * migrator, and this project applies them with the `drizzle-kit migrate` CLI.
 * So the question is answered directly instead: do the tables exist?
 *
 * `information_schema.tables` is MySQL's catalogue, not a modelled table, so
 * there is no builder shape for it and the query goes through the `sql` tag.
 * Same carve-out bookade makes: its `/api/health` runs
 * `db.execute(sql\`SELECT COUNT(*) FROM __drizzle_migrations\`)` and nothing else
 * in the app touches the driver.
 */
export async function schemaState(): Promise<SchemaState> {
  const handle = getDb()

  const rows = await handle.execute<{ TABLE_NAME: string }>(
    sql`SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE()`,
  )
  const present = new Set(
    (rows[0] as unknown as Array<{ TABLE_NAME: string }>).map((r) => r.TABLE_NAME),
  )

  const tablesPresent = EXPECTED_TABLES.filter((t) => present.has(t))

  return {
    ready: tablesPresent.length === EXPECTED_TABLES.length,
    tablesPresent,
    missing: EXPECTED_TABLES.filter((t) => !present.has(t)),
    expectedMigrations: expectedMigrationCount(),
  }
}