import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

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
 */
export const adminUser = sqliteTable(
  'admin_user',
  {
    id: text('id').primaryKey(),
    /** UNIQUE: email is the login identity. Without this, two rows could
     *  share an address and `ON CONFLICT(email)` upserts would fail outright. */
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    displayName: text('display_name'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch()) * 1000`),
    lastLoginAt: integer('last_login_at', { mode: 'timestamp_ms' }),
  },
  (t) => [uniqueIndex('admin_user_email_uq').on(t.email)],
)

export const adminSession = sqliteTable(
  'admin_session',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => adminUser.id, { onDelete: 'cascade' }),
    /** sha256(rawToken + pepper). Indexed — it is the only column read on every request. */
    tokenHash: text('token_hash').notNull(),
    /**
     * MUST be 'timestamp_ms', not 'timestamp'.
     *
     * Drizzle's `timestamp` mode treats the integer as SECONDS. The app writes
     * Date.now() (milliseconds), so a `timestamp` column read the value back as
     * 1.79e12 seconds = the year 58722 — which meant an expired session's
     * `expiresAt <= now` check never fired and expired sessions kept working.
     * `timestamp_ms` matches what is actually written.
     */
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch()) * 1000`),
    lastActiveAt: integer('last_active_at', { mode: 'timestamp_ms' }),
    userAgent: text('user_agent'),
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
 * makes bookade's settings blob lose writes under concurrent edits).
 *
 * `groupKey` exists purely to organise the admin UI into sections. The set of
 * legal keys and their shapes is defined by Zod in
 * `src/server/admin/settings-schema.ts` — the DB does not enforce it.
 */
export const siteSetting = sqliteTable(
  'site_setting',
  {
    key: text('key').primaryKey(),
    /** JSON-encoded value. A scalar is stored as a bare JSON scalar, not wrapped. */
    value: text('value').notNull(),
    groupKey: text('group_key').notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch()) * 1000`),
    updatedBy: text('updated_by').references(() => adminUser.id, {
      onDelete: 'set null',
    }),
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
 * Bytes live in R2 under `storageKey`; this table is metadata only. R2 has no
 * writable local filesystem on workerd, so storing images as DB blobs is not an
 * option (and D1 caps a row at ~1 MB anyway).
 *
 * `fallbackKey` lets a slot keep rendering the bundled asset in
 * `src/asserts/` when no upload exists yet, so the site never shows a broken
 * image on a fresh install.
 */
export const siteMedia = sqliteTable('site_media', {
  /** Named position: hero_portrait, signature, og_image, favicon. */
  slot: text('slot').primaryKey(),
  /** R2 object key. Unique so two slots cannot point at one object. */
  storageKey: text('storage_key').notNull().unique(),
  contentType: text('content_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  /** Intrinsic dimensions, read from the file header at upload time. */
  width: integer('width'),
  height: integer('height'),
  altText: text('alt_text').notNull().default(''),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch()) * 1000`),
  updatedBy: text('updated_by').references(() => adminUser.id, {
    onDelete: 'set null',
  }),
})