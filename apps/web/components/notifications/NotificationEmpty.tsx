'use client'
import { BellOff } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function NotificationEmpty() {
  const t = useTranslations('notifications')
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 64,
        paddingBottom: 64,
        gap: 12,
      }}
    >
      <BellOff size={32} style={{ color: 'var(--color-ink-3)' }} strokeWidth={1.5} />
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 500,
          color: 'var(--color-ink)',
          margin: 0,
        }}
      >
        {t('empty')}
      </p>
      <p
        style={{
          fontSize: 13,
          color: 'var(--color-ink-3)',
          margin: 0,
          maxWidth: 240,
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        {t('emptyBody')}
      </p>
    </div>
  )
}
