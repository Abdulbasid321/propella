import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { UserStreak, XPSummary } from '@propella/shared'

export function useStreakXP() {
  const streak = useQuery({
    queryKey: ['gamification', 'streak'],
    queryFn: () =>
      api.get<{ data: UserStreak }>('/gamification/streak').then((r) => r.data),
    staleTime: 60_000,
  })

  const xp = useQuery({
    queryKey: ['gamification', 'xp'],
    queryFn: () =>
      api.get<{ data: XPSummary }>('/gamification/xp').then((r) => r.data),
    staleTime: 60_000,
  })

  return {
    streak: streak.data?.currentStreak ?? 0,
    xp: xp.data?.totalXP ?? 0,
    loading: streak.isLoading || xp.isLoading,
  }
}
