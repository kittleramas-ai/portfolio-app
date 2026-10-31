import { config } from 'dotenv'
import nodemailer from 'nodemailer'

import type { NewEnquiry } from './enquiries.ts'

config({ path: '.env.local' })

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(
      `${name} is not set; enquiry notification email cannot be sent.`,
    )
  }
  return value
}

/**
 * Which surface an enquiry arrived through.
 *
 * The CEO's inbox is the single place both land, so the subject line and the
 * opening line are what distinguish a chatbot lead from a contact-form lead at a
 * glance. Keyed here rather than passed as loose strings so the two cannot drift
 * and so a new surface has to declare all three fields at once.
 */
export type EnquirySource = 'contact-form' | 'chatbot'

const SOURCE_META: Record<
  EnquirySource,
  { subject: string; intro: string; fromName: string }
> = {
  'contact-form': {
    subject: 'New advisory enquiry (contact form)',
    intro: 'A new enquiry was submitted through the portfolio contact form.',
    fromName: 'Portfolio website enquiry',
  },
  chatbot: {
    subject: 'New chatbot enquiry (Nexa)',
    intro:
      'A new enquiry was submitted through the Nexa chatbot on the portfolio website.',
    fromName: 'Nexa chatbot',
  },
}

export async function sendEnquiryNotification(
  enquiry: Pick<
    NewEnquiry,
    'firstName' | 'lastName' | 'email' | 'phoneOrCompany' | 'message'
  >,
  /** Defaults to the contact form so existing callers keep their subject. */
  source: EnquirySource = 'contact-form',
): Promise<void> {
  const user = requiredEnv('SMTP_USER')
  const password = requiredEnv('SMTP_APP_PASSWORD').replace(/\s+/g, '')
  const recipient = requiredEnv('ENQUIRY_NOTIFICATION_EMAIL')
  const meta = SOURCE_META[source]
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    auth: { user, pass: password },
  })
  const name = [enquiry.firstName, enquiry.lastName].filter(Boolean).join(' ')
  // console.log(`[enquiry] sending notification email to ${recipient} for enquiry from ${name} <${enquiry.email}>`,
  // )

  await transporter.sendMail({
    from: { name: meta.fromName, address: user },
    to: recipient,
    replyTo: enquiry.email,
    subject: meta.subject,
    text: [
      meta.intro,
      '',
      `Name: ${name}`,
      `Email: ${enquiry.email}`,
      `Phone / company: ${enquiry.phoneOrCompany || 'Not provided'}`,
      '',
      'Message:',
      enquiry.message,
    ].join('\n'),
  })
}
