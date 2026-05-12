import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@propella/shared'
import { setAccessToken } from '../api-client'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  setUser: (user: AuthUser | null) => void
  setAccessToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: user !== null }),
      setAccessToken: (token) => { setAccessToken(token) },
      logout: () => {
        setAccessToken(null)
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'propella-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
)
