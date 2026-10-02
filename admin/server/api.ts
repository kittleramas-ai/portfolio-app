import { createServerFn } from '@tanstack/react-start'
import {
  getRequest,
  setResponseHeader,
} from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { getDb } from '../../src/db/index.ts'
import { adminSession, adminUser } from '../../src/db/schema.ts'
import { verifyPassword } from './password.ts'
import {
  buildSessionCookie,
  buildClearSessionCookie,
  generateSessionToken,
  hashSessionToken,
  sessionExpiry,
} from './session-token.ts'
import { getSessionPepper } from './env.ts'
import { pruneExpiredSessions, requireAdmin, resolveAdmin } from './session.ts'
import {
  contactSettingsSchema,
  heroSettingsSchema,
  SETTINGS_GROUPS,
} from './settings-schema.ts'
import { getSiteSettings, saveSettingsGroup } from './settings.ts'
import {
  deleteMedia,
  listMedia,
  saveMedia,
  updateAltText,
} from './media.ts'
import {
  altTextSchema,
  mediaSlotKeySchema,
  MEDIA_SLOTS,
} from './media-schema.ts'

const loginInput = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginResult =
  | { ok: true; redirect: string }
  | { ok: false; error: string }

/**
 * Sign in with email + password.
 *
 * Failure responses are deliberately identical for "no such user" and "wrong
 * password" — a distinguishable error lets an attacker enumerate which email
 * addresses have accounts. (bookade-src gets this right too.)
 *
 * No lockout or rate limiting here: one admin account on a small portfolio, and
 * 210k-iteration PBKDF2 makes each attempt expensive enough to matter. Worth
 * adding Cloudflare WAF rules before this is ever internet-facing.
 */
export const loginFn = createServerFn({ method: 'POST' })
  .validator(loginInput)
  .handler(async ({ data }): Promise<LoginResult> => {
    const db = getDb()

    const users = await db
      .select()
      .from(adminUser)
      .where(eq(adminUser.email, data.email))
      .limit(1)

    const GENERIC = 'Incorrect email or password.'

    // Hash unconditionally, even when no user matched, so response time does
    // not reveal whether the address exists. `users[0]` is typed non-nullable
    // because of `noUncheckedIndexedAccess` being off, hence the explicit
    // length check rather than optional chaining — the runtime case this guards
    // is real even though the type says it cannot happen.
    const matched = users.length > 0 ? users[0] : undefined
    const storedHash: string = matched ? matched.passwordHash : DUMMY_HASH
    const ok = await verifyPassword(data.password, storedHash)
    if (!matched || !ok) return { ok: false, error: GENERIC }

    const token = generateSessionToken()
    const expires = sessionExpiry()

    await db.insert(adminSession).values({
      id: crypto.randomUUID(),
      userId: matched.id,
      tokenHash: await hashSessionToken(token, getSessionPepper()),
      expiresAt: expires,
      createdAt: new Date(),
      userAgent: null,
    })
    await db
      .update(adminUser)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUser.id, matched.id))

    setResponseHeader('Set-Cookie', buildSessionCookie(token, expires))
    void pruneExpiredSessions()

    return { ok: true, redirect: '/admin' }
  })

/**
 * A syntactically valid PBKDF2 hash of a value nobody knows, used to keep the
 * timing of a failed login constant. Fixed so it is never a real credential.
 */
const DUMMY_HASH =
  'pbkdf2-sha256$210000$AAAAAAAAAAAAAAAAAAAAAA==$' +
  'ZG9uY3QubG9vay1tZS1pbi1hbi1hdC1lc2NhcGUtc2VjcmV0LXZhbHVlLXh4'

export const logoutFn = createServerFn({ method: 'POST' }).handler(
  async (): Promise<{ ok: true }> => {
    setResponseHeader('Set-Cookie', buildClearSessionCookie())
    return { ok: true }
  },
)

/** Current admin, or null. Used by the admin shell to render the header. */
export const currentAdminFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{
    email: string
    displayName: string | null
  } | null> => {
    const session = await resolveAdmin(getRequest())
    if (!session) return null
    return { email: session.email, displayName: session.displayName }
  },
)

/** Read all settings. Admin-only (values include contact details). */
export const getAdminSettingsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireAdmin(getRequest())
    return {
      settings: await getSiteSettings(),
      groups: SETTINGS_GROUPS,
    }
  },
)

const saveContactInput = z.object({ contact: contactSettingsSchema })
const saveHeroInput = z.object({ hero: heroSettingsSchema })

/** Save the contact group (WhatsApp number, email, phone display). */
export const saveContactSettingsFn = createServerFn({ method: 'POST' })
  .validator(saveContactInput)
  .handler(async ({ data }) => {
    const admin = await requireAdmin(getRequest())
    const saved = await saveSettingsGroup('contact', data.contact, admin.userId)
    return { ok: true as const, contact: saved, savedAt: new Date().toISOString() }
  })

/** Save the hero group (statement, counter line, CTA labels/links). */
export const saveHeroSettingsFn = createServerFn({ method: 'POST' })
  .validator(saveHeroInput)
  .handler(async ({ data }) => {
    const admin = await requireAdmin(getRequest())
    const saved = await saveSettingsGroup('hero', data.hero, admin.userId)
    return { ok: true as const, hero: saved, savedAt: new Date().toISOString() }
  })

// ---------------------------------------------------------------- media

/** All slots + their current uploads. Admin-only. */
export const getAdminMediaFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireAdmin(getRequest())
    return { entries: await listMedia(), slots: MEDIA_SLOTS }
  },
)

/**
 * Upload an image for a slot.
 *
 * Takes raw bytes rather than a multipart FormData: TanStack server functions
 * serialise their input, and base64 in a JSON payload would inflate a 2 MB
 * image to ~2.7 MB and copy it twice in memory. A dedicated POST route handles
 * the multipart body natively.
 *
 * This function exists for the JSON path used by the admin UI; see
 * `src/routes/api/admin/media.$slot.ts` for the streaming upload route.
 */
export const saveMediaFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      slot: mediaSlotKeySchema,
      declaredType: z.string(),
      altText: altTextSchema.default(''),
      dataBase64: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin(getRequest())
    const bytes = Uint8Array.from(atob(data.dataBase64), (c) => c.charCodeAt(0))
    return saveMedia({
      slot: data.slot,
      declaredType: data.declaredType,
      bytes,
      altText: data.altText,
      updatedBy: admin.userId,
    })
  })

/** Remove a slot's upload, restoring the bundled fallback asset. */
export const deleteMediaFn = createServerFn({ method: 'POST' })
  .validator(z.object({ slot: mediaSlotKeySchema }))
  .handler(async ({ data }) => {
    await requireAdmin(getRequest())
    return deleteMedia(data.slot)
  })

/** Edit alt text without re-uploading. */
export const updateAltTextFn = createServerFn({ method: 'POST' })
  .validator(z.object({ slot: mediaSlotKeySchema, altText: altTextSchema }))
  .handler(async ({ data }) => {
    await requireAdmin(getRequest())
    return updateAltText(data.slot, data.altText)
  })