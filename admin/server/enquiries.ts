import { getDb } from '../../src/db/index.ts'
import { advisoryEnquiry } from '../../src/db/schema.ts'

/**
 * Writes for `advisory_enquiry`.
 *
 * Insert-only: the app never reads this table back to the public site, it only
 * records. Keeping the write in its own module (rather than in `public.ts`,
 * which is the read side) means the insert path and its fields are in one place.
 */

export type NewEnquiry = {
  firstName: string
  lastName: string | null
  email: string
  phoneOrCompany: string | null
  message: string
  ipAddress: string | null
  userAgent: string | null
}

/** Insert one enquiry. Throws on a DB failure — the caller surfaces it. */
export async function insertEnquiry(input: NewEnquiry): Promise<string> {
  const id = crypto.randomUUID()
  const db = getDb()
  await db.insert(advisoryEnquiry).values({ id, ...input })
  return id
}