import { eq, lt } from 'drizzle-orm'

import { getDb } from '../../src/db/index.ts'
import { adminSession, adminUser } from '../../src/db/schema.ts'
import { getSessionPepper } from './env.ts'
import {
  hashSessionToken,
  readSessionCookie,
  sessionExpiry,
} from './session-token.ts'

export type AdminSession = {
  userId: string
  email: string
  displayName: string | null
  sessionId: string
}

/**
 * Resolve the caller from the session cookie.
 *
 * Returns null for every failure mode — no cookie, unknown token, expired row —
 * because the caller only needs one answer: logged in, or not.
 *
 * Server-side only. Called from the admin route's `beforeLoad` and from every
 * API handler, so an unauthenticated request never receives admin HTML or
 * reaches admin code. bookade-src instead bounces admin routes from a
 * client-side useEffect, which means a logged-out visitor still downloads the
 * whole admin bundle before being redirected.
 */
export async function resolveAdmin(
  request: Request,
): Promise<AdminSession | null> {
  const token = readSessionCookie(request)
  if (!token) return null

  const db = getDb()
  const tokenHash = await hashSessionToken(token, getSessionPepper())
  const now = new Date()

  const found = await db
    .select({
      sessionId: adminSession.id,
      userId: adminUser.id,
      email: adminUser.email,
      displayName: adminUser.displayName,
      expiresAt: adminSession.expiresAt,
    })
    .from(adminSession)
    .innerJoin(adminUser, eq(adminSession.userId, adminUser.id))
    .where(eq(adminSession.tokenHash, tokenHash))
    .limit(1)

  // `found[0]` is typed as always defined because `noUncheckedIndexedAccess`
  // is off, but an empty result is the normal "no such token" case — so the
  // length check is real, not dead code.
  if (found.length === 0) return null
  const row = found[0]
  if (new Date(row.expiresAt).getTime() <= now.getTime()) return null

  // Sliding expiry: extend on use so an active editor is not logged out
  // mid-session. One indexed UPDATE by primary key.
  await db
    .update(adminSession)
    .set({ lastActiveAt: now, expiresAt: sessionExpiry() })
    .where(eq(adminSession.id, row.sessionId))
    .catch(() => undefined)

  return {
    userId: row.userId,
    email: row.email,
    displayName: row.displayName,
    sessionId: row.sessionId,
  }
}

/**
 * Require a valid session or throw a Response.
 *
 * Throwing a Response (rather than returning null) makes the auth check
 * impossible to forget on a write path: the request aborts unless the caller
 * explicitly handles it. This is the "fail closed" property bookade-src's
 * ability guard lacks — its `resolveCrudAbilityGuard` returns early, i.e.
 * ALLOWS, when a handler forgets to declare an ability.
 */
export async function requireAdmin(request: Request): Promise<AdminSession> {
  const session = await resolveAdmin(request)
  if (!session) {
    throw new Response('Unauthorized', { status: 401 })
  }
  return session
}

/** Purge rows that can no longer authenticate anyone. Called on login. */
export async function pruneExpiredSessions(): Promise<void> {
  await getDb()
    .delete(adminSession)
    .where(lt(adminSession.expiresAt, new Date()))
    .catch(() => undefined)
}