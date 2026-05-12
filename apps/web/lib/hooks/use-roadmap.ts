import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Roadmap } from '@propella/shared'

export function useRoadmap() {
  return useQuery({
    queryKey: ['roadmap'],
    queryFn: () => api.get<{ data: Roadmap }>('/roadmap').then(r => r.data),
  })
}
