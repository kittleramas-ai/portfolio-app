import { createFileRoute, redirect } from '@tanstack/react-router'

import { isAuthenticatedFn } from '../../../admin/server/guards.ts'
import { AdminLogin } from '../../../admin/components/AdminLogin.tsx'

export const Route = createFileRoute('/admin/login')({
  /** Already signed in? Skip the form. Server-side, same as the admin gate. */
  beforeLoad: async () => {
    const { authenticated } = await isAuthenticatedFn()
    if (authenticated) throw redirect({ to: '/admin' })
  },
  component: AdminLogin,
})