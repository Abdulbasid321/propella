'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Notification } from './use-notifications'

interface NotificationsResponse {
  data: {
    items: Notification[]
    nextCursor: string | null
    unreadCount: number
  }
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })

      const prev = queryClient.getQueryData<NotificationsResponse>(['notifications', 'list'])

      queryClient.setQueryData<NotificationsResponse>(['notifications', 'list'], (old) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
            unreadCount: 0,
          },
        }
      })

      queryClient.setQueryData(['notifications', 'unread-count'], { data: { count: 0 } })

      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['notifications', 'list'], context.prev)
      }
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
