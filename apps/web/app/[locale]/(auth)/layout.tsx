import { Logo } from '@/components/common/logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-paper-2)] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 flex justify-center">
          <Logo className="text-[22px]" />
        </div>
        {children}
      </div>
    </div>
  )
}
