import { StickyNav } from '@/components/marketing/sticky-nav'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StickyNav />
      <main className="pt-16">{children}</main>
    </>
  )
}
