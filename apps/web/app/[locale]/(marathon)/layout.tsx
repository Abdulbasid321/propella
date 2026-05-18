import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marathon — Propella',
}

export default function MarathonLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--color-paper)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 50,
      }}
    >
      {children}
    </div>
  )
}
