'use client'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Sidebar } from '@/components/shell/sidebar'
import { TopBar } from '@/components/shell/top-bar'
import { MobileTopBar } from '@/components/shell/mobile-top-bar'
import { MobileNav } from '@/components/shell/mobile-nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: 'var(--color-paper)',
        }}
      >
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Desktop top bar — hidden on mobile */}
          <TopBar />
          {/* Mobile top bar — hidden on desktop */}
          <MobileTopBar />
          <main
            style={{
              flex: 1,
              backgroundColor: 'var(--color-paper)',
              paddingTop: '32px',
              paddingLeft: '32px',
              paddingRight: '32px',
            }}
            className="pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-8"
          >
            {children}
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav />
      </div>
    </AuthGuard>
  )
}
