'use client'
import { useState, useCallback, useRef } from 'react'
import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useUnreadCount } from '@/lib/hooks/use-unread-count'
import { NotificationPanel } from './NotificationPanel'
import { NotificationSheet } from './NotificationSheet'

export function NotificationBell() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)
  const { data: count = 0 } = useUnreadCount()

  const handleClick = useCallback(() => {
    // Detect mobile via window width
    if (window.innerWidth < 768) {
      setSheetOpen(true)
    } else {
      setPanelOpen((prev) => !prev)
    }
  }, [])

  const closePanel = useCallback(() => setPanelOpen(false), [])
  const closeSheet = useCallback(() => setSheetOpen(false), [])

  return (
    <div ref={bellRef} style={{ position: 'relative' }}>
      <Button
        variant="ghost"
        size="sm"
        className="p-1.5 h-auto"
        aria-label="Notifications"
        onClick={handleClick}
        style={{ position: 'relative' }}
      >
        <Bell size={17} strokeWidth={1.5} />

        {/* Unread badge */}
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 16,
                height: 16,
                borderRadius: 9999,
                background: 'var(--color-accent)',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingLeft: 3,
                paddingRight: 3,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                pointerEvents: 'none',
              }}
            >
              {count > 9 ? '9+' : count}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      {/* Desktop panel */}
      {panelOpen && <NotificationPanel onClose={closePanel} />}

      {/* Mobile sheet */}
      <NotificationSheet open={sheetOpen} onClose={closeSheet} />
    </div>
  )
}
