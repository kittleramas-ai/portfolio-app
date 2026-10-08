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

export async function sendEnquiryNotification(
  enquiry: Pick<
    NewEnquiry,
    'firstName' | 'lastName' | 'email' | 'phoneOrCompany' | 'message'
  >,
): Promise<void> {
  const user = requiredEnv('SMTP_USER')
  const password = requiredEnv('SMTP_APP_PASSWORD').replace(/\s+/g, '')
  const recipient = requiredEnv('ENQUIRY_NOTIFICATION_EMAIL')
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
    from: { name: 'Portfolio website enquiry', address: user },
    to: recipient,
    replyTo: enquiry.email,
    subject: 'New advisory enquiry',
    text: [
      'A new enquiry was submitted through the portfolio contact form.',
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
