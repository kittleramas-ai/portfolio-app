import { z } from 'zod'

import {
  aboutSettingsSchema,
  achievementsSettingsSchema,
  advisorySettingsSchema,
  booksSettingsSchema,
  footerSettingsSchema,
  governanceSettingsSchema,
  keynotesSettingsSchema,
  milestonesSettingsSchema,
  navbarSettingsSchema,
  perspectivesSettingsSchema,
  quoteSettingsSchema,
  venturesSettingsSchema,
} from './settings-sections.ts'

/**
 * Single source of truth for editable settings.
 *
 * The TS types below are INFERRED from these schemas, never hand-written. That
 * is the whole point: bookade keeps a loose `interface` for defaults plus a
 * separate `.strict()` Zod for writes, and the two have drifted — its admin UI
 * posts `branding.siteName`, which the `.strict()` write schema rejects as an
 * unknown key, so that save silently fails. One schema, one type, no drift.
 *
 * Every group is registered in ONE object, `SITE_SETTINGS_SHAPE`. Adding a
 * section means adding one entry there and one row to SETTINGS_GROUPS — the read
 * loop, the save dispatcher, the defaults and the admin tab list all derive from
 * those two, so nothing else needs editing and nothing can be forgotten.
 */

/** wa.me needs country code + digits: no `+`, spaces or dashes. */
const whatsappNumberSchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d{6,14}$/, 'Use country code + digits only — no +, spaces or dashes')
  .describe('Country code and number only, e.g. 919876543210')
  // Defaults to a placeholder rather than being left required, so that every
  // group can be defaulted with a bare `parse({})` below. The Overview tab
  // flags the number as unconfigured until it is replaced.
  .default('919000000000')

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
  contactEmail: emailSchema.default(''),
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

/**
 * Group key -> schema. The shape is written out rather than built from
 * `SETTINGS_GROUPS` so `z.infer` still produces literal keys and
 * `settings.hero` keeps its exact type instead of widening to a union.
 */
export const SITE_SETTINGS_SHAPE = {
  contact: contactSettingsSchema,
  hero: heroSettingsSchema,
  milestones: milestonesSettingsSchema,
  about: aboutSettingsSchema,
  ventures: venturesSettingsSchema,
  achievements: achievementsSettingsSchema,
  keynotes: keynotesSettingsSchema,
  governance: governanceSettingsSchema,
  perspectives: perspectivesSettingsSchema,
  books: booksSettingsSchema,
  quote: quoteSettingsSchema,
  advisory: advisorySettingsSchema,
  navbar: navbarSettingsSchema,
  footer: footerSettingsSchema,
} as const

export const siteSettingsSchema = z.object(SITE_SETTINGS_SHAPE)

/**
 * How each group is presented in the admin UI, in sidebar order. This doubles
 * as the order sections appear on the site, which is why it is a plain list
 * rather than a set.
 */
export const SETTINGS_GROUPS = [
  {
    key: 'navbar',
    label: 'Menu',
    description: 'The full-screen navigation overlay — add, reorder or remove links.',
  },
  {
    key: 'footer',
    label: 'Footer',
    description: 'The footer columns and links, the biography and the copyright bar.',
  },
  {
    key: 'hero',
    label: 'Hero Section',
    description: 'The statement, the closing line and the two buttons.',
  },
  {
    key: 'milestones',
    label: 'Milestones',
    description: 'The four animated counters under the hero.',
  },
  {
    key: 'about',
    label: 'About',
    description: 'The thesis statement, the floating pills and the three pillars.',
  },
  {
    key: 'ventures',
    label: 'Ventures',
    description: 'The four business cards, their services, stats and links.',
  },
  {
    key: 'achievements',
    label: 'Honors Deck',
    description: 'The interactive deck of institutional accolades.',
  },
  {
    key: 'keynotes',
    label: 'Keynotes',
    description: 'Speaking engagements and the invitation button.',
  },
  {
    key: 'governance',
    label: 'Governance',
    description: 'Founder roles, advisory boards and community leadership.',
  },
  {
    key: 'perspectives',
    label: 'Perspectives',
    description: 'The three thought-leadership articles.',
  },
  {
    key: 'books',
    label: 'Books',
    description: 'The reading shelf, the featured quote and the featured titles.',
  },
  {
    key: 'quote',
    label: 'Quote',
    description: 'The pull-quote, its attribution and the portrait beside it.',
  },
  {
    key: 'advisory',
    label: 'Advisory Form',
    description: 'The contact section copy around the enquiry form.',
  },
  {
    key: 'contact',
    label: 'Contact',
    description: 'Drives the floating WhatsApp button and the contact details.',
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

export const SETTINGS_GROUP_KEYS = Object.keys(
  SITE_SETTINGS_SHAPE,
) as SettingsGroupKey[]

/**
 * Defaults, derived from the schemas so a new field cannot be forgotten here.
 * Every group in the shape is defaulted from `{}`; that only works because no
 * field is left required without a default.
 */
export const DEFAULT_SITE_SETTINGS = Object.fromEntries(
  SETTINGS_GROUP_KEYS.map((key) => [key, SITE_SETTINGS_SHAPE[key].parse({})]),
) as SiteSettings

/**
 * Envelope for the single generic save endpoint.
 *
 * This replaced a `z.discriminatedUnion('__group', …)` over every group, which
 * had to be extended by hand for each new section and was, as it turned out,
 * dead code — nothing consumed it. The group name plus an opaque value is enough:
 * `saveSettingsGroup` looks the group's own schema up and parses with it, so the
 * value is still validated by exactly the schema that defines it. Keeping the
 * discriminated union would mean restating all fourteen schemas a second time.
 */
export const settingsGroupEnvelopeSchema = z.object({
  group: z.enum(SETTINGS_GROUP_KEYS as [SettingsGroupKey, ...SettingsGroupKey[]]),
  value: z.unknown(),
})

export type SettingsGroupEnvelope = z.infer<typeof settingsGroupEnvelopeSchema>

export {
  aboutSettingsSchema,
  achievementsSettingsSchema,
  advisorySettingsSchema,
  booksSettingsSchema,
  footerSettingsSchema,
  governanceSettingsSchema,
  keynotesSettingsSchema,
  milestonesSettingsSchema,
  navbarSettingsSchema,
  perspectivesSettingsSchema,
  quoteSettingsSchema,
  venturesSettingsSchema,
  ACCENT_KEYS,
} from './settings-sections.ts'

export type {
  AboutSettings,
  AchievementsSettings,
  AdvisorySettings,
  BooksSettings,
  FooterSettings,
  GovernanceSettings,
  KeynotesSettings,
  MilestonesSettings,
  NavbarSettings,
  PerspectivesSettings,
  QuoteSettings,
  VenturesSettings,
} from './settings-sections.ts'