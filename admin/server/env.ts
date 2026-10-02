import { env } from 'cloudflare:workers'

/**
 * Runtime configuration, read from Worker bindings + secrets.
 *
 * `SESSION_TOKEN_PEPPER` is required in production and deliberately has no
 * default. A checked-in pepper would let anyone with a database dump compute
 * valid session hashes, which defeats the point of hashing them at all.
 */

const DEV_PEPPER = 'dev-only-pepper-not-for-production'

export function getSessionPepper(): string {
  const pepper = (env as Record<string, unknown>).SESSION_TOKEN_PEPPER
  if (typeof pepper === 'string' && pepper.length > 0) return pepper

  const isProd =
    typeof env === 'object' &&
    env !== null &&
    (env as Record<string, unknown>).ENVIRONMENT === 'production'

  if (isProd) {
    throw new Error(
      'SESSION_TOKEN_PEPPER is not set. Add it with: wrangler secret put SESSION_TOKEN_PEPPER',
    )
  }
  return DEV_PEPPER
}

export function isProduction(): boolean {
  return (
    (env as Record<string, unknown>).ENVIRONMENT === 'production'
  )
}