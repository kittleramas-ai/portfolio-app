import { cache } from 'react'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'

import { getSiteSettings } from './settings.ts'
import { insertChatbotEnquiry, insertEnquiry } from './enquiries.ts'
import { sendEnquiryNotification } from './enquiry-email.ts'
import {
  ensureHeroPortraitVariants,
  ensureUploadImageVariant,
  listMedia,
} from './media.ts'
import {
  publicUrlFor,
  uploadExists,
  uploadsDir,
  uploadsUrlPrefix,
} from './media-storage.ts'
import { isAcceptablePhoneOrCompanyStrict } from '../../src/lib/phone.ts'
import { hasLetter, isValidName } from '../../src/lib/text.ts'
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from './settings-schema.ts'
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
  responsiveSrcSet: string | null
  altText: string
  width: number | null
  height: number | null
  updatedAt: string | null
}

async function optimizedUploadUrl(
  url: string,
  width: number,
): Promise<string> {
  let pathname: string
  try {
    pathname = new URL(url, 'http://localhost').pathname
  } catch {
    return url
  }

  const prefix = uploadsUrlPrefix()
  if (!pathname.startsWith(`${prefix}/`)) return url

  let fileName: string
  try {
    fileName = decodeURIComponent(pathname.slice(prefix.length + 1))
  } catch {
    return url
  }

  try {
    const variant = await ensureUploadImageVariant(fileName, width)
    return variant ? publicUrlFor(variant) : url
  } catch (error) {
    console.error('[media] could not generate responsive image:', error)
    return url
  }
}

export const getPublicMediaFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<PublicMedia[]> => {
    try {
      const entries = await listMedia()
      return Promise.all(entries.map(async (e) => {
        const version = encodeURIComponent(e.updatedAt ?? String(Date.now()))
        const originalWidth = e.width
        let responsiveSrcSet: string | null = null
        if (
          (e.slot === 'hero_portrait' || e.slot === 'signature') &&
          originalWidth !== null &&
          e.url !== null
        ) {
          const sourceFileName = e.url.slice(e.url.lastIndexOf('/') + 1)
          const widths = e.slot === 'hero_portrait' ? [300, 678] : [180, 360]
          if (e.slot === 'hero_portrait') {
            try {
              await ensureHeroPortraitVariants(sourceFileName, originalWidth)
            } catch (error) {
              console.error('[media] could not generate responsive hero images:', error)
            }
          } else {
            try {
              await Promise.all(
                widths
                  .map((width) => Math.min(width, originalWidth))
                  .filter((width, index, all) => all.indexOf(width) === index)
                  .map((width) => ensureUploadImageVariant(sourceFileName, width)),
              )
            } catch (error) {
              console.error('[media] could not generate responsive signature images:', error)
            }
          }
          const variants = await Promise.all(
            [...new Set(widths.map((width) => Math.min(width, originalWidth)))]
              .map(async (width) => {
                const fileName = e.slot === 'hero_portrait'
                  ? `${e.slot}-${width}.webp`
                  : `${sourceFileName.slice(0, sourceFileName.lastIndexOf('.'))}-${width}.webp`
                if (!(await uploadExists(fileName))) return null
                return `${publicUrlFor(fileName)}?v=${version} ${width}w`
              }),
          )
          responsiveSrcSet = variants.filter(Boolean).join(', ') || null
        }
        return {
          slot: e.slot,
          url: e.url ? `${e.url}?v=${version}` : null,
          responsiveSrcSet,
          altText: e.altText,
          width: e.width,
          height: e.height,
          updatedAt: e.updatedAt,
        }
      }))
    } catch {
      return []
    }
  },
)

export const getPublicSettingsFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SiteSettings> => {
    const settings = await readPublicSettings()
    const [pills, portraitUrl] = await Promise.all([
      Promise.all(
        settings.about.pills.map(async (pill) => ({
          ...pill,
          logoUrl: pill.logoUrl
            ? await optimizedUploadUrl(pill.logoUrl, 96)
            : pill.logoUrl,
        })),
      ),
      optimizedUploadUrl(settings.quote.portraitUrl, 112),
    ])
    return {
      ...settings,
      about: { ...settings.about, pills },
      quote: { ...settings.quote, portraitUrl },
    }
  },
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
  /**
   * One field for "phone number OR company", because on an advisory form asking
   * a founder for both is friction nobody wants.
   *
   * ASYNC refine, because the authoritative check needs libphonenumber's
   * per-country numbering plans, which are dynamically imported. A country code
   * is REQUIRED: with a `+` the number is held to the real plan for its region
   * and rejected if it cannot exist; without one the country is unknowable, so
   * it is refused rather than guessed at. See src/lib/phone.ts.
   *
   * Empty stays valid — the field is optional on both surfaces — and so does a
   * company name, which is the other thing this shared field accepts.
   */
  phoneOrCompany: z
    .string()
    .trim()
    .max(160)
    .refine(isAcceptablePhoneOrCompanyStrict, {
      message:
        'Please include your country code so we can reach you — for example +91 98765 43210, or +44 20 7946 0958. You can also enter a company name instead.',
    })
    .default(''),
  message: z.string().trim().min(1, 'Message is required').max(8000),
  recaptchaToken: z.string().nullable().optional(),
})

