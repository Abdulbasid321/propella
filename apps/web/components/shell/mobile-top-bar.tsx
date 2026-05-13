'use client'
import { Flame, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/common/logo'
import { useStreakXP } from '@/lib/hooks/use-streak-xp'
import { NumberCounter } from '@/components/common/number-counter'

export function MobileTopBar() {
  const { streak } = useStreakXP()

  return (
    <header
      className="md:hidden flex items-center justify-between"
      style={{
        height: 48,
        backgroundColor: 'var(--color-paper)',
        borderBottom: '1px solid var(--color-rule)',
        paddingLeft: 20,
        paddingRight: 12,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Logo href="/dashboard" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingRight: 4 }}>
          <Flame size={15} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
          <NumberCounter
            value={streak}
            className="text-[16px] font-medium text-[var(--color-ink)]"
          />
        </div>
        <Button variant="ghost" size="sm" className="p-1.5 h-auto" aria-label="Notifications">
          <Bell size={17} strokeWidth={1.5} />
        </Button>
      </div>
    </header>
  )
}
