import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { Readable } from 'node:stream'

import handler from './dist/server/server.js'

/**
 * Node server entry for production (the VPS target).
 *
 * `vite build` emits `dist/server/server.js`, which exports a standard
 * `{ fetch(request): Response }` handler — the same shape Cloudflare Workers
 * use. Node 20+ has a native fetch, so all that is needed is to adapt Node's
 * IncomingMessage/ServerResponse to Web Request/Response.
 *
 * This adapter exists because the installed TanStack Start has no built-in
 * node-server entrypoint: `@tanstack/react-start` ships `./server-entry`
 * (a Worker-style `fetch` export) but no `/node-server` subpath.
 *
 * Static assets from `dist/client` are served directly; everything else
 * (including /api/* server routes, /admin, and SSR) goes to the handler.
 *
 * Plain .mjs on purpose: no build step for the entrypoint itself, so a VPS
 * deploy is `npm run build && npm start` with nothing else to compile.
 */

const PORT = Number(process.env.PORT || 3000)
const HOST = process.env.HOST || '0.0.0.0'
const CLIENT_DIR = resolve(process.cwd(), 'dist', 'client')

/**
 * Uploaded images are served from the source directory, NOT from
 * `dist/client`.
 *
 * Vite copies `public/` into the build at BUILD time. An upload written after
 * the build (which is the whole point — the manager changes an image without a
 * redeploy) would never appear in `dist/client`, and the site would serve a
 * 404 for it. Reading from the source directory means an upload takes effect
 * immediately, with no rebuild.
 *
 * UPLOADS_DIR must therefore be readable by the server process in production.
 */
const UPLOADS_DIR = resolve(
  process.cwd(),
  process.env.UPLOADS_DIR || 'public/uploads',
)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
}

/**
 * Stream a file from a base directory if it exists at that path.
 * Returns true when it handled the response.
 *
 * The path-traversal guard is the `startsWith(base + sep)` check:
 * `normalize` alone would still let `/../secret` escape the directory.
 */
async function serveFileFrom(base, pathname, res) {
  let decoded
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    return false
  }

  const rel = normalize(decoded).replace(/^[/\\]+/, '')
  const full = join(base, rel)
  if (full !== base && !full.startsWith(base + sep)) return false

  try {
    const info = await stat(full)
    if (!info.isFile()) return false

    res.statusCode = 200
    res.setHeader(
      'Content-Type',
      MIME[extname(full).toLowerCase()] || 'application/octet-stream',
    )
    res.setHeader('Content-Length', String(info.size))
    res.setHeader('X-Content-Type-Options', 'nosniff')

    // Vite fingerprints /assets/* filenames, so those are safe to cache
    // forever. Everything else is not: the manager can replace an image under
    // the same name, and a long-lived cache would hide the change.
    if (rel.replace(/\\/g, '/').includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    }

    createReadStream(full).pipe(res)
    return true
  } catch {
    return false
  }
}

const serveStatic = (pathname, res) =>
  serveFileFrom(CLIENT_DIR, pathname, res)

const serveUpload = (pathname, res) => {
  const prefix = (process.env.UPLOADS_URL_PREFIX || '/uploads').replace(
    /\/$/,
    '',
  )
  if (pathname !== prefix && !pathname.startsWith(prefix + '/')) return false

  // Only the relative part is passed on, so the traversal guard applies
  // relative to UPLOADS_DIR rather than to the URL prefix.
  const rest = pathname.slice(prefix.length).replace(/^\/+/, '')
  // Short cache: the manager can replace a file under the same name, and a
  // long-lived cache would hide that change.
  res.setHeader('Cache-Control', 'public, max-age=3600')
  return serveFileFrom(UPLOADS_DIR, '/' + rest, res)
}

async function toWebRequest(req, origin) {
  const url = new URL(req.url || '/', origin)
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'

  const init = {
    method: req.method,
    headers: req.headers,
  }
  if (hasBody) {
    init.body = Readable.toWeb(req)
    // Node's fetch requires this when the body is a stream.
    init.duplex = 'half'
  }

  return new Request(url, init)
}

const server = createServer((req, res) => {
  void (async () => {
    try {
      const host = req.headers.host || 'localhost:' + PORT
      const origin = 'http://' + host
      const url = new URL(req.url || '/', origin)

      const isAppRoute =
        url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/_serverFn') ||
        url.pathname.startsWith('/admin')

      // Uploads first: they live in the source tree, not the build output.
      if (await serveUpload(url.pathname, res)) return
      if (!isAppRoute && (await serveStatic(url.pathname, res))) return

      const request = await toWebRequest(req, origin)
      const response = await handler.fetch(request)

      res.statusCode = response.status
      response.headers.forEach((value, key) => res.setHeader(key, value))

      if (response.body) {
        Readable.fromWeb(response.body).pipe(res)
      } else {
        res.end()
      }
    } catch (err) {
      console.error('[server] request failed:', err)
      if (!res.headersSent) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      }
      res.end('Internal Server Error')
    }
  })()
})

server.listen(PORT, HOST, () => {
  console.log('[server] listening on http://' + HOST + ':' + PORT)
})