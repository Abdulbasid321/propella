import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium tracking-wide uppercase',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-paper-3)] text-[var(--color-ink-2)]',
        accent: 'bg-[var(--color-accent-tint)] text-[var(--color-accent)]',
        success: 'bg-[#E8F5EC] text-[var(--color-success)]',
        warning: 'bg-[#FDF3E3] text-[var(--color-warning)]',
        danger: 'bg-[#FDE8E8] text-[var(--color-danger)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
