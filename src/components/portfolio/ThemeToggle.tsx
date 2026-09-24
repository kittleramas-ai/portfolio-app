import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme'
import { cn } from '../../lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleTheme}
      className={cn(
        'theme-toggle group relative inline-flex h-8 w-[60px] shrink-0 cursor-pointer items-center rounded-full border px-1 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300',
        'border-slate-border bg-slate-surface hover:border-primary/50',
        className,
      )}
      style={{
        backgroundColor: 'var(--toggle-track)',
        borderColor: 'var(--toggle-border)',
      }}
    >
      {/* Track icons */}
      <Sun
        className={cn(
          'absolute left-1.5 h-4 w-4 transition-all duration-300',
          isDark ? 'opacity-40' : 'opacity-100',
        )}
        style={{ color: isDark ? 'var(--text-tertiary)' : '#8C6D1F' }}
        aria-hidden
      />
      <Moon
        className={cn(
          'absolute right-1.5 h-4 w-4 transition-all duration-300',
          isDark ? 'opacity-100' : 'opacity-40',
        )}
        style={{ color: isDark ? '#E5C07B' : 'var(--text-tertiary)' }}
        aria-hidden
      />
      {/* Sliding thumb */}
      <span
        aria-hidden
        className={cn(
          'relative z-10 flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-transform duration-300',
          isDark ? 'translate-x-[28px]' : 'translate-x-0',
        )}
        style={{
          backgroundColor: 'var(--toggle-thumb)',
          border: '1px solid var(--toggle-thumb-border)',
        }}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-slate-900" aria-hidden />
        ) : (
          <Sun className="h-3.5 w-3.5 text-white" aria-hidden />
        )}
      </span>
    </button>
  )
}
