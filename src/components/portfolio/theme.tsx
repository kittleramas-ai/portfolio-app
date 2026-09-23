import * as React from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'portfolio-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // ignore storage errors (private mode, etc.)
  }
  // Default to white / light theme per product requirement.
  return 'light'
}

function paintTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // ignore storage errors
  }
}

/**
 * Instant theme flip: toggling `.dark` re-resolves CSS variables on every
 * themed element, and any `transition: all / colors` on large layers (body,
 * sections, blurred cards) would animate hundreds of repaints over ~300ms.
 * Suppressing transitions for a single frame collapses the switch into one
 * synchronous repaint instead of sustained jank. The toggle switch itself
 * (`.theme-toggle`) is excluded so its slide animation still plays.
 */
function paintThemeInstant(theme: Theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.add('theme-no-transitions')
  paintTheme(theme)
  // Force a synchronous layout so the final state is flushed while
  // transitions are still off, then re-enable on the next frame.
  void root.offsetHeight
  requestAnimationFrame(() => {
    root.classList.remove('theme-no-transitions')
  })
}

const ThemeContext = React.createContext<{
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(() => getInitialTheme())
  const themeRef = React.useRef(theme)
  themeRef.current = theme

  // Re-assert the painted theme on mount / state change (idempotent: when
  // classes already match, no transition is triggered). The actual animated
  // switch happens synchronously in `commit` below, before paint.
  React.useEffect(() => {
    if (typeof document === 'undefined') return
    paintTheme(theme)
  }, [theme])

  // Flip the DOM classes synchronously in the event handler (before paint)
  // with transitions suppressed, then sync React state for the toggle UI.
  const commit = React.useCallback((next: Theme) => {
    paintThemeInstant(next)
    themeRef.current = next
    setThemeState(next)
  }, [])

  // Keep multiple tabs in sync.
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        paintThemeInstant(e.newValue)
        themeRef.current = e.newValue
        setThemeState(e.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setTheme = React.useCallback(
    (next: Theme) => {
      commit(next)
    },
    [commit],
  )

  const toggleTheme = React.useCallback(() => {
    commit(themeRef.current === 'dark' ? 'light' : 'dark')
  }, [commit])

  const value = React.useMemo(() => ({ theme, toggleTheme, setTheme }), [theme, toggleTheme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return React.useContext(ThemeContext)
}