async function verifyRecaptcha(token: string | null | undefined): Promise<boolean> {
  const secretKey =
    process.env.RECAPTCHA_SECRET_KEY ||
    process.env.VITE_RECAPTCHA_SECRET_KEY ||
    '6LfVw-wtAAAAAOnLMnws2RP_fXikAXSpXYgDO43Y'
  if (!secretKey) return true // Bypass if secret key is not set
  if (!token) return true // If token was not generated (e.g. adblock or dev environment), do not block

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }).toString(),
    })
    const body = (await res.json()) as { success?: boolean; score?: number; 'error-codes'?: string[] }
    console.log('[reCAPTCHA Server Result]', {
      success: body.success,
      score: body.score,
      errors: body['error-codes'],
    })
    if (body.success && typeof body.score === 'number') {
      // v3 score ranges from 0.0 (bot) to 1.0 (human). 0.3 threshold catches automated scripts
      return body.score >= 0.3
    }
    return Boolean(body.success)
  } catch (err) {
    console.warn('[reCAPTCHA] verification network error:', err)
    return true
  }
}

export const submitEnquiryFn = createServerFn({ method: 'POST' })
  .validator(enquiryInput)
  .handler(async ({ data }) => {
    // Google reCAPTCHA verification
    const isHuman = await verifyRecaptcha(data.recaptchaToken)
    if (!isHuman) {
      console.warn('[reCAPTCHA] Blocked suspected bot enquiry from:', data.email)
      return { ok: true as const, notificationSent: false }
    }

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
 * Record a chatbot (Nexa) submission.
 *
 * Writes to `chatbot_enquiry`, NOT `advisory_enquiry` — see the table comment in
 * src/db/schema.ts for why these are separate rather than one table with a
 * `source` column.
 *
 * `appointment` stays a dedicated column here. It used to be folded into
 * `message` as a "--- Appointment requested: Yes" footer, which made the answer
 * unqueryable and forced every reader to strip the footer back off. The EMAIL
 * body below still carries it as prose, because a human reading the inbox wants
 * to see it inline; the row stays clean.
 */
const chatbotEnquiryInput = enquiryInput.extend({
  appointment: z.boolean().default(false),
  /**
   * Re-declared rather than inherited, because `enquiryInput` cannot carry this:
   * the contact form's fields are the same shape but a stricter rule here would
   * change what that unrelated form accepts.
   *
   * This mirrors the chatbot's own check, so posting straight to the endpoint
   * cannot slip a "555" past the UI that stopped it.
   */
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(120)
    .refine(hasLetter, {
      message: 'Please enter your name as text, not numbers alone',
    })
    .refine(isValidName, {
      message: 'Please enter a valid name (avoid random characters or numbers)',
    }),
  message: z
    .string()
    .trim()
    .min(1, 'Message is required')
    .max(8000)
    .refine(hasLetter, {
      message: 'Please describe what you would like to discuss in words',
    }),
})

export const submitChatbotEnquiryFn = createServerFn({ method: 'POST' })
  .validator(chatbotEnquiryInput)
  .handler(async ({ data }) => {
    // Google reCAPTCHA verification
    const isHuman = await verifyRecaptcha(data.recaptchaToken)
    if (!isHuman) {
      console.warn('[reCAPTCHA] Blocked suspected bot chatbot enquiry from:', data.email)
      return { ok: true as const, notificationSent: false }
    }

    const request = getRequest()
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      null
    const userAgent = request.headers.get('user-agent')?.slice(0, 512) ?? null

    await insertChatbotEnquiry({
      firstName: data.firstName,
      lastName: data.lastName || null,
      email: data.email.toLowerCase(),
      phoneOrCompany: data.phoneOrCompany || null,
      message: data.message,
      appointmentRequested: data.appointment,
      ipAddress,
      userAgent,
    })

    try {
      await sendEnquiryNotification(
        {
          firstName: data.firstName,
          lastName: data.lastName || '',
          email: data.email.toLowerCase(),
          phoneOrCompany: data.phoneOrCompany || '',
          // Prose only for the email; the column above keeps the raw answer.
          message: `${data.message}\n\n---\nAppointment requested: ${data.appointment ? 'Yes' : 'No'}`,
        },
        // Tags the subject and sender name so a chatbot lead is distinguishable
        // from a contact-form lead in the CEO's inbox.
        'chatbot',
      )
      return { ok: true as const, notificationSent: true }
    } catch (error) {
      console.error('[chatbot] notification email failed:', error)
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