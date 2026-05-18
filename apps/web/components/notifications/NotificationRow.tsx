import {
  Bell,
  RefreshCcw,
  Flame,
  Trophy,
  FileText,
  ClipboardCheck,
  Compass,
  Award,
  TrendingUp,
  Info,
  CreditCard,
} from 'lucide-react'
import { formatDistanceToNow, parseISO, isYesterday, format } from 'date-fns'
import type { Notification } from '@/lib/hooks/use-notifications'

const TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string }
> = {
  study_reminder:  { icon: Bell,           color: 'var(--color-ink-2)' },
  revision_due:    { icon: RefreshCcw,     color: 'var(--color-accent)' },
  streak_warning:  { icon: Flame,          color: 'var(--color-warning)' },
  streak_milestone:{ icon: Trophy,         color: 'var(--color-accent)' },
  mock_available:  { icon: FileText,       color: 'var(--color-ink-2)' },
  quiz_result:     { icon: ClipboardCheck, color: 'var(--color-success)' },
  topic_unlocked:  { icon: Compass,        color: 'var(--color-accent)' },
  rank_up:         { icon: Trophy,         color: 'var(--color-accent)' },
  badge_earned:    { icon: Award,          color: 'var(--color-accent)' },
  weekly_review:   { icon: TrendingUp,     color: 'var(--color-ink-2)' },
  system:          { icon: Info,           color: 'var(--color-ink-2)' },
  plan_change:     { icon: CreditCard,     color: 'var(--color-ink-2)' },
}

function formatTimestamp(iso: string): string {
  const date = parseISO(iso)
  if (isYesterday(date)) return 'Yesterday'
  const diffMs = Date.now() - date.getTime()
  if (diffMs < 24 * 60 * 60 * 1000) {
    return formatDistanceToNow(date, { addSuffix: true })
  }
  return format(date, 'EEE d MMM')
}

interface NotificationRowProps {
  notification: Notification
  onClick: (notification: Notification) => void
}

export function NotificationRow({ notification, onClick }: NotificationRowProps) {
  const isUnread = !notification.readAt
  const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.system!
  const Icon = config.icon

  return (
    <button
      onClick={() => onClick(notification)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        minHeight: 72,
        width: '100%',
        padding: '12px 16px',
        background: isUnread
          ? 'color-mix(in srgb, var(--color-accent-tint) 50%, transparent)'
          : 'transparent',
        borderLeft: isUnread ? '2px solid var(--color-accent)' : '2px solid transparent',
        borderBottom: '1px solid var(--color-rule)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 120ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-paper-2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isUnread
          ? 'color-mix(in srgb, var(--color-accent-tint) 50%, transparent)'
          : 'transparent'
      }}
    >
      {/* Icon block */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 6,
          background: 'var(--color-paper-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} strokeWidth={1.5} style={{ color: config.color }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--color-ink)',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {notification.title}
        </p>
        <p
          style={{
            fontSize: 13,
            color: 'var(--color-ink-2)',
            margin: 0,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {notification.body}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-ink-3)',
            margin: 0,
            marginTop: 2,
          }}
        >
          {formatTimestamp(notification.createdAt)}
        </p>
      </div>

      {/* Unread dot */}
      {isUnread && (
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--color-accent)',
            flexShrink: 0,
            alignSelf: 'center',
            marginLeft: 4,
          }}
        />
      )}
    </button>
  )
}
