'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

interface UnreadCountResponse {
  data: { count: number }
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.get<UnreadCountResponse>('/notifications/unread-count'),
    select: (res) => res.data.count,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })
}
