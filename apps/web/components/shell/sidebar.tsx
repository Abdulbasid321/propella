'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Compass, Calendar, ClipboardCheck, FileText,
  Timer, Sparkles, TrendingUp, Trophy, Settings, LogOut,
} from 'lucide-react'
import { Logo } from '@/components/common/logo'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/stores/auth-store'
import { api } from '@/lib/api-client'
import { cn } from '@/lib/utils/cn'
import { useState, useRef, useEffect } from 'react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/roadmap', icon: Compass, label: 'Roadmap' },
  { href: '/planner', icon: Calendar, label: 'Planner' },
  { href: '/quizzes', icon: ClipboardCheck, label: 'Quizzes' },
  { href: '/mocks', icon: FileText, label: 'Mocks' },
  { href: '/marathon', icon: Timer, label: 'Marathon' },
  { href: '/assistant', icon: Sparkles, label: 'AI Assistant' },
  { href: '/progress', icon: TrendingUp, label: 'Progress' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  async function handleSignOut() {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore
    }
    logout()
    router.push('/login')
  }

  const initial = user?.name?.charAt(0).toUpperCase() ?? 'U'

  return (
    <aside
      className="hidden md:flex flex-col"
      style={{
        width: 260,
        minWidth: 260,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--color-paper-2)',
        borderRight: '1px solid var(--color-rule)',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-rule)' }}>
        <Logo href="/dashboard" />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-6 py-2.5 text-[14px] font-medium transition-colors duration-100 no-underline',
                'relative',
                isActive
                  ? 'text-[var(--color-ink)]'
                  : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]',
              )}
            >
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '4px',
                    bottom: '4px',
                    width: 2,
                    borderRadius: 2,
                    backgroundColor: 'var(--color-accent)',
                  }}
                />
              )}
              <Icon size={18} strokeWidth={1.5} />
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User card */}
      <div
        style={{ borderTop: '1px solid var(--color-rule)', padding: '12px 16px', position: 'relative' }}
        ref={menuRef}
      >
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-3 w-full rounded-[var(--radius-md)] p-2 hover:bg-[var(--color-paper-3)] transition-colors"
        >
          {/* Avatar */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: 'var(--color-paper-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 13,
              color: 'var(--color-ink)',
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div className="flex flex-col items-start min-w-0 flex-1">
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 13,
                color: 'var(--color-ink)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}
            >
              {user?.name ?? 'User'}
            </span>
            <Badge variant="default" className="mt-0.5" style={{ fontSize: 10 }}>
              {user?.plan ?? 'free'}
            </Badge>
          </div>
        </button>

        {/* Dropdown menu */}
        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 16,
              right: 16,
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-rule)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              padding: '4px 0',
              marginBottom: 4,
            }}
          >
            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] no-underline transition-colors"
            >
              <Settings size={14} strokeWidth={1.5} />
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-danger)] hover:bg-[var(--color-paper-2)] transition-colors w-full text-left"
            >
              <LogOut size={14} strokeWidth={1.5} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
