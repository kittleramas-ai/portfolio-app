import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

const STORAGE_KEY = 'portfolio-theme'

function getThemeFromCookie(request: Request | undefined): 'light' | 'dark' {
  if (!request) return 'light'
  const cookie = request.headers.get('cookie') ?? ''
  const match = cookie.match(new RegExp(`(?:^|; )${STORAGE_KEY}=([^;]+)`))
  return (match?.[1] as 'light' | 'dark') ?? 'light'
}

export const getInitialThemeFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = getRequest()
    return getThemeFromCookie(request)
  }
)