import { cache } from 'react'
import { createServerFn } from '@tanstack/react-start'

import { getSiteSettings } from './settings.ts'
import { DEFAULT_SITE_SETTINGS } from './settings-schema.ts'
import type { SiteSettings } from './settings-schema.ts'

/**
 * Public read of site settings.
 *
 * No auth: these values already render on the public site. Only the contact and
 * hero groups exist today. If a secret is ever added here, do NOT return it
 * from this function — add a separate admin-only getter instead.
 *
 * IMPORTANT: this module reaches D1 via `src/db/index.ts`, which imports
 * `cloudflare:workers`. That import is denied to the client bundle by
 * @tanstack/react-start's import-protection, so this file may only be imported
 * from a `createServerFn` handler — never directly from a route loader or a
 * component. Route files are compiled into BOTH graphs, so importing this from
 * one fails the build.
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

export const getPublicSettingsFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SiteSettings> => readPublicSettings(),
)