import { cn } from '@/lib/utils/cn'

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'block text-[11px] font-mono font-medium tracking-[0.08em] uppercase text-[var(--color-ink-2)] mb-2',
        className,
      )}
      {...props}
    />
  )
}
