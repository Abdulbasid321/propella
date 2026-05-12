import { create } from 'zustand'

interface ActiveSession {
  sessionId: string
  topicSlug: string
  subjectSlug: string
  startedAt: number
}

interface SessionState {
  activeSession: ActiveSession | null
  setActiveSession: (s: ActiveSession | null) => void
}

export const useSessionStore = create<SessionState>()((set) => ({
  activeSession: null,
  setActiveSession: (s) => set({ activeSession: s }),
}))
