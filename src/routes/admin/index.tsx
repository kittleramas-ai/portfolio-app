import { createFileRoute, redirect } from '@tanstack/react-router'

import { requireAdminGuardFn } from '../../../admin/server/guards.ts'
import { AdminShell } from '../../../admin/components/AdminShell.tsx'

export const Route = createFileRoute('/admin/')({
  /**
   * Server-side auth gate — the security boundary.
   *
   * Runs during SSR, so an unauthenticated visitor is redirected and never
   * receives the admin markup or its JS payload. bookade-src guards this from
   * a client-side useEffect instead, which means a logged-out visitor still
   * downloads the whole admin bundle before being bounced.
   *
   * During client-side navigation there is no ambient request, so the guard
   * reports unauthenticated and redirects — correct behaviour, since the cookie
   * would not have been sent anyway.
   */
  beforeLoad: async () => {
    const { authenticated } = await requireAdminGuardFn()
    if (!authenticated) throw redirect({ to: '/admin/login' })
  },
  component: AdminShell,
})