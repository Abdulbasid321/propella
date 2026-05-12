'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { api } from '@/lib/api-client'
import { setAccessToken } from '@/lib/api-client'
import type { AuthUser } from '@propella/shared'

export function useRestoreSession() {
  const [loading, setLoading] = useState(true)
  const setUser = useAuthStore((s) => s.setUser)
  const setToken = useAuthStore((s) => s.setAccessToken)

  useEffect(() => {
    api
      .post<{ data: { accessToken: string; user?: AuthUser } }>('/auth/refresh')
      .then((res) => {
        setToken(res.data.accessToken)
        if (res.data.user) {
          setUser(res.data.user)
        } else {
          // Fetch the current user separately if refresh only returns a token
          api
            .get<{ data: AuthUser }>('/users/me')
            .then((meRes) => setUser(meRes.data))
            .catch(() => {
              // If /users/me fails, we still have the token — user will be
              // populated on next authenticated request
            })
        }
      })
      .catch(() => {
        // No active session — that's fine
        setAccessToken(null)
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { loading }
}
