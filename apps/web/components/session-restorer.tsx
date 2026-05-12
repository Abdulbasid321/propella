'use client'

import { useRestoreSession } from '@/lib/hooks/use-restore-session'

export function SessionRestorer() {
  useRestoreSession()
  return null
}
