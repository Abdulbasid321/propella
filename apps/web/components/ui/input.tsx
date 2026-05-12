import { cn } from '@/lib/utils/cn'
import { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-[var(--radius-sm)]',
        'px-3.5 py-2.5 text-[15px] font-sans text-[var(--color-ink)] placeholder:text-[var(--color-ink-3)]',
        'outline-none transition-all duration-150',
        'focus:border-[var(--color-ink)] focus:ring-[3px] focus:ring-[var(--color-paper-3)]',
        error && 'border-[var(--color-danger)]',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
