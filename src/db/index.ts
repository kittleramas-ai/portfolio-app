import { drizzle } from 'drizzle-orm/d1'
import { env } from 'cloudflare:workers'

import * as schema from './schema.ts'

export type Db = ReturnType<typeof drizzle<typeof schema>>

/**
 * Request-scoped D1 handle.
 *
 * NOT a module-level singleton: on workerd the `env` object only exists for the
 * lifetime of a request, and the previous `better-sqlite3` +
 * `process.env.DATABASE_URL` client could never have run here at all.
 *
 * `cloudflare:workers` is resolved by @cloudflare/vite-plugin from the bindings
 * declared in wrangler.jsonc, so this needs no plumbed-through context and no
 * changes to `getContext()` in the router integration.
 */
export function getDb(): Db {
  const d1 = env.portfolio
  return drizzle(d1, { schema })
}