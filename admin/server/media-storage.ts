import { mkdirSync } from 'node:fs'
import { readFile, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join, resolve, sep } from 'node:path'

import { EXTENSION_FOR_TYPE } from './media-schema.ts'
import type { AllowedImageType } from './media-schema.ts'

/**
 * On-disk image storage.
 *
 * Uploads are written under `public/uploads/` so the web server (or Vite in
 * dev) serves them as ordinary static files — no route handler in the hot path.
 *
 * This only works because the app now runs on a real Node server. On Cloudflare
 * Workers the same code fails with "[unenv] fs.writeFile is not implemented
 * yet!", because workerd has no writable filesystem. That was verified directly,
 * not assumed.
 *
 * `UPLOADS_DIR` overrides the location in production (e.g. a path outside the
 * deploy directory, or a mounted volume).
 */

const DEFAULT_UPLOADS_DIR = 'public/uploads'

export function uploadsDir(): string {
  const configured = process.env.UPLOADS_DIR ?? ''
  if (configured) return resolve(process.cwd(), configured)
  return resolve(process.cwd(), DEFAULT_UPLOADS_DIR)
}

/** Public URL prefix. Must match where the directory is served from. */
export function uploadsUrlPrefix(): string {
  const configured = process.env.UPLOADS_URL_PREFIX ?? ''
  return configured.startsWith('/')
    ? configured.replace(/\/$/, '')
    : '/uploads'
}

/**
 * Filename for a slot.
 *
 * Slot-scoped rather than timestamped, so replacing a slot overwrites the same
 * file instead of accumulating orphans. The extension is part of the name so a
 * png -> jpg swap does not leave a stale object behind.
 */
export function buildFileName(
  slot: string,
  contentType: AllowedImageType,
): string {
  return `${slot}.${EXTENSION_FOR_TYPE[contentType]}`
}

/** Resolve a stored filename to an absolute path, refusing traversal. */
function absolutePathFor(fileName: string): string | null {
  if (
    !fileName ||
    fileName.includes('..') ||
    fileName.includes('/') ||
    fileName.includes('\\') ||
    fileName.includes('\0')
  ) {
    return null
  }
  const base = uploadsDir()
  const full = resolve(base, fileName)
  // Defence in depth: confirm the resolved path is still inside the base.
  if (full !== base && !full.startsWith(base + sep)) return null
  return full
}

export function publicUrlFor(fileName: string): string {
  return `${uploadsUrlPrefix()}/${fileName}`
}

export async function writeUpload(
  fileName: string,
  bytes: Uint8Array,
): Promise<{ sizeBytes: number }> {
  const full = absolutePathFor(fileName)
  if (!full) throw new Error('Invalid upload filename')

  mkdirSync(dirname(full), { recursive: true })
  await writeFile(full, bytes)
  const info = await stat(full)
  return { sizeBytes: info.size }
}

export async function readUpload(
  fileName: string,
): Promise<Uint8Array | null> {
  const full = absolutePathFor(fileName)
  if (!full) return null
  try {
    const buf = await readFile(full)
    return new Uint8Array(buf)
  } catch {
    return null
  }
}

export async function deleteUpload(fileName: string): Promise<void> {
  const full = absolutePathFor(fileName)
  if (!full) return
  await rm(full, { force: true })
}

export async function uploadExists(fileName: string): Promise<boolean> {
  const full = absolutePathFor(fileName)
  if (!full) return false
  try {
    await stat(full)
    return true
  } catch {
    return false
  }
}

/** Where a stored file physically lives, for diagnostics. */
export function describeStorage(): string {
  return join(uploadsDir(), '<slot>.<ext>')
}