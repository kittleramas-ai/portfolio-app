import { cache } from 'react'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'

import { getSiteSettings } from './settings.ts'
import { insertEnquiry } from './enquiries.ts'
import { sendEnquiryNotification } from './enquiry-email.ts'
import { listMedia } from './media.ts'
import { uploadsDir } from './media-storage.ts'
import { DEFAULT_SITE_SETTINGS } from './settings-schema.ts'
import type { SiteSettings } from './settings-schema.ts'
import type { MediaEntry } from './media-schema.ts'

/**
 * Public read of site settings + media slots.
 *
 * No auth: these values already render on the public site. Only the contact and
 * hero groups exist today. If a secret is ever added here, do NOT return it
 * from this function — add a separate admin-only getter instead.
 *
 * IMPORTANT: this module reaches D1 (and possibly R2) via `src/db/index.ts`,
 * which imports `cloudflare:workers`. That import is denied to the client
 * bundle by @tanstack/react-start's import-protection, so this file may only
 * be imported from a `createServerFn` handler — never directly from a route
 * loader or a component. Route files are compiled into BOTH graphs, so
 * importing this from one fails the build.
 *
 * `cache` dedupes within a single request, so the hero and the WhatsApp button
 * do not issue two D1 queries for the same row.
 */
const readPublicSettings = cache(async (): Promise<SiteSettings> => {
  try {
    return await getSiteSettings()
  } catch {
    // A missing D1 binding must not take the public site down.
    return DEFAULT_SITE_SETTINGS
  }
})

export type PublicMedia = {
  slot: MediaEntry['slot']
  url: string | null
  altText: string
  width: number | null
  height: number | null
  updatedAt: string | null
}

export const getPublicMediaFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<PublicMedia[]> => {
    try {
      const entries = await listMedia()
      return entries.map((e) => ({
        slot: e.slot,
        url: e.url
          ? `${e.url}?v=${encodeURIComponent(e.updatedAt ?? String(Date.now()))}`
          : null,
        altText: e.altText,
        width: e.width,
        height: e.height,
        updatedAt: e.updatedAt,
      }))
    } catch {
      return []
    }
  },
)

export const getPublicSettingsFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SiteSettings> => readPublicSettings(),
)

/**
 * Record one advisory-form submission in `advisory_enquiry`.
 *
 * Public and unauthenticated by definition — the form is on the marketing page.
 * That is also why every field is length-capped here rather than in a schema
 * the form shares with the admin panel: an unbounded string from an anonymous
 * caller is the one input the Zod admin schemas cannot protect.
 *
 * `isRead` starts at 0 and nothing else ever writes this table, so the row is
 * the whole record: there is no draft/soft-delete state to reconcile.
 */
const enquiryInput = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(120),
  lastName: z.string().trim().max(120).default(''),
  email: z.string().trim().email('Enter a valid email').max(250),
  phoneOrCompany: z.string().trim().max(160).default(''),
  message: z.string().trim().min(1, 'Message is required').max(8000),
})

export const submitEnquiryFn = createServerFn({ method: 'POST' })
  .validator(enquiryInput)
  .handler(async ({ data }) => {
    const request = getRequest()
    const enquiry = {
      firstName: data.firstName,
      lastName: data.lastName || null,
      email: data.email.toLowerCase(),
      phoneOrCompany: data.phoneOrCompany || null,
      message: data.message,
      ipAddress:
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        request.headers.get('x-real-ip') ??
        null,
      userAgent: request.headers.get('user-agent')?.slice(0, 512) ?? null,
    }
    await insertEnquiry(enquiry)

    try {
      await sendEnquiryNotification(enquiry)
      return { ok: true as const, notificationSent: true }
    } catch (error) {
      console.error('[enquiry] notification email failed:', error)
      return { ok: true as const, notificationSent: false }
    }
  })

/**
 * Whether uploads can be written right now.
 *
 * Always true on a Node server (which is what the app runs on now). Kept as an
 * explicit probe rather than assuming, so the admin UI can show a real error if
 * the uploads directory is unwritable — a misconfigured `UPLOADS_DIR` or a
 * read-only mount is otherwise only discovered when an upload fails.
 */
export const getMediaAvailabilityFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ available: boolean; reason: string | null }> => {
    try {
      const { mkdir, access } = await import('node:fs/promises')
      await mkdir(uploadsDir(), { recursive: true })
      await access(uploadsDir())
      return { available: true, reason: null }
    } catch (err) {
      return {
        available: false,
        reason: `The uploads folder is not writable: ${
          err instanceof Error ? err.message : String(err)
        }`,
      }
    }
  },
)