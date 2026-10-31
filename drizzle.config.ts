import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

import { resolveDatabaseUrl } from './src/db/path.ts'

config({ path: ['.env.local', '.env'] })

/**
 * `schema` is a single barrel file and `dbCredentials.url` is fed by the same
 * `resolveDatabaseUrl(process.env)` the runtime calls, which is bookade's
 * arrangement: one resolver, two callers, no chance of them pointing at
 * different databases.
 *
 * `out` is committed, not gitignored. bookade gitignores its migrations folder
 * and its history shows them deleted and regenerated three times, which means no
 * deployed database can ever be replayed — worth not copying.
 */
export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'mysql',
  dbCredentials: {
    url: resolveDatabaseUrl(process.env),
  },
})