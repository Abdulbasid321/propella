import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-paper)',
        padding: '32px 24px',
        textAlign: 'center',
      }}
    >

      
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-ink-3)',
          marginBottom: 16,
        }}
      >
        404
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 500,
          color: 'var(--color-ink)',
          lineHeight: 1.1,
          marginBottom: 12,
        }}
      >
        We couldn&apos;t find that page.
      </h1>
      <p
        style={{
          fontSize: 15,
          color: 'var(--color-ink-2)',
          lineHeight: 1.6,
          marginBottom: 32,
          maxWidth: 380,
        }}
      >
        The link may have moved or the address may have been typed incorrectly.
      </p>
      <Button variant="default" asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </main>
  )
}
