import { z } from 'zod'

/**
 * Image slots — the fixed set of named positions the manager can fill.
 *
 * A closed enum, not a gallery. Two reasons:
 *  - the admin UI stays finite (no "add image" that nobody will ever use)
 *  - a slot carries an expected max dimension, so a 6MB phone photo gets
 *    rejected with a useful message instead of silently costing money
 *
 * Dimensions come from what each slot actually renders at on the site, so the
 * stored file is never wildly larger than it needs to be.
 */
export const MEDIA_SLOTS = {
  hero_portrait: {
    label: 'Hero Portrait',
    description: 'The full-length standing photo on the home page.',
    maxWidth: 1400,
    maxHeight: 2800,
    /** Portrait aspect; anything else is rejected so the hero lockup holds. */
    aspect: 'portrait' as const,
    required: true,
  },
  signature: {
    label: 'Signature',
    description: 'Your handwritten signature. Shown in the header and footer.',
    maxWidth: 1600,
    maxHeight: 800,
    aspect: 'landscape' as const,
    required: false,
  },
  og_image: {
    label: 'Social Share Image',
    description: 'Shown when the site link is shared on WhatsApp or LinkedIn.',
    maxWidth: 1200,
    maxHeight: 630,
    aspect: 'landscape' as const,
    required: false,
  },
  favicon: {
    label: 'Favicon',
    description: 'The small icon in the browser tab.',
    maxWidth: 512,
    maxHeight: 512,
    aspect: 'square' as const,
    required: false,
  },
} as const satisfies Record<string, MediaSlot>

export type MediaSlot = {
  label: string
  description: string
  maxWidth: number
  maxHeight: number
  aspect: 'portrait' | 'landscape' | 'square' | 'any'
  required: boolean
}

export type MediaSlotKey = keyof typeof MEDIA_SLOTS

export const MEDIA_SLOT_KEYS = Object.keys(MEDIA_SLOTS) as MediaSlotKey[]

export const mediaSlotKeySchema = z.enum(
  MEDIA_SLOT_KEYS as [MediaSlotKey, ...MediaSlotKey[]],
)

/**
 * Only raster types we can decode dimensions for and that every browser
 * renders. SVG is deliberately excluded: it is a script-capable format, and
 * serving user-uploaded SVG from the site origin is a stored-XSS vector.
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number]

/** 5 MB. Well inside R2's free tier and small enough to fail fast. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export const EXTENSION_FOR_TYPE: Record<AllowedImageType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export function isAllowedImageType(
  type: string,
): type is AllowedImageType {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type)
}

/** Metadata for one slot, as returned to the admin UI and the public site. */
export const mediaEntrySchema = z.object({
  slot: mediaSlotKeySchema,
  url: z.string().nullable(),
  contentType: z.string().nullable(),
  sizeBytes: z.number().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  altText: z.string(),
  updatedAt: z.string().nullable(),
})
export type MediaEntry = z.infer<typeof mediaEntrySchema>

export const altTextSchema = z
  .string()
  .trim()
  .max(160, 'Keep alt text under 160 characters')