import {
  customType,
  index,
  int,
  mediumtext,
  mysqlTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

/**
 * Every column carrying an index is at or under 250 characters.
 *
 * This is a MySQL 9 constraint, not a style choice: the server caps a single
 * index key at 1000 bytes, and with `utf8mb4` each character costs up to 4, so
 * `varchar(255)` on a UNIQUE column asks for 1020 bytes and the CREATE TABLE
 * fails with `ERROR 1071 Specified key was too long`. MySQL 8 allowed 3072,
 * so a schema that worked there breaks here.
 *
 * 250 characters is not a real constraint: RFC 5321 caps an email address at
 * 254, and a storage key is a filename.
 */
const INDEXED = 250 as const

/**
 * A DATETIME column that serializes Date values as the India-local wall
 * clock and deserializes stored wall-clock text back as India time.
 *
 * Under plain `datetime(config.mode = 'date')`, MySQL stores the UTC wall
 * clock of every JS Date, while MySQL's `CURRENT_TIMESTAMP` default produces
 * the server-local wall clock and hand-written SQL fallbacks wrote
 * `DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 330 MINUTE)` (India). Every column in
 * this schema therefore carries a consistent interpretation: India wall
 * time. Adding+or subtracting the +05:30 offset when writing/reading keeps
 * the DB column the human-readable local answer instead of a split between
 * Date-mode rows (UTC) and SQL-expression rows (India).
 */
const istDateTime = customType<{
  data: Date
  driverData: string
}>({
  dataType: () => 'datetime',
  toDriver: (value: Date) =>
    new Date(value.getTime() + 330 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' '),
  fromDriver: (value: string) =>
    new Date(value.replace(' ', 'T') + '+05:30'),
})

/**
 * Admin auth.
 *
 * Deliberately minimal: ONE user, no roles, no permissions table. The entire
 * access-control question this app answers is "is this request authenticated?"
 * — modelled here as the presence of a valid, unexpired row in `adminSession`.
 *
 * `passwordHash` holds a bcrypt digest. `tokenHash` holds
 * sha256(rawToken + pepper) — the raw token exists only in the user's cookie
 * and is never stored, so a leaked database cannot be replayed as a session.
 *
 * ---------------------------------------------------------------------------
 * MYSQL, NOT SQLITE — what changed and why it matters
 * ---------------------------------------------------------------------------
 * Every `text()` became `varchar(n)`: MySQL cannot index an unbounded TEXT
 * column without a prefix length, and `token_hash` and `email` are both indexed
 * and both looked up on every request. Lengths are generous headroom over the
 * real values (64-char hex tokens, ~40-char emails) rather than tight fits, so
 * widening a value later is not a migration.
 *
 * Timestamps moved from `integer(timestamp_ms)` to `datetime`, which stores a
 * `Date` directly and removes the whole class of unit bug documented on
 * `expiresAt` below — the millisecond/second mixup that once let expired
 * sessions keep working cannot happen when the column is a date type. `now()`
 * replaces `(unixepoch()) * 1000`.
 */
export const adminUser = mysqlTable(
  'admin_user',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    /** UNIQUE: email is the login identity. Without this, two rows could
     *  share an address and `ON DUPLICATE KEY` upserts would misbehave. */
    email: varchar('email', { length: INDEXED }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    displayName: varchar('display_name', { length: 120 }),
    createdAt: istDateTime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    lastLoginAt: istDateTime('last_login_at'),
  },
  (t) => [uniqueIndex('admin_user_email_uq').on(t.email)],
)

export const adminSession = mysqlTable(
  'admin_session',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => adminUser.id, { onDelete: 'cascade' }),
    /** sha256(rawToken + pepper) — 64 hex chars. Indexed, and the only column
     *  read on every authenticated request. */
    tokenHash: varchar('token_hash', { length: 128 }).notNull(),
    /**
     * A `datetime`, not an integer.
     *
     * Under SQLite this was `integer(..., { mode: 'timestamp_ms' })` after a
     * real bug: it had been `mode: 'timestamp'`, which Drizzle reads as SECONDS,
     * while the app wrote `Date.now()` (MILLISECONDS). Every expiry came back as
     * a date in the year 58722, so `expiresAt <= now` never fired and expired
     * sessions kept working. A date-typed column removes the unit ambiguity
     * entirely rather than relying on picking the right mode.
     */
    expiresAt: istDateTime('expires_at').notNull(),
    createdAt: istDateTime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    lastActiveAt: istDateTime('last_active_at'),
    userAgent: varchar('user_agent', { length: 512 }),
  },
  (t) => [
    uniqueIndex('admin_session_token_hash_uq').on(t.tokenHash),
    index('admin_session_user_idx').on(t.userId),
  ],
)

