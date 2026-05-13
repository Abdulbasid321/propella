'use client'
import { Flame, Bell, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useStreakXP } from '@/lib/hooks/use-streak-xp'
import { NumberCounter } from '@/components/common/number-counter'

interface TopBarProps {
  title?: string
}

export function TopBar({ title }: TopBarProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const user = useAuthStore((s) => s.user)
  const { streak, xp } = useStreakXP()

  function toggleTheme() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header
      className="hidden md:flex items-center justify-between"
      style={{
        height: 56,
        backgroundColor: 'var(--color-paper)',
        borderBottom: '1px solid var(--color-rule)',
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
          <NumberCounter
            value={streak}
            className="text-[18px] font-medium text-[var(--color-ink)]"
          />
        </div>

        {/* XP */}
        <NumberCounter
          value={xp}
          suffix=" XP"
          className="font-mono text-[11px] text-[var(--color-ink-3)] tracking-[0.04em]"
        />

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
