import * as React from 'react'
import { Mail, Phone, CheckCircle2 } from 'lucide-react'
import { Reveal } from './Reveal'
import { AppIcon } from './AppIcon'
import { DEFAULT_SITE_SETTINGS } from '../../../admin/server/settings-schema'
import type {
  AdvisorySettings,
  ContactSettings,
} from '../../../admin/server/settings-schema'
import { submitEnquiryFn } from '../../../admin/server/public.ts'

import { preloadRecaptcha, getRecaptchaToken } from '../../lib/recaptcha'

const DEFAULT_ADVISORY = DEFAULT_SITE_SETTINGS.advisory
const DEFAULT_CONTACT = DEFAULT_SITE_SETTINGS.contact

/**
 * Digs the server's own validation text out of a rejected server-function call.
 *
 * `submitEnquiryFn` throws a ZodError, which arrives here as a serialised
 * ServerFnError. The messages are written by the schema and are safe to show a
 * visitor — they say what is wrong with THEIR input, and revealing them exposes
 * nothing about the server. Returns null for anything that is not a validation
 * problem, so the caller can fall back to its own copy.
 */
function firstValidationMessage(err: unknown): string | null {
  const text =
    err instanceof Error ? err.message : typeof err === 'string' ? err : ''
  if (!text) return null
  if (!/"message"\s*:/.test(text) && !text.includes('ZodError')) return null
  try {
    // The payload is a JSON string inside the message; pull the first issue out
    // rather than showing the visitor a raw schema dump.
    const start = text.indexOf('{')
    if (start === -1) return null
    const parsed: unknown = JSON.parse(text.slice(start))
    const issues = (parsed as { issues?: unknown }).issues
    if (!Array.isArray(issues)) return null
    const first = issues[0] as { message?: unknown } | undefined
    return typeof first?.message === 'string' ? first.message : null
  } catch {
    return null
  }
}

