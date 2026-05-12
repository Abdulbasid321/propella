'use client'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Sidebar } from '@/components/shell/sidebar'
import { TopBar } from '@/components/shell/top-bar'
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
          <TopBar />
          <main
            style={{
              flex: 1,
              backgroundColor: 'var(--color-paper)',
              padding: '32px',
            }}
            className="pb-20 md:pb-8"
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
