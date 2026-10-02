import { z } from 'zod'

/**
 * Single source of truth for editable settings.
 *
 * The TS types below are INFERRED from these schemas, never hand-written. That
 * is the whole point: bookade keeps a loose `interface` for defaults plus a
 * separate `.strict()` Zod for writes, and the two have drifted — its admin UI
 * posts `branding.siteName`, which the `.strict()` write schema rejects as an
 * unknown key, so that save silently fails. One schema, one type, no drift.
 */

/** wa.me needs country code + digits: no `+`, spaces or dashes. */
const whatsappNumberSchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d{6,14}$/, 'Use country code + digits only — no +, spaces or dashes')
  .describe('Country code and number only, e.g. 919876543210')

const emailSchema = z
  .string()
  .trim()
  .email('Enter a valid email address')
  .or(z.literal(''))

export const contactSettingsSchema = z.object({
  whatsappNumber: whatsappNumberSchema,
  whatsappMessage: z
    .string()
    .trim()
    .max(200, 'Keep the pre-filled message under 200 characters')
    .default(
      "Hello Dr. Surendiran, I'd like to discuss a collaboration.",
    ),
  contactEmail: emailSchema,
  contactPhoneDisplay: z.string().trim().max(40).default(''),
})

export const heroSettingsSchema = z.object({
  statementLine1: z.string().trim().max(80).default('Build the business'),
  statementLine2: z.string().trim().max(80).default("you've always"),
  statementLine3: z.string().trim().max(80).default('dreamed about...'),
  counterStatement: z
    .string()
    .trim()
    .max(160)
    .default('...without losing yourself in it along the way.'),
  ctaPrimaryLabel: z.string().trim().max(40).default('Explore Solutions'),
  ctaPrimaryHref: z.string().trim().max(200).default('#ventures'),
  ctaSecondaryLabel: z.string().trim().max(40).default('Founder Journey'),
  ctaSecondaryHref: z.string().trim().max(200).default('#about'),
})

export const siteSettingsSchema = z.object({
  contact: contactSettingsSchema,
  hero: heroSettingsSchema,
})

/** How each top-level group is presented in the admin UI. */
export const SETTINGS_GROUPS = [
  {
    key: 'contact',
    label: 'Contact & WhatsApp',
    description: 'Drives the floating WhatsApp button and the contact details.',
  },
  {
    key: 'hero',
    label: 'Hero Section',
    description: 'The statement, the closing line and the two buttons.',
  },
] as const satisfies ReadonlyArray<{
  key: keyof z.infer<typeof siteSettingsSchema>
  label: string
  description: string
}>

export type ContactSettings = z.infer<typeof contactSettingsSchema>
export type HeroSettings = z.infer<typeof heroSettingsSchema>
export type SiteSettings = z.infer<typeof siteSettingsSchema>
export type SettingsGroupKey = keyof SiteSettings

/** Defaults, derived from the schemas so a new field cannot be forgotten here. */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  contact: contactSettingsSchema.parse({
    whatsappNumber: '919000000000',
    contactEmail: '',
    contactPhoneDisplay: '',
  }),
  hero: heroSettingsSchema.parse({}),
}

/**
 * Shape stored per row in `site_setting`.
 * Each group is persisted as ONE json row keyed `contact` / `hero`, so a group
 * write is a single upsert and unrelated groups never clobber each other.
 */
export const settingsGroupSchema = z.discriminatedUnion('__group', [
  z.object({ __group: z.literal('contact'), value: contactSettingsSchema }),
  z.object({ __group: z.literal('hero'), value: heroSettingsSchema }),
])

export type StoredSettingsGroup = z.infer<typeof settingsGroupSchema>