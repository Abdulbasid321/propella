'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export interface Notification {
  id: string
  type: string
  title: string
  body: string
  deeplink: string | null
  metadata: Record<string, unknown>
  readAt: string | null
  createdAt: string
}

interface NotificationsResponse {
  data: {
    items: Notification[]
    nextCursor: string | null
    unreadCount: number
  }
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => api.get<NotificationsResponse>('/notifications?limit=20'),
    select: (res) => res.data,
    staleTime: 30_000,
  })
}
