import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { DashboardData } from '@propella/shared'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<{ data: DashboardData }>('/dashboard').then(r => r.data),
  })
}
