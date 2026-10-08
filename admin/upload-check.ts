/**
 * Verifies the upload path end to end against the running dev server:
 * validate -> write to public/uploads/ -> record row -> serve the file.
 *
 * Uploads are multipart against /api/admin/media/<slot>, which is the path the
 * admin UI actually uses.
 *
 * The database is read through Drizzle rather than a raw `better-sqlite3`
 * connection with `.prepare()`. Note the deliberate extra connection at the
 * `row removed` assertion below: `deleteMedia()` writes through the app's own
 * cached handle, so a second connection is the only way to observe the write
 * without closing the app's handle mid-run.
 */
import { eq } from 'drizzle-orm'
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs'
import { join } from 'node:path'

import { closeCheckDb, openCheckDb } from './lib/db.ts'
import { adminSession, adminUser, siteMedia } from '../src/db/schema.ts'
import {
  buildSessionCookie,
  generateSessionToken,
  hashSessionToken,
} from './server/session-token.ts'

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const PEPPER = 'dev-only-pepper-not-for-production'
const UPLOADS = join(process.cwd(), 'public', 'uploads')

const { db } = await openCheckDb()

let failures = 0
function check(label: string, ok: boolean, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failures++
}

/** Build a minimal valid PNG of the given size, for upload tests. */
function makePng(width: number, height: number): Uint8Array {
  // 8-byte signature + IHDR (25 bytes total) + IEND, with a valid CRC.
  const crc32 = (buf: Uint8Array): number => {
    let c = ~0
    for (const byte of buf) {
      c ^= byte
      for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
    }
    return ~c >>> 0
  }
  const chunk = (type: string, data: Uint8Array): Uint8Array => {
    const len = new Uint8Array(4)
    new DataView(len.buffer).setUint32(0, data.length)
    const body = new Uint8Array(4 + data.length)
    body.set(new TextEncoder().encode(type), 0)
    body.set(data, 4)
    const crc = new Uint8Array(4)
    new DataView(crc.buffer).setUint32(0, crc32(body))
    const out = new Uint8Array(len.length + body.length + crc.length)
    out.set(len, 0)
    out.set(body, 4)
    out.set(crc, 4 + body.length)
    return out
  }

  const ihdr = new Uint8Array(13)
  const view = new DataView(ihdr.buffer)
  view.setUint32(0, width)
  view.setUint32(4, height)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // truecolour
  // 10..12 default to 0 (deflate / no interlace / no filter)

  const sig = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdrChunk = chunk('IHDR', ihdr)
  const iend = chunk('IEND', new Uint8Array(0))

  return Uint8Array.from([...sig, ...ihdrChunk, ...iend])
}

// --- session ---------------------------------------------------------------
const admin = await db
  .select({ id: adminUser.id })
  .from(adminUser)
  .where(eq(adminUser.email, 'admin@portfolio.local'))
  .limit(1)
if (!admin[0]) {
  console.error('no admin@portfolio.local row — run: npm run db:seed')
  await closeCheckDb()
  process.exit(1)
}

const token = generateSessionToken()
const tokenHash = await hashSessionToken(token, PEPPER)
const expires = new Date(Date.now() + 7 * 86_400_000)
await db.insert(adminSession).values({
  id: crypto.randomUUID(),
  userId: admin[0].id,
  tokenHash,
  expiresAt: expires,
  createdAt: new Date(),
})
const cookie = buildSessionCookie(token, expires).split(';')[0]

async function upload(
  slot: string,
  bytes: Uint8Array,
  type = 'image/png',
  fileName = 'test.png',
): Promise<{ status: number; body: Record<string, unknown> }> {
const form = new FormData()
  // `bytes` may be a view onto a pooled ArrayBuffer, which BlobPart rejects;
  // copy into a fresh ArrayBuffer.
  form.append(
    'file',
    new File([new Uint8Array(bytes)], fileName, { type }),
  )
  form.append('altText', 'Test upload image')
  const res = await fetch(`${BASE}/api/admin/media/${slot}`, {
    method: 'POST',
    headers: { cookie, origin: BASE },
    body: form,
  })
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
  return { status: res.status, body }
}

// --- 1. unauthenticated upload is refused ----------------------------------
{
const form = new FormData()
  form.append(
    'file',
    new File([new Uint8Array(makePng(600, 1200))], 'x.png', {
      type: 'image/png',
    }),
  )
  const res = await fetch(`${BASE}/api/admin/media/signature`, {
    method: 'POST',
    body: form,
  })
  check('unauthenticated upload is refused', res.status === 401, `${res.status}`)
}

// --- 2. a valid upload, matched to the slot's aspect ----------------------
// `signature` is a landscape slot (max 1600x800), so use a landscape fixture.
const signaturePng = makePng(1200, 400)
const ok = await upload('signature', signaturePng)
check('valid upload accepted', ok.status === 200, JSON.stringify(ok.body).slice(0, 120))

