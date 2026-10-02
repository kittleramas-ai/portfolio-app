import Database from 'better-sqlite3'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Direct SQLite access for the verification scripts.
 *
 * The app moved off Cloudflare D1 to a plain SQLite file, so the checks in
 * admin/ no longer shell out to `wrangler d1 execute`. They open the same file
 * the app does, which also means they validate the real database rather than a
 * parallel copy.
 */
export function openDb(path?: string): Database.Database {
  const file = resolve(
    process.cwd(),
    path ?? process.env.DATABASE_FILE ?? 'data/portfolio.db',
  )
  if (!existsSync(file)) {
    throw new Error(
      `No database at ${file}. Run: npm run admin:seed (creates it on first use)`,
    )
  }
  const db = new Database(file)
  db.pragma('foreign_keys = ON')
  return db
}

/** Run a statement, ignoring "already migrated" style conflicts. */
export function exec(db: Database.Database, sql: string): void {
  db.exec(sql)
}