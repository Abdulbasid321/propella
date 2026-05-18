import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils/cn'

interface LogoProps {
  className?: string
  href?: string
}

export function Logo({ className, href = '/' }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn('font-display font-medium text-[var(--color-ink)] tracking-tight no-underline', className)}
      style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
    >
      Propella
    </Link>
  )
}
