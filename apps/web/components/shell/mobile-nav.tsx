'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Compass, ClipboardCheck, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const tabItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/roadmap', icon: Compass, label: 'Roadmap' },
  null, // center CTA placeholder
  { href: '/quizzes', icon: ClipboardCheck, label: 'Quizzes' },
  { href: '/settings', icon: User, label: 'Profile' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        height: 64,
        backgroundColor: 'var(--color-paper)',
        borderTop: '1px solid var(--color-rule)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabItems.map((item, idx) => {
        if (!item) {
          // Center "Study" CTA button
          return (
            <div key="cta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Link
                href="/study/new"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  boxShadow: '0 4px 12px rgba(178,58,46,0.35)',
                  flexShrink: 0,
                }}
                aria-label="Study"
              >
                <Compass size={24} strokeWidth={1.5} color="white" />
              </Link>
            </div>
          )
        }

        const { href, icon: Icon, label } = item
        const isActive = pathname === href || pathname.startsWith(href + '/')

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-1 no-underline transition-colors',
              isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-3)]',
            )}
          >
            <Icon size={22} strokeWidth={1.5} />
            <span style={{ fontSize: 10, fontWeight: 500, fontFamily: 'var(--font-sans)' }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
