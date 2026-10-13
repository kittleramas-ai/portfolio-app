'use client'

import * as React from 'react'
import { cn } from '../../routes/lib/utils'
import {
  X,
  Send,
  CheckCircle,
  CheckCheck,
  LoaderCircle,
  BriefcaseBusiness,
  Lightbulb,
  CalendarDays,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import { submitChatbotEnquiryFn } from '../../../admin/server/public.ts'
import { isAcceptablePhoneOrCompanyStrict } from '../../lib/phone.ts'
import { hasLetter, isValidName } from '../../lib/text.ts'
import type { ChatbotSettings } from '../../../admin/server/settings-schema'
import { AiOrb } from './AiOrb'

export type ChatbotStep =
  | 'greeting'
  | 'name'
  | 'email'
  | 'phone'
  | 'query'
  | 'appointment'
  | 'submitting'
  | 'success'
  | 'error'

interface ChatbotMessage {
  id: string
  type: 'bot' | 'user'
  content: string
  timestamp: Date
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phoneOrCompany: string
  message: string
  appointment: boolean
}

const STEP_ORDER: ChatbotStep[] = [
  'name',
  'email',
  'phone',
  'query',
  'appointment',
]

const PROMPT_FIELD: Record<ChatbotStep, keyof ChatbotSettings> = {
  greeting: 'greetingPrompt',
  name: 'namePrompt',
  email: 'emailPrompt',
  phone: 'phonePrompt',
  query: 'queryPrompt',
  appointment: 'appointmentPrompt',
  submitting: 'submittingMessage',
  success: 'successMessage',
  error: 'errorMessage',
}

function promptFor(
  step: ChatbotStep,
  form: FormData,
  copy: ChatbotSettings,
): string {
  return copy[PROMPT_FIELD[step]].replace(
    /\{\{(\w+)\}\}/g,
    (match, key: keyof FormData) => {
      const value = form[key]
      return typeof value === 'string' && value ? value : match
    },
  )
}

const GREETINGS = ['hi', 'hello', 'hey', 'hii', 'hlo', 'yo', 'hola']

const CHAT_STARTER_SUGGESTIONS = [
  {
    title: 'Business collaboration',
    detail: 'Explore a project or partnership',
    message: "I'd like to discuss a business collaboration",
    Icon: BriefcaseBusiness,
    color: 'from-amber-500 to-amber-600',
  },
  {
    title: 'Strategic advisory',
    detail: 'Talk through a challenge or idea',
    message: "I'm interested in strategic advisory",
    Icon: Lightbulb,
    color: 'from-yellow-500 to-amber-500',
  },
  {
    title: 'Schedule a consultation',
    detail: 'Find a time to connect',
    message: "I'd like to schedule a consultation",
    Icon: CalendarDays,
    color: 'from-emerald-500 to-teal-600',
  },
]

const PRESENCE_DOT_STYLE: Record<ChatbotSettings['presence'], string> = {
  online: 'bg-emerald-500 text-emerald-500',
  busy: 'bg-amber-500',
  offline: 'bg-slate-400',
}

const PRESENCE_LABEL_STYLE: Record<ChatbotSettings['presence'], string> = {
  online: 'text-emerald-600 dark:text-emerald-400',
  busy: 'text-amber-600 dark:text-amber-400',
  offline: 'text-text-tertiary',
}

function isLivePresence(presence: ChatbotSettings['presence']): boolean {
  return presence === 'online' || presence === 'busy'
}

const AVATAR_SIZES = {
  sm: 'size-7 rounded-full',
  md: 'size-10 rounded-full',
  lg: 'size-14 rounded-full',
} as const

function NexaAvatar({
  size,
  avatarUrl,
  thinking = false,
  isUserTyping = false,
  className,
  children,
}: {
  size: keyof typeof AVATAR_SIZES
  avatarUrl?: string
  thinking?: boolean
  isUserTyping?: boolean
  className?: string
  children?: React.ReactNode
}) {
  const orbSizeMap: Record<keyof typeof AVATAR_SIZES, 'sm' | 'md' | 'xl'> = {
    sm: 'sm',
    md: 'md',
    lg: 'xl',
  }

  return (
    <div className={cn('relative inline-flex shrink-0 items-center justify-center', className)}>
      <AiOrb
        size={orbSizeMap[size]}
        variant="gold-aurora"
        isBotTyping={thinking}
        isUserTyping={isUserTyping}
        avatarUrl={avatarUrl}
      />
      {children}
    </div>
  )
}

function VisitorAvatar() {
  return (
    <span
      className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--chat-accent-border)] bg-[var(--chat-accent-soft)] text-[var(--chat-accent-strong)] shadow-sm"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="size-3.5"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    </span>
  )
}

