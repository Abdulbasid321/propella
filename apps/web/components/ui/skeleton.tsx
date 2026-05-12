import { cn } from '@/lib/utils/cn'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-[var(--color-paper-3)] rounded-[var(--radius-sm)] animate-pulse', className)}
      {...props}
    />
  )
}
