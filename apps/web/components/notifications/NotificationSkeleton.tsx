import { Skeleton } from '@/components/ui/skeleton'

function SkeletonRow() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        minHeight: 72,
        padding: '12px 16px',
        borderBottom: '1px solid var(--color-rule)',
      }}
    >
      <Skeleton style={{ width: 36, height: 36, borderRadius: 6, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 2 }}>
        <Skeleton style={{ width: '60%', height: 14 }} />
        <Skeleton style={{ width: '85%', height: 12 }} />
        <Skeleton style={{ width: 48, height: 11 }} />
      </div>
    </div>
  )
}

export function NotificationSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </>
  )
}