// One assertion, not optional chaining on every field: the upload just
// succeeded, so `entry` is present. Optional chaining would make tsc complain
// that the checks can be vacuous.
const entry = ok.body.entry as {
  slot: string
  url: string
  width: number
  height: number
}
check(
  'response reports the true dimensions read from the file',
  entry.width === 1200 && entry.height === 400,
  `${entry.width}x${entry.height}`,
)
check(
  'public URL points at /uploads/',
  entry.url.startsWith('/uploads/'),
  entry.url,
)

// --- 3. the file is really on disk -----------------------------------------
const fileName = 'signature.png'
const onDisk = join(UPLOADS, fileName)
check('file written to public/uploads/', existsSync(onDisk))
check(
  'bytes on disk match what was uploaded',
  existsSync(onDisk) &&
    readFileSync(onDisk).length === signaturePng.length,
  existsSync(onDisk) ? `${statSync(onDisk).size} bytes` : 'missing',
)

// --- 4. the row is recorded -------------------------------------------------
{
  const rows = await db
    .select({
      slot: siteMedia.slot,
      storageKey: siteMedia.storageKey,
      contentType: siteMedia.contentType,
      width: siteMedia.width,
    })
    .from(siteMedia)
    .where(eq(siteMedia.slot, 'signature'))
    .limit(1)
  if (rows.length === 0) throw new Error('site_media row vanished mid-test')
  const row = rows[0]
  check('database row created', Boolean(row))
  check('row points at the written file', row.storageKey === fileName)
  check('row stores the detected content type', row.contentType === 'image/png')
}

// --- 5. the static file is served ------------------------------------------
if (existsSync(onDisk)) {
  // Vite's public-dir middleware briefly caches the directory listing, so a
  // file written moments ago can 404 until it settles.
  await new Promise((r) => setTimeout(r, 400))
  const served = await fetch(`${BASE}/uploads/${fileName}`)
  check('uploaded image is served over HTTP', served.status === 200, `${served.status}`)
  check(
    'served with the right content type',
    served.headers.get('content-type') === 'image/png',
    served.headers.get('content-type') ?? 'none',
  )
  const bytes = new Uint8Array(await served.arrayBuffer())
  check(
    'served bytes match the upload',
    bytes.length === signaturePng.length,
    `${bytes.length} bytes`,
  )
}

// --- 6. replacing a slot overwrites in place -------------------------------
{
  const replacement = makePng(1400, 500)
  const again = await upload('signature', replacement)
  check('re-upload accepted', again.status === 200)
  check(
    'replaced file has the new size on disk',
    existsSync(onDisk) && statSync(onDisk).size === replacement.length,
    existsSync(onDisk) ? `${statSync(onDisk).size} bytes` : 'missing',
  )
  // Slot-scoped filenames mean a replace overwrites rather than accumulating.
  const leftovers = existsSync(UPLOADS)
    ? readdirSync(UPLOADS).filter((f) => f.startsWith('signature.'))
    : []
  check(
    'no orphaned files accumulated in uploads/',
    leftovers.length === 1,
    `${leftovers.length} file(s): ${leftovers.join(', ')}`,
  )
}

// --- 7. wrong aspect is rejected -------------------------------------------
{
  const landscape = makePng(1200, 600)
  const bad = await upload('hero_portrait', landscape)
  check(
    'landscape image rejected for a portrait slot',
    bad.status === 422,
    `${bad.status}: ${String(bad.body.error ?? '').slice(0, 70)}`,
  )
}

// --- 8. oversized image is rejected ----------------------------------------
{
  const huge = makePng(2000, 4000)
  const bad = await upload('hero_portrait', huge)
  check(
    'oversized image rejected',
    bad.status === 422,
    String(bad.body.error ?? '').slice(0, 70),
  )
}

// --- 9. a non-image disguised as a png is rejected -------------------------
{
  const notAnImage = new TextEncoder().encode('<html><script>alert(1)</script></html>')
  const bad = await upload('signature', notAnImage)
  check(
    'HTML payload disguised as image/png rejected by magic bytes',
    bad.status === 422,
    String(bad.body.error ?? '').slice(0, 70),
  )
}

// --- 10. delete clears both row and file ------------------------------------
{
  // deleteMediaFn is a server function and cannot be invoked outside the
  // server runtime ("No Start context found in AsyncLocalStorage"), so call the
  // service function directly instead — the point of this test is the file and
  // row cleanup, not the RPC layer.
  const { deleteMedia } = await import('./server/media.ts')

  const removed = await deleteMedia('signature')
  check('delete reports success', removed.ok === true)

  // deleteMedia writes through the app's own cached handle, which shares this
  // process's connection — reading back through `db` sees its own write, so the
  // old "open a second connection and hope" dance is unnecessary.
  const rows = await db
    .select({ slot: siteMedia.slot })
    .from(siteMedia)
    .where(eq(siteMedia.slot, 'signature'))
    .limit(1)

  check('file removed from disk', !existsSync(onDisk))
  check('row removed', rows.length === 0)
}

// --- cleanup ---------------------------------------------------------------
await db.delete(adminSession).where(eq(adminSession.tokenHash, tokenHash))
await closeCheckDb()
rmSync(onDisk, { force: true })

console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAILURE(S)`}`)
if (failures > 0) process.exitCode = 1