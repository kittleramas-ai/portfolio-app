import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme'
import { cn } from '../../routes/lib/utils'

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
        className="absolute left-1.5 h-4 w-4 transition-all duration-300 opacity-100 dark:opacity-40 text-[#8C6D1F] dark:text-[var(--text-tertiary)]"
        aria-hidden="true"
      />
      <Moon
        className="absolute right-1.5 h-4 w-4 transition-all duration-300 opacity-40 dark:opacity-100 text-[var(--text-tertiary)] dark:text-[#E5C07B]"
        aria-hidden="true"
      />
      {/* Sliding thumb */}
      <span
        aria-hidden="true"
        className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-transform duration-300 translate-x-0 dark:translate-x-[28px]"
        style={{
          backgroundColor: 'var(--toggle-thumb)',
          border: '1px solid var(--toggle-thumb-border)',
        }}
      >
        <Moon className="hidden dark:block h-3.5 w-3.5 text-slate-900" aria-hidden="true" />
        <Sun className="block dark:hidden h-3.5 w-3.5 text-white" aria-hidden="true" />
      </span>
    </button>
  )
}
