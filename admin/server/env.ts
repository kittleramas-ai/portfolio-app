import { env } from 'cloudflare:workers'

/**
 * Runtime configuration, read from Worker bindings + secrets.
 *
 * `SESSION_TOKEN_PEPPER` is required in production and deliberately has no
 * default. A checked-in pepper would let anyone with a database dump compute
 * valid session hashes, which defeats the point of hashing them at all.
 *
 * `wrangler types` generates a precise `Env` interface for the bindings in
 * wrangler.jsonc, but secrets set via `wrangler secret put` are not in that
 * file — so secret reads go through a loosely-typed accessor by necessity.
 */

type EnvBag = Record<string, unknown>

function bag(): EnvBag {
  return env as unknown as EnvBag
}

const DEV_PEPPER = 'dev-only-pepper-not-for-production'

export function getSessionPepper(): string {
  const pepper = bag().SESSION_TOKEN_PEPPER
  if (typeof pepper === 'string' && pepper.length > 0) return pepper

  if (isProduction()) {
    throw new Error(
      'SESSION_TOKEN_PEPPER is not set. Add it with: wrangler secret put SESSION_TOKEN_PEPPER',
    )
  }
  return DEV_PEPPER
}

export function isProduction(): boolean {
  return bag().ENVIRONMENT === 'production'
}