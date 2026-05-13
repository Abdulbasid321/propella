'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Logo } from '@/components/common/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const glassBg =
    resolvedTheme === 'dark' ? 'rgba(20,19,15,0.85)' : 'rgba(251,249,244,0.78)'

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-[var(--color-rule)]' : '',
      )}
      style={
        scrolled
          ? {
              backdropFilter: 'blur(12px) saturate(120%)',
              backgroundColor: glassBg,
            }
          : undefined
      }
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#how-it-works"
            className="text-[14px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors"
          >
            How it works
          </Link>
          <Link
            href="#pricing"
            className="text-[14px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-[14px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors"
          >
            Sign in
          </Link>
          <Button size="sm" variant="accent" asChild>
            <Link href="/signup">Start studying</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
