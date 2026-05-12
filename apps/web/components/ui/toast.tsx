'use client'
import { create } from 'zustand'
import { cn } from '@/lib/utils/cn'
import { X } from 'lucide-react'

type ToastVariant = 'default' | 'success' | 'warning' | 'danger'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastState {
  toasts: Toast[]
  add: (toast: Omit<Toast, 'id'>) => void
  remove: (id: string) => void
}

const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000)
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export function useToast() {
  const add = useToastStore((s) => s.add)
  return {
    toast: (toast: Omit<Toast, 'id'>) => add(toast),
  }
}

const borderColor: Record<ToastVariant, string> = {
  default: 'border-l-[var(--color-ink-2)]',
  success: 'border-l-[var(--color-success)]',
  warning: 'border-l-[var(--color-warning)]',
  danger: 'border-l-[var(--color-danger)]',
}

export function Toaster() {
  const { toasts, remove } = useToastStore()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-[360px] w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'bg-[var(--color-card)] border border-[var(--color-rule)] border-l-4 rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-md)] pointer-events-auto',
            'flex items-start gap-3',
            borderColor[toast.variant ?? 'default'],
          )}
        >
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-[var(--color-ink)]">{toast.title}</p>
            {toast.description && (
              <p className="text-[13px] text-[var(--color-ink-3)] mt-0.5">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => remove(toast.id)}
            className="text-[var(--color-ink-3)] hover:text-[var(--color-ink)] shrink-0"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      ))}
    </div>
  )
}
