'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, LayoutGrid, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import { ToolsSheet } from './tools-sheet'

const TOOLS_ROUTES = [
  '/planner',
  '/quizzes',
  '/mocks',
  '/marathon',
  '/assistant',
  '/progress',
  '/leaderboard',
]

function isToolsRoute(pathname: string) {
  return TOOLS_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + '/'),
  )
}

export function MobileNav() {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)
  const t = useTranslations('nav')

  const toolsActive = isToolsRoute(pathname)

  return (
    <>
      <nav
        className="md:hidden flex items-center justify-around fixed bottom-0 left-0 right-0 z-40"
        style={{
          height: 64,
          backgroundColor: 'var(--color-paper)',
          borderTop: '1px solid var(--color-rule)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Home */}
        <NavTab href="/dashboard" icon={Home} label={t('dashboard')} pathname={pathname} />

        {/* Roadmap */}
        <NavTab href="/roadmap" icon={Compass} label={t('roadmap')} pathname={pathname} />

        {/* Study CTA — raised circle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

        {/* Tools */}
        <button
          onClick={() => setSheetOpen(true)}
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-1 transition-colors bg-transparent border-none cursor-pointer',
            toolsActive ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-3)]',
          )}
          aria-label="Tools"
        >
          <LayoutGrid size={22} strokeWidth={1.5} />
          <span style={{ fontSize: 10, fontWeight: 500, fontFamily: 'var(--font-sans)' }}>{t('tools')}</span>
        </button>

        {/* Profile */}
        <NavTab href="/settings" icon={User} label={t('profile')} pathname={pathname} />
      </nav>

      <ToolsSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  )
}

interface NavTabProps {
  href: string
  icon: React.ElementType
  label: string
  pathname: string
}

function NavTab({ href, icon: Icon, label, pathname }: NavTabProps) {
  const isActive = pathname === href || pathname.startsWith(href + '/')
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-1 px-3 py-1 no-underline transition-colors',
        isActive ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-3)]',
      )}
    >
      <Icon size={22} strokeWidth={1.5} />
      <span style={{ fontSize: 10, fontWeight: 500, fontFamily: 'var(--font-sans)' }}>{label}</span>
    </Link>
  )
}
