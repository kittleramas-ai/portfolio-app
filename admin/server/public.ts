import { cache } from 'react'
import { createServerFn } from '@tanstack/react-start'

import { getSiteSettings } from './settings.ts'
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
}

export const getPublicMediaFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<PublicMedia[]> => {
    try {
      const entries = await listMedia()
      return entries.map((e) => ({
        slot: e.slot,
        url: e.url,
        altText: e.altText,
        width: e.width,
        height: e.height,
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