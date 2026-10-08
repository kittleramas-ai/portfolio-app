process.env.TZ = 'Asia/Calcutta'
import { config } from 'dotenv'
config({ path: ['.env.local', '.env'], quiet: true })
const { getDb, closeDb } = await import('./src/db/index.ts')
const { siteMedia } = await import('./src/db/schema.ts')
const db = getDb()
// 1) write a JS Date the way loginFn/createdAt does
await db.insert(siteMedia).values({
  slot: 'tz-probe1',
  storageKey: 'tz_probe1.png',
  contentType: 'image/png',
  sizeBytes: 1,
  width: 1,
  height: 1,
  updatedBy: null,
  updatedAt: new Date(),
})
// 2) no updatedAt -> default CURRENT_TIMESTAMP
await db.insert(siteMedia).values({
  slot: 'tz-probe2',
  storageKey: 'tz_probe2.png',
  contentType: 'image/png',
  sizeBytes: 1,
  width: 1,
  height: 1,
  updatedBy: null,
})
await closeDb()
console.log('written')
