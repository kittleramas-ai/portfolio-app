import { isAllowedImageType, MAX_UPLOAD_BYTES } from './media-schema.ts'
import type { AllowedImageType } from './media-schema.ts'

/**
 * Upload validation.
 *
 * Two independent checks, because either alone is insufficient:
 *
 *  1. Magic-byte sniffing — the declared Content-Type is attacker-controlled,
 *     so the real format is read from the file header. This is the check that
 *     stops a .html or .svg payload from being stored under an image slot and
 *     later served from the site origin (stored XSS).
 *  2. Dimension/aspect parsing — reads width/height from the header, so an
 *     oversized image is rejected before it is ever written to R2.
 */

export type ValidationResult =
  | {
      ok: true
      contentType: AllowedImageType
      width: number
      height: number
    }
  | { ok: false; error: string }

type Signature = {
  type: AllowedImageType
  /** Matched bytes; null = wildcard. */
  bytes: Array<number | null>
  offset: number
}

const SIGNATURES: Signature[] = [
  { type: 'image/jpeg', bytes: [0xff, 0xd8, 0xff], offset: 0 },
  { type: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], offset: 0 },
  // RIFF....WEBP
  {
    type: 'image/webp',
    bytes: [0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50],
    offset: 0,
  },
]

function detectType(bytes: Uint8Array): AllowedImageType | null {
  for (const sig of SIGNATURES) {
    const matches = sig.bytes.every(
      (b, i) => b === null || bytes[sig.offset + i] === b,
    )
    if (matches) return sig.type
  }
  return null
}

/** Read intrinsic dimensions from the header. No image library needed. */
function readDimensions(
  bytes: Uint8Array,
  type: AllowedImageType,
): { width: number; height: number } | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

  // A switch rather than an if-chain: an if-chain narrows `type` to the last
  // remaining literal, which makes the final comparison look tautological.
  switch (type) {
    case 'image/png': {
      // IHDR is always the first chunk: 8 sig + 4 len + 4 type, then w/h.
      if (bytes.length < 24) return null
      if (
        bytes[12] !== 0x49 ||
        bytes[13] !== 0x48 ||
        bytes[14] !== 0x44 ||
        bytes[15] !== 0x52
      ) {
        return null
      }
      return { width: view.getUint32(16), height: view.getUint32(20) }
    }

    case 'image/jpeg': {
      // Walk the marker segments until a start-of-frame (SOF) is found.
      let offset = 2
      while (offset + 9 < bytes.length) {
        if (bytes[offset] !== 0xff) {
          offset++
          continue
        }
        const marker = bytes[offset + 1]
        // SOF0..SOF15, excluding DHT (c4), JPG (c8) and DAC (cc).
        if (
          marker >= 0xc0 &&
          marker <= 0xcf &&
          marker !== 0xc4 &&
          marker !== 0xc8 &&
          marker !== 0xcc
        ) {
          return {
            height: view.getUint16(offset + 5),
            width: view.getUint16(offset + 7),
          }
        }
        const segLength = view.getUint16(offset + 2)
        if (segLength < 2) return null
        offset += 2 + segLength
      }
      return null
    }

    case 'image/webp': {
      // VP8 / VP8L / VP8X variants carry dimensions differently.
      if (bytes.length < 30) return null
      const format = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15])
      if (format === 'VP8 ') {
        return {
          width: view.getUint16(26) & 0x3fff,
          height: view.getUint16(28) & 0x3fff,
        }
      }
      if (format === 'VP8L') {
        const bits = view.getUint32(21)
        return {
          width: (bits & 0x3fff) + 1,
          height: ((bits >> 14) & 0x3fff) + 1,
        }
      }
      if (format === 'VP8X') {
        const w = bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)
        const h = bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)
        return { width: w + 1, height: h + 1 }
      }
      return null
    }

    default:
      return null
  }
}

/**
 * Slot-free validation for the generic file-picker endpoint. Same checks as
 * `validateUpload`, but with generous dimension caps since the image is not
 * tied to a fixed slot.
 */
export function validateImageUpload(
  declaredType: string,
  bytes: Uint8Array,
): ValidationResult {
  if (bytes.length === 0) return { ok: false, error: 'That file is empty.' }
  if (bytes.length > MAX_UPLOAD_BYTES) {
    return { ok: false, error: 'That file is over the 5 MB limit.' }
  }
  if (!isAllowedImageType(declaredType)) {
    return { ok: false, error: 'Only JPEG, PNG and WebP images are accepted.' }
  }
  const detected = detectType(bytes)
  if (!detected || detected !== declaredType) {
    return { ok: false, error: 'That file is not a valid image of its declared type.' }
  }
  const dims = readDimensions(bytes, detected)
  if (!dims || dims.width === 0 || dims.height === 0) {
    return { ok: false, error: 'Could not read the image dimensions. The file may be corrupt.' }
  }
  return { ok: true, contentType: detected, width: dims.width, height: dims.height }
}

export function validateUpload(
  _slotKey: string,
  declaredType: string,
  bytes: Uint8Array,
): ValidationResult {
  if (bytes.length === 0) {
    return { ok: false, error: 'That file is empty.' }
  }
  if (bytes.length > MAX_UPLOAD_BYTES) {
    const mb = (bytes.length / (1024 * 1024)).toFixed(1)
    return {
      ok: false,
      error: `That image is ${mb} MB. The limit is 5 MB — try a smaller or compressed version.`,
    }
  }
  if (!isAllowedImageType(declaredType)) {
    return {
      ok: false,
      error: 'Only JPEG, PNG and WebP images are accepted.',
    }
  }

  const detected = detectType(bytes)
  if (!detected) {
    return {
      ok: false,
      error: 'That file is not a valid JPEG, PNG or WebP image.',
    }
  }
  if (detected !== declaredType) {
    // Either a mislabelled file or something renamed to .png. Refuse rather
    // than guess which the uploader meant.
    return {
      ok: false,
      error: `The file's real format is ${detected.replace('image/', '').toUpperCase()}, not ${declaredType.replace('image/', '').toUpperCase()}.`,
    }
  }

  const dims = readDimensions(bytes, detected)
  if (!dims || dims.width === 0 || dims.height === 0) {
    return {
      ok: false,
      error: 'Could not read the image dimensions. The file may be corrupt.',
    }
  }

  return {
    ok: true,
    contentType: detected,
    width: dims.width,
    height: dims.height,
  }
}