import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import { resolveAdmin } from './session.ts'

/**
 * Route guards.
 *
 * These live here rather than inline in the route files because
 * `@tanstack/react-start/server` is denied to the client bundle by TanStack's
 * `import-protection` plugin — a route file is imported in both environments,
 * so a top-level `getRequest()` import used from `beforeLoad` fails the build.
 *
 * Wrapping them in `createServerFn` keeps request handling on the server while
 * letting the route file reference a plain client-safe symbol.
 *
 * `getRequest()` must be called INSIDE the handler — the handler context in this
 * version does not expose `request` as a destructurable property.
 */

/**
 * `getRequest()` throws when there is no ambient request (client-side
 * navigation). Returns null there, which the guard treats as unauthenticated:
 * correct, since no session cookie would have been sent anyway.
 */
function safeGetRequest(): Request | null {
  try {
    return getRequest()
  } catch {
    return null
  }
}

export const requireAdminGuardFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = safeGetRequest()
    const session = request ? await resolveAdmin(request) : null
    return { authenticated: Boolean(session), email: session?.email ?? null }
  },
)

export const isAuthenticatedFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = safeGetRequest()
    const session = request ? await resolveAdmin(request) : null
    return { authenticated: Boolean(session) }
  },
)