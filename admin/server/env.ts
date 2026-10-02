/**
 * Runtime configuration, read from environment variables.
 *
 * `SESSION_TOKEN_PEPPER` is required in production and deliberately has no
 * default: a checked-in pepper would let anyone with a database dump compute
 * valid session hashes, which defeats the point of hashing them at all.
 *
 * Set with: `wrangler secret put` previously, now a plain env var —
 * see docs/VPS-DEPLOY.md for the systemd/pm2 setup.
 */

function read(name: string): string | undefined {
  const value = process.env[name]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

const DEV_PEPPER = 'dev-only-pepper-not-for-production'

export function getSessionPepper(): string {
  const pepper = read('SESSION_TOKEN_PEPPER')
  if (pepper) return pepper

  if (isProduction()) {
    throw new Error(
      'SESSION_TOKEN_PEPPER is not set. Add it as an environment variable before starting the server in production.',
    )
  }
  return DEV_PEPPER
}

export function isProduction(): boolean {
  return (
    read('NODE_ENV') === 'production' || read('ENVIRONMENT') === 'production'
  )
}