/**
 * Editable site content, one row per setting key.
 *
 * Key/value rather than a single JSON blob: it makes "which values exist" a
 * closed set you can validate and render, and a partial update is a single-row
 * upsert instead of a read-modify-write of the whole document (which is what
 * makes concurrent edits lose writes).
 *
 * `groupKey` exists purely to organise the admin UI into sections. The set of
 * legal keys and their shapes is defined by Zod in
 * `admin/server/settings-schema.ts` — the DB does not enforce it.
 */
export const siteSetting = mysqlTable(
  'site_setting',
  {
    key: varchar('key', { length: 64 }).primaryKey(),
    /** JSON-encoded value. A scalar is stored as a bare JSON scalar, not wrapped.
     *  MEDIUMTEXT (16 MB) rather than TEXT (64 KB): the `achievements` deck is
     *  ~6 KB today and copy grows, and TEXT would sit uncomfortably close. */
    value: mediumtext('value').notNull(),
    groupKey: varchar('group_key', { length: 64 }).notNull(),
    updatedAt: istDateTime('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedBy: varchar('updated_by', { length: 36 }).references(
      () => adminUser.id,
      { onDelete: 'set null' },
    ),
  },
  (t) => [index('site_setting_group_idx').on(t.groupKey)],
)

/**
 * Uploaded images, one row per SLOT rather than one row per file.
 *
 * The slot is the primary key because the site's images are named positions
 * ("the signature", "the hero portrait"), not a gallery. That keeps the admin
 * UI finite — there is no "add another image" button, so the manager cannot
 * upload a 4MB photo into a slot that renders at 300px — and makes replacing a
 * slot a single upsert.
 *
 * Bytes live on disk under `storageKey` (via `node:fs`, enabled by the Node
 * server target); this table is metadata only.
 */
/**
 * Enquiries submitted through the advisory form on the public site.
 *
 * One row per submission, never edited by the app — the manager reads them in
 * phpMyAdmin or an admin list later. `ipAddress`/`userAgent` are stored because a
 * public, unauthenticated form is trivially spam-filled; they are the first two
 * things worth checking before trusting an entry.
 */
export const advisoryEnquiry = mysqlTable('advisory_enquiry', {
  id: varchar('id', { length: 36 }).primaryKey(),
  firstName: varchar('first_name', { length: 120 }).notNull(),
  lastName: varchar('last_name', { length: 120 }),
  email: varchar('email', { length: INDEXED }).notNull(),
  phoneOrCompany: varchar('phone_or_company', { length: 160 }),
  message: mediumtext('message').notNull(),
  isRead: int('is_read').notNull().default(0),
  ipAddress: varchar('ip_address', { length: 64 }),
  userAgent: varchar('user_agent', { length: 512 }),
  createdAt: istDateTime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const siteMedia = mysqlTable('site_media', {
  /** Named position: hero_portrait, signature, og_image, favicon. */
  slot: varchar('slot', { length: 64 }).primaryKey(),
  /** Filesystem name. Unique so two slots cannot point at one object. */
  storageKey: varchar('storage_key', { length: INDEXED }).notNull().unique(),
  contentType: varchar('content_type', { length: 120 }).notNull(),
  sizeBytes: int('size_bytes').notNull(),
  /** Intrinsic dimensions, read from the file header at upload time. */
  width: int('width'),
  height: int('height'),
  altText: varchar('alt_text', { length: 500 }).notNull().default(''),
  updatedAt: istDateTime('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedBy: varchar('updated_by', { length: 36 }).references(
    () => adminUser.id,
    { onDelete: 'set null' },
  ),
})