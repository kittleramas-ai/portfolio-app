import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import * as schema from './schema.ts'

/**
 * SQLite database.
 *
 * The site is moving off Cloudflare to a VPS (a real Node server), so the
 * previous `drizzle-orm/d1` + `cloudflare:workers` binding no longer applies:
 * D1 only exists inside Cloudflare, and `node:fs` is what makes on-disk image
 * uploads possible at all (verified: the Workers runtime reports
 * "[unenv] fs.writeFile is not implemented yet!", which is why uploads could
 * not be written from there).
 *
 * `better-sqlite3` was already a project dependency; it only needed
 * `npm rebuild` because its prebuilt binary targeted a different Node ABI.
 *
 * DB path, in order:
 *   1. DATABASE_FILE (recommended in production, absolute path)
 *   2. DATABASE_URL  (legacy name, still honoured)
 *   3. ./data/portfolio.db — dev default
 *
 * Kept outside `public/` on purpose: the database must never be web-servable.
 */
function resolveDbPath(): string {
  const configured =
    process.env.DATABASE_FILE ?? process.env.DATABASE_URL ?? ''
  if (configured && configured !== ':memory:') {
    return configured.startsWith(':')
      ? configured
      : resolve(process.cwd(), configured)
  }
  return resolve(process.cwd(), 'data', 'portfolio.db')
}

const DB_PATH = resolveDbPath()

let _db: ReturnType<typeof createDb> | null = null
let _schemaEnsured = false

function createDb() {
  if (DB_PATH !== ':memory:') mkdirSync(dirname(DB_PATH), { recursive: true })

  const client = new Database(DB_PATH)
  // WAL lets the public page read settings while an admin save is in flight.
  client.pragma('journal_mode = WAL')
  client.pragma('foreign_keys = ON')
  // Wait rather than throw if another connection holds the write lock.
  client.pragma('busy_timeout = 5000')

  ensureSchemaOn(client)

  return drizzle({ client, schema })
}

/**
 * Create the tables if they are missing, once per process.
 *
 * Done on first DB access rather than at server boot, because there is no
 * reliable boot hook in this setup — and getting it wrong fails confusingly.
 * A stale server started before the tables existed would otherwise throw
 * "no such table: admin_session" on the first admin request.
 *
 * Every statement is `IF NOT EXISTS`, so this is a cheap no-op on the hot path
 * and safe to run concurrently.
 */
function ensureSchemaOn(client: Database.Database): void {
  if (_schemaEnsured) return
  client.pragma('foreign_keys = ON')
  for (const stmt of MIGRATIONS) client.exec(stmt)
  _schemaEnsured = true
}

/**
 * Lazily created and cached per process. Not created at import time: importing
 * this module happens during the build, and opening a database as a side effect
 * of an import breaks route analysis.
 */
export function getDb() {
  if (!_db) _db = createDb()
  return _db
}

export type Db = ReturnType<typeof createDb>

/** Create tables if they are missing. Safe to call on every boot. */
export function ensureSchema(): void {
  if (DB_PATH !== ':memory:') mkdirSync(dirname(DB_PATH), { recursive: true })
  const client = new Database(DB_PATH)
  try {
    client.pragma('foreign_keys = ON')
    for (const stmt of MIGRATIONS) client.exec(stmt)
  } finally {
    client.close()
  }
}

/**
 * Schema DDL, applied at boot.
 *
 * Hand-written and idempotent (`IF NOT EXISTS`) rather than generated migration
 * files. The whole schema is four small tables, and applying at boot removes an
 * entire class of "did you run the migration on the server?" failure — the most
 * common way a VPS deploy goes wrong. Keep in sync with src/db/schema.ts;
 * `npm run db:push` regenerates that file's DDL if you change the model.
 */
const MIGRATIONS: string[] = [
  `CREATE TABLE IF NOT EXISTS admin_user (
     id            TEXT PRIMARY KEY NOT NULL,
     email         TEXT NOT NULL,
     password_hash TEXT NOT NULL,
     display_name  TEXT,
     created_at    INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
     last_login_at INTEGER
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS admin_user_email_uq ON admin_user (email)`,

  `CREATE TABLE IF NOT EXISTS admin_session (
     id             TEXT PRIMARY KEY NOT NULL,
     user_id        TEXT NOT NULL REFERENCES admin_user(id) ON DELETE CASCADE,
     token_hash     TEXT NOT NULL,
     expires_at     INTEGER NOT NULL,
     created_at     INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
     last_active_at INTEGER,
     user_agent     TEXT
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS admin_session_token_hash_uq ON admin_session (token_hash)`,
  `CREATE INDEX IF NOT EXISTS admin_session_user_idx ON admin_session (user_id)`,

  `CREATE TABLE IF NOT EXISTS site_setting (
     key        TEXT PRIMARY KEY NOT NULL,
     value      TEXT NOT NULL,
     group_key  TEXT NOT NULL,
     updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
     updated_by TEXT REFERENCES admin_user(id) ON DELETE SET NULL
   )`,
  `CREATE INDEX IF NOT EXISTS site_setting_group_idx ON site_setting (group_key)`,

  `CREATE TABLE IF NOT EXISTS site_media (
     slot         TEXT PRIMARY KEY NOT NULL,
     storage_key  TEXT NOT NULL UNIQUE,
     content_type TEXT NOT NULL,
     size_bytes   INTEGER NOT NULL,
     width        INTEGER,
     height       INTEGER,
     alt_text     TEXT NOT NULL DEFAULT '',
     updated_at   INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
     updated_by   TEXT REFERENCES admin_user(id) ON DELETE SET NULL
   )`,
]