export function ContactSection({
  settings = DEFAULT_ADVISORY,
  contact = DEFAULT_CONTACT,
}: {
  /** The copy around the enquiry form, including the success panel. Managed in the admin panel. */
  settings?: AdvisorySettings
  /** Direct contact details shown under the copy. Managed in the admin panel. */
  contact?: ContactSettings
}) {
  const [submitted, setSubmitted] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [notificationFailed, setNotificationFailed] = React.useState(false)
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneOrCompany: '',
    message: '',
  })

  // Preload reCAPTCHA script only when user hovers or interacts with the form
  const handleInteraction = React.useCallback(() => {
    void preloadRecaptcha()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    try {
      const recaptchaToken = await getRecaptchaToken('contact_form')
      const result = await submitEnquiryFn({
        data: {
          ...formData,
          recaptchaToken,
        },
      })
      setNotificationFailed(!result.notificationSent)
      setSubmitted(true)
    } catch (err) {
      // A rejected phone number is a validation result, not a failure, and
      // "please email us directly" is a baffling reply to someone who simply
      // mistyped a digit. Surface the server's own message when there is one,
      // and keep the generic copy only for genuine transport/server errors.
      const detail = firstValidationMessage(err)
      setError(
        detail ??
          'Sorry, that did not go through. Please email us directly instead.',
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <section
      className="py-24 w-full border-b border-slate-border relative section-hairline"
      id="advisory"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
      <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-10 lg:sticky lg:top-28">
            <div className="space-y-6">
              <div className="text-mono-metric font-mono-metric text-text-tertiary uppercase tracking-widest text-[12px]">
                {settings.eyebrow}
              </div>
              <h2
                className="text-headline-lg font-headline-lg text-text-primary tracking-tight"
                style={{
                  fontFamily:
                    'Anton, "Bebas Neue", "Space Grotesk", sans-serif',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  lineHeight: 1.1,
                  fontSize: 'clamp(36px, 4vw, 52px)',
                }}
              >
                {settings.heading}
              </h2>
              <p className="text-body-md font-body-md text-text-secondary leading-relaxed max-w-lg">
                {settings.bio}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-border/80 space-y-4">
              <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {settings.officeLabel}
                </span>
              </div>

              {/* Direct contact details. Both are optional in the admin panel,
                  so each row disappears entirely when blank rather than
                  rendering an empty link. */}
              {contact.contactEmail || contact.contactPhoneDisplay ? (
                <div className="space-y-3">
                  {contact.contactEmail ? (
                    <a
                      href={`mailto:${contact.contactEmail}`}
                      className="group flex items-center gap-3 w-fit"
                    >
                      <Mail className="size-[18px] text-text-tertiary transition-colors group-hover:text-accent-gold" />
                      <span className="text-body-sm font-body-sm text-text-secondary transition-colors group-hover:text-accent-gold break-all">
                        {contact.contactEmail}
                      </span>
                    </a>
                  ) : null}
                  {contact.contactPhoneDisplay ? (
                    <a
                      href={`tel:${contact.contactPhoneDisplay.replace(/[^\d+]/g, '')}`}
                      className="group flex items-center gap-3 w-fit"
                    >
                      <Phone className="size-[18px] text-text-tertiary transition-colors group-hover:text-accent-gold" />
                      <span className="text-body-sm font-body-sm text-text-secondary transition-colors group-hover:text-accent-gold">
                        {contact.contactPhoneDisplay}
                      </span>
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {/* Right Column Form */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="executive-card rounded-3xl p-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="size-8" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary">
                  {settings.successHeading}
                </h3>
                <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
                  Thank you, {formData.firstName || 'Executive'}. {settings.successBody}
                </p>
                {notificationFailed ? (
                  <p role="alert" className="text-[13px] text-amber-300">
                    Your enquiry was saved, but the email notification could not
                    be sent. Please contact us directly to ensure a prompt
                    response.
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false)
                    setNotificationFailed(false)
                    setFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phoneOrCompany: '',
                      message: '',
                    })
                  }}
                  className="mt-4 px-6 py-2.5 rounded-lg bg-slate-surface border border-slate-border text-text-primary text-sm font-semibold hover:border-primary/50 transition-all cursor-pointer"
                >
                  {settings.successAgainLabel}
                </button>
              </div>
            ) : (
              <form
                className="space-y-6 executive-card rounded-3xl p-8"
                onSubmit={handleSubmit}
                onMouseEnter={handleInteraction}
                onFocus={handleInteraction}
              >
                {/* Row 1: First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-first-name" className="text-mono-metric font-mono-metric text-text-tertiary text-[11px] uppercase tracking-wider block mb-2">
                      first name *
                    </label>
                    <input
                      id="contact-first-name"
                      name="firstName"
                      className="w-full px-4 py-3.5 rounded-lg executive-input text-body-sm font-body-sm bg-obsidian-base border border-slate-border focus:border-primary text-text-primary"
                      placeholder="First name"
                      required
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-last-name" className="text-mono-metric font-mono-metric text-text-tertiary text-[11px] uppercase tracking-wider block mb-2">
                      last name *
                    </label>
                    <input
                      id="contact-last-name"
                      name="lastName"
                      className="w-full px-4 py-3.5 rounded-lg executive-input text-body-sm font-body-sm bg-obsidian-base border border-slate-border focus:border-primary text-text-primary"
                      placeholder="Last name"
                      required
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Row 2: Email & Phone / Organization */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-email" className="text-mono-metric font-mono-metric text-text-tertiary text-[11px] uppercase tracking-wider block mb-2">
                      email address *
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      className="w-full px-4 py-3.5 rounded-lg executive-input text-body-sm font-body-sm bg-obsidian-base border border-slate-border focus:border-primary text-text-primary"
                      placeholder="name@company.com"
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="text-mono-metric font-mono-metric text-text-tertiary text-[11px] uppercase tracking-wider block mb-2">
                      phone number / company
                    </label>
                    <input
                      id="contact-phone"
                      name="phoneOrCompany"
                      className="w-full px-4 py-3.5 rounded-lg executive-input text-body-sm font-body-sm bg-obsidian-base border border-slate-border focus:border-primary text-text-primary"
                      // type="tel" rather than "text": it selects the numeric
                      // keypad on mobile and lets the browser/OS offer
                      // autofill for whatever country the visitor is in. It does
                      // NOT validate the value, so this stays permissive.
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      // Shows the site's own country first (most enquiries are
                      // local) plus a foreign one, so a visitor elsewhere does
                      // not assume an India-only format is expected. The country
                      // code is REQUIRED, so the leading + is shown, not
                      // implied.
                      placeholder="+91 98765 43210 or +44 20 7946 0958, or company name"
                      value={formData.phoneOrCompany}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneOrCompany: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Row 3: Message Textarea */}
                <div>
                  <label htmlFor="contact-message" className="text-mono-metric font-mono-metric text-text-tertiary text-[11px] uppercase tracking-wider block mb-2">
                    message *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    className="w-full px-4 py-3.5 rounded-lg executive-input text-body-sm font-body-sm bg-obsidian-base border border-slate-border focus:border-primary text-text-primary"
                    placeholder="Provide context regarding timelines, architecture goals, or network collaboration requirements..."
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>

                {error ? (
                  <p role="alert" className="text-[13px] text-red-400">
                    {error}
                  </p>
                ) : null}

                {/* Disclaimer */}
                <div className="text-mono-metric font-mono-metric text-text-tertiary text-[12px] leading-relaxed">
                  By submitting this form, you agree to our{' '}
                  <a
                    className="underline text-text-secondary hover:text-text-primary"
                    href={settings.privacyHref}
                  >
                    {settings.privacyLabel}
                  </a>{' '}
                  {settings.privacyConsent}
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex items-center justify-between">
                  <button
                    className="inline-flex items-center gap-3 px-8 py-3.5 rounded-lg bg-primary-container text-white hover:opacity-95 font-bold tracking-wider uppercase transition-all duration-150 text-[14px] shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                    type="submit"
                    disabled={sending}
                  >
                    <span>{sending ? 'Sending' : settings.submitLabel}</span>
                    <AppIcon name={settings.submitIcon} className="size-[18px]" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Reveal>
      </div>
    </section>
  )
}
