'use client'

import * as React from 'react'
import { cn } from '../../routes/lib/utils'
import { Sparkles } from 'lucide-react'
import { prefersReducedMotion } from '../../routes/lib/gsap'
import { DEFAULT_SITE_SETTINGS } from '../../../admin/server/settings-schema'
import type { ChatbotSettings } from '../../../admin/server/settings-schema'
import { AiOrb } from './AiOrb'

const ChatbotModal = React.lazy(() =>
  import('./ChatbotModal').then((m) => ({ default: m.ChatbotModal })),
)

const NUDGE_SECTION_LIMIT = 4
const NUDGE_SCROLL_FLOOR_PX = 72
const NUDGE_SCROLL_DELTA_PX = 10
const NUDGE_IDLE_MS = 520
const NUDGE_MEASURE_MS = 400

function useScrollNudge(active: boolean): boolean {
  const [isNudging, setIsNudging] = React.useState(false)
  const lastScrollRef = React.useRef(0)
  const travelledRef = React.useRef(0)
  const limitRef = React.useRef<Element | null>(null)
  const measuredAtRef = React.useRef(0)
  const idleTimerRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (!active || prefersReducedMotion()) {
      setIsNudging(false)
      return
    }

    let frame = 0

    const readLimit = (): Element | null => {
      const fresh = performance.now() - measuredAtRef.current > NUDGE_MEASURE_MS
      if (!fresh && limitRef.current?.isConnected) return limitRef.current
      measuredAtRef.current = performance.now()
      const main = document.querySelector('main')
      limitRef.current = main?.children[NUDGE_SECTION_LIMIT] ?? null
      return limitRef.current
    }

    const stop = () => {
      travelledRef.current = 0
      setIsNudging(false)
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current)
        idleTimerRef.current = null
      }
    }

    const settle = () => {
      if (idleTimerRef.current !== null)
        window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = window.setTimeout(() => {
        setIsNudging(false)
        idleTimerRef.current = null
      }, NUDGE_IDLE_MS)
    }

    const evaluate = () => {
      frame = 0
      const y = window.scrollY
      const delta = y - lastScrollRef.current
      lastScrollRef.current = y

      if (delta > 0) travelledRef.current += delta
      else travelledRef.current = 0

      const limit = readLimit()
      if (
        !limit ||
        limit.getBoundingClientRect().top <= 0 ||
        y < NUDGE_SCROLL_FLOOR_PX
      ) {
        stop()
        return
      }
      if (travelledRef.current < NUDGE_SCROLL_DELTA_PX) {
        settle()
        return
      }

      setIsNudging(true)
      settle()
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(evaluate)
    }

    measuredAtRef.current = 0
    lastScrollRef.current = 0
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      if (idleTimerRef.current !== null)
        window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [active])

  return isNudging
}

export function ChatbotFab({
  className,
  settings,
}: {
  className?: string
  settings?: ChatbotSettings
}) {
  const copy = React.useMemo(
    () => settings ?? DEFAULT_SITE_SETTINGS.chatbot,
    [settings],
  )
  const [isOpen, setIsOpen] = React.useState(false)
  const isNudging = useScrollNudge(!isOpen)

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8',
        className,
      )}
    >
      {isNudging ? (
        <span
          aria-hidden="true"
          className="chat-fab-ping pointer-events-none absolute inset-0 rounded-full border border-[#D4AF37]/60"
        />
      ) : null}

      {!isOpen && (
        <span className={cn('relative block', isNudging && 'chat-fab-bounce')}>
          <button
            onClick={() => setIsOpen(true)}
            className={cn(
              'group siri-fab-glow relative flex size-14 sm:size-16 items-center justify-center rounded-full',
              'bg-[#071A12] text-white border-2 border-[#D4AF37]/80',
              'shadow-[0_0_35px_rgba(212,175,55,0.75)]',
              'transition-transform duration-300 ease-out hover:scale-110 active:scale-95',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]'
            )}
            aria-label={`Open ${copy.fabLabel}`}
            aria-expanded={false}
          >
            <div className="relative flex items-center justify-center z-10">
              <div className="relative inline-flex shrink-0 items-center justify-center">
                <AiOrb
                  size="md"
                  variant="gold-aurora"
                  avatarUrl={copy.avatarUrl}
                />
              </div>
            </div>

            <span
              className={cn(
                'pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2',
                'flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#D4AF37]/50 bg-[#071A12]/95 px-3.5 py-1.5',
                'font-mono-metric text-[12px] font-bold text-[#E5C07B] shadow-2xl backdrop-blur-xl',
                'transition-all duration-300 group-hover:scale-105 group-hover:border-[#D4AF37]',
                isNudging && 'border-[#D4AF37] text-[#E5C07B]',
              )}
            >
              <Sparkles
                className={cn(
                  'size-3.5 text-[#D4AF37]',
                  isNudging ? 'chat-nudge-sparkle' : 'animate-pulse',
                  'promote-layer-bg'
                )}
              />
              <span>{copy.fabLabel}</span>
            </span>
          </button>
        </span>
      )}

      {isOpen && (
        <React.Suspense fallback={null}>
          <ChatbotModal copy={copy} onClose={() => setIsOpen(false)} />
        </React.Suspense>
      )}
    </div>
  )
}
