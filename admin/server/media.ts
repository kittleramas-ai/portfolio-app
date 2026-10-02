import { eq } from 'drizzle-orm'

import { getDb } from '../../src/db/index.ts'
import { siteMedia } from '../../src/db/schema.ts'
import { MEDIA_SLOTS, mediaEntrySchema } from './media-schema.ts'
import type { MediaEntry, MediaSlotKey } from './media-schema.ts'
import {
  buildFileName,
  deleteUpload,
  publicUrlFor,
  readUpload,
  uploadExists,
  writeUpload,
} from './media-storage.ts'
import { validateUpload } from './media-validate.ts'

export type SaveMediaResult =
  | { ok: true; entry: MediaEntry }
  | { ok: false; error: string }

/**
 * Current state of every slot.
 *
 * Always returns one entry per slot, with `url: null` when the file is missing
 * on disk — so a row pointing at a manually-deleted file degrades to the
 * bundled fallback instead of a broken image.
 */
export async function listMedia(): Promise<MediaEntry[]> {
  const db = getDb()
  const rows = await db.select().from(siteMedia).catch(() => [])

  const entries = await Promise.all(
    (Object.keys(MEDIA_SLOTS) as MediaSlotKey[]).map(async (slot) => {
      const row = rows.find((r) => r.slot === slot)
      const empty = mediaEntrySchema.parse({
        slot,
        url: null,
        contentType: null,
        sizeBytes: null,
        width: null,
        height: null,
        altText: '',
        updatedAt: null,
      })

      if (!row) return empty
      // The row is only half the truth: the bytes have to be there too.
      if (!(await uploadExists(row.storageKey))) return empty

      return mediaEntrySchema.parse({
        slot,
        url: publicUrlFor(row.storageKey),
        contentType: row.contentType,
        sizeBytes: row.sizeBytes,
        width: row.width,
        height: row.height,
        altText: row.altText,
        updatedAt: new Date(row.updatedAt).toISOString(),
      })
    }),
  )

  return entries
}

export async function getMediaSlot(
  slot: MediaSlotKey,
): Promise<MediaEntry | null> {
  const all = await listMedia()
  return all.find((e) => e.slot === slot) ?? null
}

/**
 * Validate an image, write it to disk, then point the slot at it.
 *
 * Order matters: the file is written BEFORE the row is updated. If the write
 * fails, the slot keeps its previous working image instead of pointing at a
 * file that was never created.
 *
 * Slot-scoped filenames mean a replace overwrites in place rather than
 * accumulating orphans. The previous file is removed afterwards only if its
 * extension differed (png -> jpg), and best-effort: the row is already correct
 * at that point, so a failure only leaves a stray file behind.
 */
export async function saveMedia(input: {
  slot: MediaSlotKey
  declaredType: string
  bytes: Uint8Array
  altText: string
  updatedBy: string | null
}): Promise<SaveMediaResult> {
  const validated = validateUpload(input.slot, input.declaredType, input.bytes)
  if (!validated.ok) return { ok: false, error: validated.error }

  const db = getDb()
  const storageKey = buildFileName(input.slot, validated.contentType)

  const previous = await db
    .select()
    .from(siteMedia)
    .where(eq(siteMedia.slot, input.slot))
    .limit(1)

  try {
    await writeUpload(storageKey, input.bytes)
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? `Could not save the file: ${err.message}`
          : 'Could not save the file.',
    }
  }

  const now = new Date()
  await db
    .insert(siteMedia)
    .values({
      slot: input.slot,
      storageKey,
      contentType: validated.contentType,
      sizeBytes: input.bytes.length,
      width: validated.width,
      height: validated.height,
      altText: input.altText.slice(0, 160),
      updatedAt: now,
      updatedBy: input.updatedBy,
    })
    .onConflictDoUpdate({
      target: siteMedia.slot,
      set: {
        storageKey,
        contentType: validated.contentType,
        sizeBytes: input.bytes.length,
        width: validated.width,
        height: validated.height,
        altText: input.altText.slice(0, 160),
        updatedAt: now,
        updatedBy: input.updatedBy,
      },
    })

  // Drop the superseded file if the extension changed (png -> jpg).
  // Best-effort: the row is already correct, so a failure only leaves a stray
  // file behind.
  if (previous.length > 0 && previous[0].storageKey !== storageKey) {
    const stale = previous[0]
    await deleteUpload(stale.storageKey).catch(() => undefined)
  }

  const entry: MediaEntry = {
    slot: input.slot,
    url: publicUrlFor(storageKey),
    contentType: validated.contentType,
    sizeBytes: input.bytes.length,
    width: validated.width,
    height: validated.height,
    altText: input.altText.slice(0, 160),
    updatedAt: now.toISOString(),
  }
  return { ok: true, entry: mediaEntrySchema.parse(entry) }
}

/**
 * Edit alt text without re-uploading the file.
 *
 * Existence is verified first: updating alt text for a slot whose file has been
 * deleted would resurrect a row pointing at nothing.
 */
export async function updateAltText(
  slot: MediaSlotKey,
  altText: string,
): Promise<{ ok: boolean; error?: string }> {
  const db = getDb()

  const rows = await db
    .select()
    .from(siteMedia)
    .where(eq(siteMedia.slot, slot))
.limit(1)

  // `rows[0]` is typed non-nullable because `noUncheckedIndexedAccess` is off,
  // so the empty check has to be on the array length.
  if (rows.length === 0) {
    return {
      ok: false,
      error: 'There is no image in that slot yet — upload one first.',
    }
  }
  const row = rows[0]

  if (!(await uploadExists(row.storageKey))) {
    return {
      ok: false,
      error: 'The file for that slot is missing. Please upload it again.',
    }
  }

  await db
    .update(siteMedia)
    .set({ altText: altText.slice(0, 160), updatedAt: new Date() })
    .where(eq(siteMedia.slot, slot))

  return { ok: true }
}

/**
 * Remove an upload and clear the slot.
 *
 * The row is deleted BEFORE the file, so a failure part-way leaves a stray file
 * on disk rather than a row pointing at a missing file (which would show a
 * broken image on the live site).
 */
export async function deleteMedia(slot: MediaSlotKey): Promise<SaveMediaResult> {
  const db = getDb()

  const rows = await db
    .select()
    .from(siteMedia)
    .where(eq(siteMedia.slot, slot))
    .limit(1)
  const row = rows[0]

  if (rows.length === 0) {
    return {
      ok: false,
      error: 'That slot has no upload to remove.',
    }
  }

  await db.delete(siteMedia).where(eq(siteMedia.slot, slot))
  await deleteUpload(row.storageKey).catch(() => undefined)

  return {
    ok: true,
    entry: mediaEntrySchema.parse({
      slot,
      url: null,
      contentType: null,
      sizeBytes: null,
      width: null,
      height: null,
      altText: '',
      updatedAt: null,
    }),
  }
}

/**
 * Read a stored file.
 *
 * Not used by the public site — files in `public/uploads/` are served as static
 * assets by the web server. This exists for verification tooling and for the
 * case where UPLOADS_DIR points outside the served directory.
 */
export async function readMediaFile(fileName: string): Promise<Uint8Array | null> {
  return readUpload(fileName)
}