'use client'
import { Flame, Bell, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth-store'

interface TopBarProps {
  title?: string
}

export function TopBar({ title }: TopBarProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const user = useAuthStore((s) => s.user)

  function toggleTheme() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header
      style={{
        height: 56,
        backgroundColor: 'var(--color-paper)',
        borderBottom: '1px solid var(--color-rule)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 32,
        paddingRight: 24,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Left: page title */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 500,
          color: 'var(--color-ink)',
          lineHeight: 1.2,
          margin: 0,
        }}
      >
        {title ?? ''}
      </h1>

      {/* Right: streak, xp, bell, theme */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Streak */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Flame size={16} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              fontWeight: 500,
              color: 'var(--color-ink)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            —
          </span>
        </div>

        {/* XP */}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-ink-3)',
            letterSpacing: '0.04em',
          }}
        >
          {user ? '— XP' : '— XP'}
        </span>

        {/* Notification bell */}
        <Button variant="ghost" size="sm" className="p-1.5 h-auto" aria-label="Notifications">
          <Bell size={17} strokeWidth={1.5} />
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="p-1.5 h-auto"
          aria-label="Toggle theme"
          onClick={toggleTheme}
        >
          {resolvedTheme === 'dark' ? <Sun size={17} strokeWidth={1.5} /> : <Moon size={17} strokeWidth={1.5} />}
        </Button>
      </div>
    </header>
  )
}
