import * as React from 'react'
import { Reveal } from './Reveal'
import { DEFAULT_SITE_SETTINGS } from '../../../admin/server/settings-schema'
import type {
  AdvisorySettings,
  ContactSettings,
} from '../../../admin/server/settings-schema'
import { submitEnquiryFn } from '../../../admin/server/public.ts'

const DEFAULT_ADVISORY = DEFAULT_SITE_SETTINGS.advisory
const DEFAULT_CONTACT = DEFAULT_SITE_SETTINGS.contact

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    try {
      const result = await submitEnquiryFn({ data: { ...formData } })
      setNotificationFailed(!result.notificationSent)
      setSubmitted(true)
    } catch (err) {
      // The row either exists or it does not; there is no retry-by-resubmit
      // story worth building, so the message stays generic.
      setError(
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
                      <span className="material-symbols-outlined text-[18px] text-text-tertiary transition-colors group-hover:text-accent-gold">
                        mail
                      </span>
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
                      <span className="material-symbols-outlined text-[18px] text-text-tertiary transition-colors group-hover:text-accent-gold">
                        call
                      </span>
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
                  <span className="material-symbols-outlined text-[32px]">
                    check_circle
                  </span>
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
                      placeholder="+91 00000 00000 / Company Name"
                      type="text"
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
                    <span className="material-symbols-outlined text-[18px]">
                      {settings.submitIcon}
                    </span>
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
