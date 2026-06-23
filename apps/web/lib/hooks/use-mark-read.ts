'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Notification } from './use-notifications'

interface NotificationsData {
  items: Notification[]
  nextCursor: string | null
  unreadCount: number
}

interface NotificationsResponse {
  data: NotificationsData
}

export function useMarkRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })

      const prev = queryClient.getQueryData<NotificationsResponse>(['notifications', 'list'])

      queryClient.setQueryData<NotificationsResponse>(['notifications', 'list'], (old) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.map((n) =>
              n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
            ),
            unreadCount: Math.max(0, old.data.unreadCount - 1),
          },
        }
      })

      queryClient.setQueryData(['notifications', 'unread-count'], (old: { data: { count: number } } | undefined) => {
        if (!old) return old
        return { data: { count: Math.max(0, old.data.count - 1) } }
      })

      return { prev }
    },
    onError: (_err, _id, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['notifications', 'list'], context.prev)
      }
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
