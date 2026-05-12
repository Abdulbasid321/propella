import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  message: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ message, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center gap-3', className)}>
      <p className="text-[14px] text-[var(--color-ink-3)]">{message}</p>
      {action}
    </div>
  )
}
