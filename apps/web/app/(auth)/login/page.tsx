'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoginSchema, type LoginInput } from '@propella/shared'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/stores/auth-store'
import type { AuthUser } from '@propella/shared'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const setToken = useAuthStore((s) => s.setAccessToken)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setServerError(null)
    try {
      const res = await api.post<{ data: { user: AuthUser; accessToken: string } }>('/auth/login', {
        email: data.email,
        password: data.password,
      })
      setToken(res.data.accessToken)
      setUser(res.data.user)
      router.push('/dashboard')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <Card variant="elevated">
      <CardContent className="p-8">
        <div className="mb-6">
          <h1
            className="text-[22px] font-semibold text-[var(--color-ink)] leading-[1.3] mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Sign in
          </h1>
          <p className="text-[13px] text-[var(--color-ink-2)]">Welcome back.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1.5 text-[13px] text-[var(--color-danger)]">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="password" className="mb-0">Password</Label>
              <Link
                href="/forgot-password"
                className="text-[13px] text-[var(--color-ink-3)] hover:text-[var(--color-ink)] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1.5 text-[13px] text-[var(--color-danger)]">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-[13px] text-[var(--color-danger)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-[var(--radius-sm)] px-3 py-2">
              {serverError}
            </p>
          )}

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--color-rule)]" />
          <span className="text-[12px] text-[var(--color-ink-3)]">or</span>
          <div className="flex-1 h-px bg-[var(--color-rule)]" />
        </div>

        <div>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full opacity-50 cursor-not-allowed"
            disabled
          >
            Sign in with Google
          </Button>
          <p className="mt-2 text-center text-[12px] text-[var(--color-ink-3)]">
            Google sign-in coming soon
          </p>
        </div>

        <p className="mt-6 text-center text-[13px] text-[var(--color-ink-2)]">
          New to Propella?{' '}
          <Link
            href="/signup"
            className="text-[var(--color-accent)] hover:underline underline-offset-[3px] decoration-[1px]"
          >
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