const MESSAGE_TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
})

const TYPING_BASE_MS = 620
const TYPING_PER_CHAR_MS = 6
const TYPING_MAX_MS = 1400

export interface ChatbotModalProps {
  copy: ChatbotSettings
  onClose: () => void
}

const STORAGE_KEY = 'portfolio-chatbot-session'

/**
 * Identifies THIS page load.
 *
 * `sessionStorage` deliberately outlives a refresh — that is exactly what makes
 * closing the panel and reopening it keep the conversation, since closing
 * unmounts this component and the state has to come from somewhere. But it
 * outlives refresh too, which is wrong here: a reload is a fresh visit and
 * should start a clean conversation.
 *
 * This token separates the two cases. It is generated at MODULE SCOPE, which
 * the browser re-evaluates on every page load but not on a re-open, so state
 * written during this load matches the token (persist) while state written
 * during any earlier load does not (discard).
 *
 * Module scope rather than a stored value on purpose: reading a token back out
 * of storage would return the pre-refresh one and defeat the check entirely.
 */
const LOAD_TOKEN: string = (() => {
  if (typeof window === 'undefined') return 'ssr'
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random()}`
  }
})()

interface SavedChatState {
  /** The page load that wrote this. Stale loads are discarded on read. */
  loadToken: string
  step: ChatbotStep
  messages: Array<{
    id: string
    type: 'bot' | 'user'
    content: string
    timestamp: string
  }>
  formData: FormData
  stepIndex: number
}

function loadSavedState(): SavedChatState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedChatState
    // Written by an earlier page load -> treat this as a new conversation, and
    // drop it so a later reload cannot resurrect it either.
    if (parsed?.loadToken !== LOAD_TOKEN) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function ChatbotModal({ copy, onClose }: ChatbotModalProps) {
  const saved = React.useMemo(() => loadSavedState(), [])

  const [step, setStep] = React.useState<ChatbotStep>(saved?.step ?? 'greeting')
  const [messages, setMessages] = React.useState<ChatbotMessage[]>(() => {
    if (!saved?.messages) return []
    return saved.messages.map((m) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }))
  })
  const [formData, setFormData] = React.useState<FormData>(
    saved?.formData ?? {
      firstName: '',
      lastName: '',
      email: '',
      phoneOrCompany: '',
      message: '',
      appointment: false,
    },
  )
  const [inputValue, setInputValue] = React.useState('')
  const [isUserTyping, setIsUserTyping] = React.useState(false)
  const userTypingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isCheckingPhone, setIsCheckingPhone] = React.useState(false)
  const [isTyping, setIsTyping] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const currentStepIndex = React.useRef(saved?.stepIndex ?? 0)
  const timers = React.useRef<number[]>([])

  const clearTimers = React.useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }, [])

  const schedule = React.useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timers.current.push(id)
  }, [])

  // Persist conversation updates to sessionStorage
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (messages.length === 0 && step === 'greeting') {
        sessionStorage.removeItem(STORAGE_KEY)
        return
      }
      const toSave: SavedChatState = {
        loadToken: LOAD_TOKEN,
        step,
        messages: messages.map((m) => ({
          ...m,
          timestamp: m.timestamp.toISOString(),
        })),
        formData,
        stepIndex: currentStepIndex.current,
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch {
      // sessionStorage quota or security restriction fallback
    }
  }, [step, messages, formData])

  const resetChatbot = React.useCallback(() => {
    clearTimers()
    setIsTyping(false)
    setIsUserTyping(false)
    setStep('greeting')
    setMessages([])
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneOrCompany: '',
      message: '',
      appointment: false,
    })
    setInputValue('')
    setError(null)
    currentStepIndex.current = 0
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [clearTimers])

  React.useEffect(() => clearTimers, [clearTimers])

  React.useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, step, isSubmitting, isTyping])

  React.useEffect(() => {
    const input = inputRef.current
    if (!input) return
    function onFocus() {
      setTimeout(() => {
        const el = scrollRef.current
        if (!el) return
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      }, 0)
    }
    input.addEventListener('focus', onFocus)
    return () => input.removeEventListener('focus', onFocus)
  }, [])

  React.useEffect(() => {
    if (
      step === 'submitting' ||
      step === 'success' ||
      step === 'error'
    ) {
      return
    }
    const el = inputRef.current
    if (!el || document.activeElement === el) return
    el.focus({ preventScroll: true })
  }, [step, messages, error])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)

    if (val.trim().length > 0) {
      setIsUserTyping(true)
      if (userTypingTimeoutRef.current) clearTimeout(userTypingTimeoutRef.current)
      userTypingTimeoutRef.current = setTimeout(() => {
        setIsUserTyping(false)
      }, 1200)
    } else {
      setIsUserTyping(false)
    }
  }

  const addBotMessage = (content: string) => {
    const newMessage: ChatbotMessage = {
      id: crypto.randomUUID(),
      type: 'bot',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const addUserMessage = (content: string) => {
    const newMessage: ChatbotMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const botSays = (content: string) => {
    const delay = Math.min(
      TYPING_MAX_MS,
      TYPING_BASE_MS + content.length * TYPING_PER_CHAR_MS,
    )
    setIsTyping(true)
    schedule(() => {
      setIsTyping(false)
      addBotMessage(content)
    }, delay)
  }

  const validateAndProceed = async (value: string) => {
    const currentStep = STEP_ORDER[currentStepIndex.current]
    let isValid = true
    let errorMsg = ''
    let nextForm: FormData = formData

    switch (currentStep) {
      case 'name':
        if (!value.trim()) {
          isValid = false
          errorMsg = copy.nameRequiredMessage
        } else if (!hasLetter(value)) {
          isValid = false
          errorMsg = copy.nameTextRequiredMessage
        } else if (!isValidName(value)) {
          isValid = false
          errorMsg = 'Please enter a valid name (letters only, avoiding random characters).'
        } else {
          const parts = value.trim().split(/\s+/)
          nextForm = {
            ...nextForm,
            firstName: parts[0],
            lastName: parts.slice(1).join(' '),
          }
        }
        break
      case 'email':
        if (!value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          isValid = false
          errorMsg = copy.emailInvalidMessage
        } else {
          nextForm = { ...nextForm, email: value.trim().toLowerCase() }
        }
        break
      case 'phone':
        setIsCheckingPhone(true)
        try {
          if (!(await isAcceptablePhoneOrCompanyStrict(value))) {
            isValid = false
            errorMsg = copy.phoneInvalidMessage
          } else {
            nextForm = { ...nextForm, phoneOrCompany: value.trim() }
          }
        } finally {
          setIsCheckingPhone(false)
        }
        break
      case 'query':
        if (!value.trim()) {
          isValid = false
          errorMsg = copy.queryRequiredMessage
        } else if (!hasLetter(value)) {
          isValid = false
          errorMsg = copy.queryTextRequiredMessage
        } else {
          nextForm = { ...nextForm, message: value.trim() }
        }
        break
      case 'appointment': {
        const lower = value.trim().toLowerCase()
        if (!['yes', 'no', 'y', 'n'].includes(lower)) {
          isValid = false
          errorMsg = copy.appointmentInvalidMessage
        } else {
          nextForm = { ...nextForm, appointment: ['yes', 'y'].includes(lower) }
        }
        break
      }
    }

    if (!isValid) {
      setError(errorMsg)
      return false
    }

    setError(null)
    setFormData(nextForm)
    addUserMessage(value)
    setIsUserTyping(false)

    currentStepIndex.current = Math.min(
      currentStepIndex.current + 1,
      STEP_ORDER.length - 1,
    )
    const nextStep = STEP_ORDER[currentStepIndex.current]
    setStep(nextStep)
    botSays(promptFor(nextStep, nextForm, copy))

    setInputValue('')
    return true
  }

  const submitForm = async (appointment: boolean) => {
    setStep('submitting')
    setIsSubmitting(true)
    setError(null)

    try {
      const { getRecaptchaToken } = await import('../../lib/recaptcha')
      const recaptchaToken = await getRecaptchaToken('chatbot')

      await submitChatbotEnquiryFn({
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneOrCompany: formData.phoneOrCompany,
          message: formData.message,
          appointment,
          recaptchaToken,
        },
      })

      setStep('success')
      botSays(promptFor('success', formData, copy))
    } catch {
      setStep('error')
      botSays(promptFor('error', formData, copy))
    } finally {
      setIsSubmitting(false)
    }
  }

  const answerAppointment = async (value: string) => {
    const lower = value.trim().toLowerCase()
    if (!['yes', 'no', 'y', 'n'].includes(lower)) {
      setError(copy.appointmentInvalidMessage)
      return
    }
    const appointment = ['yes', 'y'].includes(lower)
    setFormData((prev) => ({ ...prev, appointment }))
    addUserMessage(value.trim())
    setIsUserTyping(false)
    setInputValue('')
    setError(null)
    await submitForm(appointment)
  }

  const handleQuickReply = (value: string) => {
    if (step === 'appointment' && !isTyping && !isSubmitting) {
      void answerAppointment(value)
    }
  }

  const startFromChip = (starter: string = copy.greetingChipLabel) => {
    if (isTyping) return
    addUserMessage(starter)
    setInputValue('')
    setError(null)
    setStep('name')
    currentStepIndex.current = 0
    botSays(promptFor('greeting', formData, copy))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = inputValue.trim()
    if (!value || isTyping || isCheckingPhone) return

    if (step === 'greeting') {
      const normalized = value.toLowerCase().replace(/[^a-z]/g, '')
      if (!GREETINGS.includes(normalized)) {
        setError(copy.greetingRequiredMessage)
        return
      }
      addUserMessage(value)
      setIsUserTyping(false)
      setInputValue('')
      setError(null)
      setStep('name')
      currentStepIndex.current = 0
      botSays(promptFor('greeting', formData, copy))
      return
    }

    const currentStep = STEP_ORDER[currentStepIndex.current]

    if (currentStep === 'appointment') {
      await answerAppointment(value)
    } else {
      await validateAndProceed(value)
    }
  }

  const currentStepLabel = STEP_ORDER[currentStepIndex.current] || ''
  const isComposerLocked = isTyping || isCheckingPhone || isSubmitting
  const presenceDotStyle = PRESENCE_DOT_STYLE[copy.presence]
  const presenceLabelStyle = PRESENCE_LABEL_STYLE[copy.presence]
  const presenceIsLive = isLivePresence(copy.presence)
  const lastMessage = messages[messages.length - 1]
  const showAppointmentQuickReplies =
    step === 'appointment' &&
    !isSubmitting &&
    !isTyping &&
    messages.length > 0 &&
    lastMessage.type === 'bot' &&
    lastMessage.content === promptFor('appointment', formData, copy)

  return (
    <div
      className="chat-panel-enter w-[min(420px,calc(100vw-2rem))] sm:w-[420px] siri-aurora-glow-container"
      role="dialog"
      aria-label={`${copy.headerTitle} chat`}
    >
      <div className="rounded-[26px] overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 bg-[var(--backdrop-base)]/95 text-text-primary backdrop-blur-3xl">
        {/* Header with Close Button inside Header */}
        <div className="relative flex items-center justify-between p-4 border-b border-[var(--chat-accent-border)] bg-gradient-to-r from-[var(--backdrop-base)] via-[var(--chat-accent-soft)] to-[var(--backdrop-base)]">
          <div className="flex items-center gap-3 min-w-0">
            <NexaAvatar
              size="md"
              avatarUrl={copy.avatarUrl}
              thinking={isTyping}
              isUserTyping={isUserTyping}
            >
              <span
                className={cn(
                  'chat-led absolute -bottom-0.5 -right-0.5 size-3 rounded-full border border-black/20',
                  presenceDotStyle,
                  presenceIsLive && 'ring-2 ring-emerald-500/30 animate-pulse',
                  'promote-layer-border'
                )}
                aria-hidden="true"
              />
            </NexaAvatar>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-[var(--chat-accent-strong)] text-sm leading-tight truncate tracking-tight">
                  {copy.headerTitle}
                </p>
                <Sparkles className={cn(
                  'size-3.5 text-[var(--chat-accent-strong)] shrink-0 animate-pulse',
                  'promote-layer-bg'
                )} />
              </div>

              {isTyping ? (
                <p
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-1 text-mono-metric text-[10px] uppercase tracking-[0.14em] text-[var(--chat-accent-strong)] font-semibold"
                >
                  <span className="truncate">{copy.typingHeaderLabel}</span>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      aria-hidden="true"
                      style={{ animationDelay: `${i * 0.16}s` }}
                      className="chat-typing-dot size-1 rounded-full bg-[var(--chat-accent-strong)]"
                    />
                  ))}
                </p>
              ) : isUserTyping ? (
                <p className="flex items-center gap-1.5 text-mono-metric text-[10px] uppercase tracking-[0.14em] text-[var(--chat-accent-strong)] font-semibold animate-pulse">
                  <span>Listening...</span>
                </p>
              ) : (
                <p className="flex items-center gap-1.5 text-mono-metric text-[10px] uppercase tracking-[0.14em]">
                  <span className={cn('truncate font-bold', presenceLabelStyle)}>
                    {copy.presenceLabel}
                  </span>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 p-2 rounded-full text-text-tertiary hover:text-text-primary hover:bg-[var(--chat-accent-soft)] transition-colors"
            aria-label="Close chat"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div
          ref={scrollRef}
          className="h-[min(500px,54svh)] overflow-y-auto overscroll-contain p-5 space-y-5"
          style={{ scrollbarWidth: 'thin' }}
          role="log"
          aria-live="polite"
          aria-label="Conversation transcript"
        >
          {/* Empty / Welcome State */}
          {messages.length === 0 ? (
            <div className="chat-bubble-enter flex min-h-full flex-col items-center justify-center gap-5 px-3 py-4 text-center">
              <div className="relative flex items-center justify-center">
                <NexaAvatar
                  size="lg"
                  avatarUrl={copy.avatarUrl}
                  thinking={isTyping}
                  isUserTyping={isUserTyping}
                />
                <div className="absolute -inset-5 bg-[var(--chat-accent-soft)] rounded-full blur-xl -z-10 animate-pulse" />
              </div>

              <div>
                <h3 className="text-base font-bold text-[var(--chat-accent-strong)] tracking-tight flex items-center justify-center gap-2">
                  <span>{copy.headerTitle}</span>
                </h3>
                <p className="mt-1 text-xs text-text-secondary leading-relaxed max-w-xs mx-auto">
                  {copy.emptyStatePrompt}
                </p>
              </div>

              {/* Suggestion Starter Cards */}
              <div className="w-full">
                <p className="mb-2.5 text-left text-mono-metric text-[10px] uppercase tracking-[0.14em] text-[var(--chat-accent-strong)] font-bold">
                  Suggested Topics
                </p>
                <div className="flex flex-col gap-2.5">
                  {CHAT_STARTER_SUGGESTIONS.map(({ title, detail, message, Icon }, index) => (
                    <button
                      key={title}
                      type="button"
                      onClick={() => startFromChip(message)}
                      disabled={isTyping}
                      style={{ animationDelay: `${index * 70}ms` }}
                      className="chat-suggestion-enter group flex w-full items-center gap-3 rounded-2xl border border-[var(--chat-accent-border)] bg-[var(--chat-accent-soft)] p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--chat-accent-strong)] hover:bg-[var(--chat-accent-hover)] hover:shadow-md focus-visible:outline-[var(--chat-accent-strong)] disabled:opacity-50"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[var(--chat-accent-border)] bg-[var(--backdrop-base)] text-[var(--chat-accent-strong)] transition-colors group-hover:bg-[var(--chat-accent-soft)]">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold leading-snug text-text-primary">
                          {title}
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-snug text-text-tertiary">
                          {detail}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="size-4 shrink-0 text-text-tertiary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--chat-accent-strong)]"
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => startFromChip()}
                  disabled={isTyping}
                  className="mt-3.5 text-xs font-semibold text-[var(--chat-accent-strong)] transition-colors hover:underline disabled:opacity-50"
                >
                  Or type {copy.greetingChipLabel} to begin
                </button>
              </div>
            </div>
          ) : null}

          {/* Message Bubbles */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'chat-bubble-enter flex items-end gap-2.5 max-w-[88%]',
                msg.type === 'bot' ? 'justify-start' : 'justify-end ml-auto'
              )}
            >
              {msg.type === 'bot' ? (
                <NexaAvatar
                  size="sm"
                  avatarUrl={copy.avatarUrl}
                  thinking={isTyping}
                  isUserTyping={isUserTyping}
                />
              ) : null}

              <div
                className={cn(
                  'min-w-0 px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm font-medium',
                  msg.type === 'bot'
                    ? 'rounded-2xl rounded-tl-sm border border-[var(--chat-bot-bubble-border)] bg-[var(--chat-bot-bubble-bg)] text-[var(--chat-bot-bubble-text)]'
                    : 'rounded-2xl rounded-tr-sm border border-[var(--chat-user-bubble-border)] bg-[var(--chat-user-bubble-bg)] text-text-primary'
                )}
              >
                <span className="block whitespace-pre-wrap break-words">
                  {msg.content}
                </span>
                <span
                  className={cn(
                    'mt-1.5 flex items-center justify-end gap-1 text-[10px] leading-none tabular-nums opacity-80',
                    msg.type === 'bot' ? 'text-[var(--chat-bot-bubble-text)]' : 'text-text-tertiary'
                  )}
                >
                  {MESSAGE_TIME_FORMAT.format(msg.timestamp)}
                  {msg.type === 'user' ? (
                    <CheckCheck className="size-3.5 shrink-0 text-[var(--chat-accent-strong)]" aria-hidden="true" />
                  ) : null}
                </span>
              </div>

              {msg.type === 'user' ? <VisitorAvatar /> : null}
            </div>
          ))}

          {/* Typing Bubble */}
          {isTyping ? (
            <div className="chat-bubble-enter flex items-end justify-start gap-2.5">
              <NexaAvatar
                size="sm"
                avatarUrl={copy.avatarUrl}
                thinking={true}
              />
              <div
                role="status"
                aria-label={copy.typingIndicatorLabel}
                className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-[var(--chat-accent-border)] bg-[var(--chat-accent-soft)] px-4 py-3 shadow-sm"
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    style={{ animationDelay: `${i * 0.16}s` }}
                    className="chat-typing-dot size-2 rounded-full bg-[var(--chat-accent-strong)]"
                  />
                ))}
                <span className="text-[11px] font-mono font-bold tracking-wider text-[var(--chat-accent-strong)] ml-1">
                  Nexa is thinking...
                </span>
              </div>
            </div>
          ) : null}

          {step === 'submitting' && (
            <div className="chat-bubble-enter flex items-end justify-start gap-2.5">
              <NexaAvatar
                size="sm"
                avatarUrl={copy.avatarUrl}
                thinking={true}
              />
              <div className="rounded-2xl rounded-tl-sm border border-[var(--chat-bot-bubble-border)] bg-[var(--chat-bot-bubble-bg)] px-4 py-3 text-xs font-medium text-[var(--chat-bot-bubble-text)]">
                {promptFor('submitting', formData, copy)}
              </div>
            </div>
          )}

          {error && (
            <div
              key={error}
              className="chat-bubble-enter flex items-start justify-start gap-2 px-1"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-red-500/40 bg-red-500/20 text-red-500 font-bold">
                !
              </div>
              <p className="flex-1 rounded-2xl rounded-tl-sm border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {showAppointmentQuickReplies && (
            <div className="chat-bubble-enter flex items-end justify-start gap-2.5">
              <NexaAvatar size="sm" avatarUrl={copy.avatarUrl} />
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickReply('Yes')}
                  disabled={isTyping}
                  className="px-5 py-2.5 rounded-xl bg-[var(--chat-accent-strong)] text-[var(--chat-accent-contrast)] text-xs font-bold hover:opacity-90 transition-all min-w-[84px] disabled:opacity-50 shadow-md"
                >
                  {copy.yesLabel}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickReply('No')}
                  disabled={isTyping}
                  className="px-5 py-2.5 rounded-xl bg-[var(--backdrop-base)] border border-[var(--chat-accent-border)] text-text-primary text-xs font-bold hover:border-[var(--chat-accent-strong)] transition-all min-w-[84px] disabled:opacity-50"
                >
                  {copy.noLabel}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input Composer Section */}
        {step !== 'success' &&
          step !== 'error' &&
          step !== 'submitting' && (
            <form
              onSubmit={handleSubmit}
              className="relative border-t border-[var(--chat-accent-border)] p-4 bg-[var(--backdrop-base)] space-y-3"
            >
              {isUserTyping && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--chat-accent-strong)] animate-pulse" />
              )}

              <div className="flex gap-2.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={
                    step === 'greeting'
                      ? `Type ${copy.greetingChipLabel} to start...`
                      : currentStepLabel === 'appointment'
                        ? `Type ${copy.yesLabel} or ${copy.noLabel}...`
                        : `Enter your ${currentStepLabel}...`
                  }
                  className="flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm bg-[var(--backdrop-base)] border border-[var(--chat-accent-border)] focus:border-[var(--chat-accent-strong)] focus:ring-1 focus:ring-[var(--chat-accent-strong)] text-text-primary placeholder:text-text-tertiary disabled:opacity-60 transition-all font-medium"
                  disabled={isComposerLocked}
                  autoComplete="off"
                  enterKeyHint={step === 'greeting' ? 'send' : 'next'}
                />
                <button
                  type="submit"
                  disabled={isComposerLocked || !inputValue.trim()}
                  className="px-4 py-3 rounded-2xl bg-[var(--chat-accent-strong)] text-[var(--chat-accent-contrast)] font-bold hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[48px] shadow-md"
                  aria-label="Send"
                >
                  {isTyping || isCheckingPhone ? (
                    <LoaderCircle className="size-5 animate-spin" />
                  ) : (
                    <Send className="size-5" />
                  )}
                </button>
              </div>

              {step !== 'greeting' ? (
                <div className="flex items-center justify-center gap-2 pt-1">
                  <div
                    className="h-1 w-28 overflow-hidden rounded-full bg-[var(--chat-accent-soft)]"
                    role="progressbar"
                    aria-valuemin={1}
                    aria-valuemax={STEP_ORDER.length}
                    aria-valuenow={currentStepIndex.current + 1}
                  >
                    <div
                      className="h-full rounded-full bg-[var(--chat-accent-strong)] transition-all duration-500 ease-out"
                      style={{
                        width: `${((currentStepIndex.current + 1) / STEP_ORDER.length) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-mono-metric text-[10px] font-bold text-[var(--chat-accent-strong)] whitespace-nowrap">
                    Step {currentStepIndex.current + 1} of {STEP_ORDER.length}
                  </p>
                </div>
              ) : null}
            </form>
          )}

        {step === 'success' && (
          <div className="p-6 border-t border-[var(--chat-accent-border)] bg-[var(--backdrop-base)] text-center space-y-3">
            <CheckCircle className="size-12 text-emerald-500 mx-auto animate-bounce" />
            <p className="text-xs sm:text-sm text-text-primary font-semibold">
              {copy.successFooter}
            </p>
            <button
              onClick={() => {
                resetChatbot()
                onClose()
              }}
              className="mt-2 px-5 py-2.5 rounded-xl bg-[var(--chat-accent-soft)] border border-[var(--chat-accent-border)] text-[var(--chat-accent-strong)] text-xs font-bold hover:bg-[var(--chat-accent-hover)] transition-all"
            >
              {copy.successCloseLabel}
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="p-6 border-t border-[var(--chat-accent-border)] bg-[var(--backdrop-base)] text-center">
            <button
              onClick={() => {
                resetChatbot()
              }}
              className="px-5 py-2.5 rounded-xl bg-[var(--chat-accent-soft)] border border-[var(--chat-accent-border)] text-[var(--chat-accent-strong)] text-xs font-bold hover:bg-[var(--chat-accent-hover)] transition-all"
            >
              {copy.retryLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
