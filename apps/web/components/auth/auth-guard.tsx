'use client'

import { useEffect } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Skeleton } from '@/components/ui/skeleton'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }
    if (user && !user.onboardingCompleted) {
      router.replace('/onboarding')
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }

  return <>{children}</>
}
