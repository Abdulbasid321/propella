'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Subject } from '@propella/shared'

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: () =>
      api.get<{ data: Subject[] }>('/subjects').then((r) => r.data),
  })
}
