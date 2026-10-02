/**
 * Password hashing on WebCrypto.
 *
 * PBKDF2-SHA256, 210k iterations. Chosen over bcrypt deliberately:
 *
 *   - no new dependency (bcryptjs is not installed, and the pure-JS build is
 *     slow on workerd)
 *   - PBKDF2 is built into WebCrypto, which is native in workerd — nothing to
 *     shim, no nodejs_compat requirement
 *   - 210k iterations matches the current OWASP guidance for PBKDF2-HMAC-SHA256
 *
 * Stored format: `pbkdf2-sha256$<iterations>$<saltB64>$<hashB64>`
 * Self-describing, so the iteration count can be raised later without
 * invalidating existing hashes.
 */

const ITERATIONS = 210_000
const KEY_BYTES = 32
const SALT_BYTES = 16

function getCrypto(): Crypto {
  if (typeof globalThis.crypto === 'undefined') {
    throw new Error('WebCrypto unavailable')
  }
  return globalThis.crypto
}

function toB64(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function pbkdf2(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const subtle = getCrypto().subtle
  const keyMaterial = await subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_BYTES * 8,
  )
  return new Uint8Array(bits)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = getCrypto().getRandomValues(new Uint8Array(SALT_BYTES))
  const hash = await pbkdf2(password, salt, ITERATIONS)
  return `pbkdf2-sha256$${ITERATIONS}$${toB64(salt)}$${toB64(hash)}`
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 4) return false
  const [scheme, iterStr, saltB64, hashB64] = parts
  if (scheme !== 'pbkdf2-sha256') return false

  const iterations = Number.parseInt(iterStr, 10)
  if (!Number.isFinite(iterations) || iterations < 1) return false

  let salt: Uint8Array
  let expected: Uint8Array
  try {
    salt = fromB64(saltB64)
    expected = fromB64(hashB64)
  } catch {
    return false
  }

  const actual = await pbkdf2(password, salt, iterations)

  // Constant-time compare.
  if (actual.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i]
  return diff === 0
}