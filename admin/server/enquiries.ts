import { getDb } from '../../src/db/index.ts'
import { advisoryEnquiry, chatbotEnquiry } from '../../src/db/schema.ts'

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

/**
 * One chatbot conversation, as its own row in its own table.
 *
 * `NewChatbotEnquiry` is a separate type rather than `NewEnquiry & …` on
 * purpose: the appointment flag is REQUIRED here, whereas the contact form has
 * no such question. Spreading `NewEnquiry` in would let a caller omit it and
 * silently record `false` — the one field the office triages on.
 *
 * `message` holds only what the visitor typed. The appointment answer goes to
 * its own column, so a read never has to parse it back out of prose.
 */
export type NewChatbotEnquiry = {
  firstName: string
  lastName: string | null
  email: string
  phoneOrCompany: string | null
  message: string
  appointmentRequested: boolean
  ipAddress: string | null
  userAgent: string | null
}

/** Insert one chatbot enquiry. Throws on a DB failure — the caller surfaces it. */
export async function insertChatbotEnquiry(
  input: NewChatbotEnquiry,
): Promise<string> {
  const id = crypto.randomUUID()
  const db = getDb()
  await db.insert(chatbotEnquiry).values({ id, ...input })
  return id
}