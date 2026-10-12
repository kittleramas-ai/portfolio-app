'use client'

import * as React from 'react'
import { cn } from '../../routes/lib/utils'

export type OrbExpression = 'idle' | 'typing' | 'thinking' | 'happy' | 'focused'
export type OrbVariant = 'cyan-purple' | 'gold-aurora' | 'emerald-teal' | 'coral-pink' | 'silver' | 'dark'

interface AiOrbProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  expression?: OrbExpression
  variant?: OrbVariant
  isUserTyping?: boolean
  isBotTyping?: boolean
  className?: string
  /** If provided, renders an uploaded image avatar inside the orb container, but with orb lighting around it */
  avatarUrl?: string
}

const SIZE_CLASSES = {
  xs: 'size-6',
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-14',
  xl: 'size-20',
  '2xl': 'size-28',
}

const VARIANT_GRADIENTS: Record<OrbVariant, string> = {
  'gold-aurora': 'from-[#ffb703] via-[#fb8500] to-[#6a0dad]',
  'cyan-purple': 'from-[#00f2fe] via-[#4facfe] to-[#6b11ff]',
  'emerald-teal': 'from-[#00f5a0] via-[#00d9f5] to-[#10b981]',
  'coral-pink': 'from-[#ff0844] via-[#ffb199] to-[#f43f5e]',
  silver: 'from-[#cbd5e1] via-[#64748b] to-[#334155]',
  dark: 'from-[#3b82f6] via-[#1d4ed8] to-[#0f172a]',
}

export function AiOrb({
  size = 'md',
  expression = 'idle',
  variant = 'gold-aurora',
  isUserTyping = false,
  isBotTyping = false,
  className,
  avatarUrl,
}: AiOrbProps) {
  // Determine effective expression based on props
  const currentExpression: OrbExpression = isBotTyping
    ? 'thinking'
    : isUserTyping
    ? 'typing'
    : expression

  return (
    <div
      className={cn(
        'relative flex items-center justify-center shrink-0 rounded-full select-none overflow-hidden transition-all duration-300 shadow-md promote-layer',
        SIZE_CLASSES[size],
        className
      )}
    >
{/* Dynamic Background Mesh Gradients */}
      <div
        className={cn(
          'absolute inset-0 rounded-full bg-gradient-to-tr transition-all duration-700 promote-layer-bg',
          VARIANT_GRADIENTS[variant],
          isUserTyping || isBotTyping ? 'animate-orb-spin scale-110' : 'animate-orb-pulse'
        )}
      />
      
      {/* Layer 2: Shimmering Liquid Swirl */}
      <div
        className={cn(
          'absolute inset-[8%] rounded-full mix-blend-overlay opacity-85 blur-[1px] transition-all duration-500 promote-layer-bg',
          isUserTyping
            ? 'bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 animate-orb-swirl'
            : isBotTyping
            ? 'bg-gradient-to-r from-cyan-300 via-emerald-300 to-indigo-400 animate-orb-pulse'
            : 'bg-gradient-to-b from-white/70 to-transparent animate-orb-float'
        )}
      />

      {/* Layer 3: Specular 3D Glass Reflection */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0.2)_40%,transparent_70%)] pointer-events-none promote-layer-bg" />

      {/* Outer Glow Halo when Active */}
      <div
        className={cn(
          'absolute -inset-1 rounded-full opacity-0 blur-md transition-opacity duration-300 pointer-events-none promote-layer-shadow',
          (isUserTyping || isBotTyping) && 'opacity-70 bg-amber-400/50 animate-pulse'
        )}
      />

      {/* Content: Photo Avatar or Expressive AI Orb Eyes */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="relative z-10 size-full object-cover rounded-full mix-blend-normal"
        />
      ) : (
        <svg
          viewBox="0 0 100 100"
          className="relative z-10 size-[65%] transition-transform duration-300 promote-layer"
          style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.7))' }}
          aria-hidden="true"
        >
          {/* EXPRESSIONS */}
          {/* 1. TYPING EXPRESSION: Wide vertical pill eyes that pulse slightly */}
          {currentExpression === 'typing' && (
            <g className="transition-all duration-300">
              {/* Left Pill Eye */}
              <rect
                x="32"
                y="34"
                width="11"
                height="32"
                rx="5.5"
                fill="#ffffff"
                className="animate-orb-pill-pulse origin-center"
              />
              {/* Right Pill Eye */}
              <rect
                x="57"
                y="34"
                width="11"
                height="32"
                rx="5.5"
                fill="#ffffff"
                className="animate-orb-pill-pulse origin-center"
                style={{ animationDelay: '0.15s' }}
              />
            </g>
          )}

          {/* 2. THINKING EXPRESSION: Slit focused eyes or pulsing dots */}
          {currentExpression === 'thinking' && (
            <g className="transition-all duration-300 animate-orb-think">
              {/* Focused Slanted Eyes */}
              <path
                d="M 28 48 L 44 42"
                stroke="#ffffff"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M 72 48 L 56 42"
                stroke="#ffffff"
                strokeWidth="7"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* 3. HAPPY EXPRESSION: Curved inverted arcs ^ ^ */}
          {currentExpression === 'happy' && (
            <g className="transition-all duration-300">
              <path
                d="M 30 52 Q 38 36 46 52"
                stroke="#ffffff"
                strokeWidth="6.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 54 52 Q 62 36 70 52"
                stroke="#ffffff"
                strokeWidth="6.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* 4. IDLE / FOCUSED EXPRESSION: Expressive twin dots with CSS blink */}
          {(currentExpression === 'idle' || currentExpression === 'focused') && (
            <g className="transition-all duration-300">
              {/* Left Eye */}
              <ellipse
                cx="38"
                cy="50"
                rx="7"
                ry="8.5"
                fill="#ffffff"
                className="animate-orb-blink origin-[38px_50px]"
              />
              {/* Right Eye */}
              <ellipse
                cx="62"
                cy="50"
                rx="7"
                ry="8.5"
                fill="#ffffff"
                className="animate-orb-blink origin-[62px_50px]"
              />
            </g>
          )}
        </svg>
      )}

      {/* Inner Rim Shadow for depth */}
      <div className="absolute inset-0 rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.35)] pointer-events-none" />
    </div>
  )
}
