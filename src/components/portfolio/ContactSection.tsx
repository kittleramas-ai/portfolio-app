import * as React from 'react'
import { Reveal } from './Reveal'

export function ContactSection() {
  const [submitted, setSubmitted] = React.useState(false)
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneOrCompany: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
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
                CONTACT US
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
                If you're looking for an enterprise technology partner, let's
                connect!
              </h2>
              <p className="text-body-md font-body-md text-text-secondary leading-relaxed max-w-lg">
                Dr. S. K. selectively accepts corporate board advisory roles,
                high-concurrency cloud architecture mandates via Infodazz
                Technologies, and keynote speaking engagements across regional and
                global forums. Headquartered across Madurai, Chennai &amp; Global
                Remote.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-border/80 space-y-4">
              <div className="text-mono-metric font-mono-metric text-text-tertiary text-[11px]">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Official Executive Communications Office
                </span>
              </div>
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
                  Inquiry Successfully Transmitted
                </h3>
                <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
                  Thank you, {formData.firstName || 'Executive'}. The Executive
                  Secretariat has received your message and will review and respond
                  within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false)
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
                  Send Another Message
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
                    <label className="text-mono-metric font-mono-metric text-text-tertiary text-[11px] uppercase tracking-wider block mb-2">
                      first name *
                    </label>
                    <input
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
                    <label className="text-mono-metric font-mono-metric text-text-tertiary text-[11px] uppercase tracking-wider block mb-2">
                      last name *
                    </label>
                    <input
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
                    <label className="text-mono-metric font-mono-metric text-text-tertiary text-[11px] uppercase tracking-wider block mb-2">
                      email address *
                    </label>
                    <input
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
                    <label className="text-mono-metric font-mono-metric text-text-tertiary text-[11px] uppercase tracking-wider block mb-2">
                      phone number / company
                    </label>
                    <input
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
                  <label className="text-mono-metric font-mono-metric text-text-tertiary text-[11px] uppercase tracking-wider block mb-2">
                    message *
                  </label>
                  <textarea
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

                {/* Disclaimer */}
                <div className="text-mono-metric font-mono-metric text-text-tertiary text-[12px] leading-relaxed">
                  By submitting this form, you agree to our{' '}
                  <a
                    className="underline text-text-secondary hover:text-text-primary"
                    href="#privacy"
                  >
                    Privacy Policy
                  </a>{' '}
                  and consent to receive communications from Infodazz Technologies and
                  its executive entities.
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex items-center justify-between">
                  <button
                    className="inline-flex items-center gap-3 px-8 py-3.5 rounded-lg bg-text-primary text-obsidian-base hover:opacity-90 font-bold tracking-wider uppercase transition-all duration-150 text-[14px] shadow-lg cursor-pointer"
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                    type="submit"
                  >
                    <span>SUBMIT</span>
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
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
