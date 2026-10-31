/**
 * Where the database lives.
 *
 * Only `node:process` is touched indirectly — nothing here imports a driver, the
 * Drizzle schema, or a Zod-validated env module. That matters because
 * `drizzle.config.ts` runs inside drizzle-kit's own loader, so anything it
 * pulls in has to stay free of `mysql2` (a native-adjacent pool that would not
 * load under drizzle-kit's bundler) and free of the app's `@/` aliases.
 *
 * The environment is taken as an ARGUMENT rather than read from `process.env`.
 * That is bookade's pattern in `src/server/config/database.ts`, and it is what
 * lets drizzle-kit and the runtime provably resolve the SAME database instead of
 * drifting onto two different ones — which they did here before, because
 * `drizzle.config.ts` fell back to a SQLite file while the app read
 * `DATABASE_URL`.
 */
export function resolveDatabaseUrl(
  raw: Record<string, string | undefined> = {},
): string {
  const explicit = raw.DATABASE_URL?.trim()
  if (!explicit) {
    throw new Error(
      'DATABASE_URL is required. Set it in .env.local for local work, and in the ' +
        'environment for a deploy. Example: ' +
        'mysql://portfolio:password@127.0.0.1:3307/portfolio',
    )
  }
  return explicit
}