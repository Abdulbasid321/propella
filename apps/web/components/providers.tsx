'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { SessionRestorer } from '@/components/session-restorer'

export function Providers({ children }: { children: React.ReactNode }) {
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    const handler = () => logout()
    window.addEventListener('propella:logout', handler)
    return () => window.removeEventListener('propella:logout', handler)
  }, [logout])

  return (
    <QueryClientProvider client={queryClient}>
      <SessionRestorer />
      {children}
    </QueryClientProvider>
  )
}
