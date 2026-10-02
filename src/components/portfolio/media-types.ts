import type { PublicMedia } from '../../../admin/server/public.ts'

/**
 * The subset of an uploaded image a public component needs.
 *
 * Re-exported from the server module so components do not have to reach into
 * the admin folder for a type. This is a TYPE-only import, which is erased at
 * compile time — so unlike `admin/server/public.ts` itself (which reaches D1
 * and would fail the client bundle) it is safe to import from a component.
 */
export type SignatureMedia = Pick<
  PublicMedia,
  'url' | 'altText' | 'width' | 'height'
>