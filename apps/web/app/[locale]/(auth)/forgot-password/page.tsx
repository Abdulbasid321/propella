'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@/lib/i18n/navigation'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ForgotPasswordSchema, type ForgotPasswordInput } from '@propella/shared'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setServerError(null)
    try {
      await api.post('/auth/forgot-password', { email: data.email })
      setSubmitted(true)
    } catch {
      // Show generic success message regardless to prevent email enumeration
      setSubmitted(true)
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
            Reset your password
          </h1>
          <p className="text-[13px] text-[var(--color-ink-2)]">
            Enter your email and we&apos;ll send you a link.
          </p>
        </div>

        {submitted ? (
          <div>
            <div className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-[var(--radius-md)] px-4 py-4">
              <p className="text-[14px] text-[var(--color-ink)] leading-[1.5]">
                {t('resetLinkSent')}
              </p>
            </div>
            <p className="mt-6 text-center text-[13px] text-[var(--color-ink-2)]">
              <Link
                href="/login"
                className="text-[var(--color-accent)] hover:underline underline-offset-[3px] decoration-[1px]"
              >
                Back to sign in
              </Link>
            </p>
          </div>
        ) : (
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
              {isSubmitting ? `${t('sendResetLink')}...` : t('sendResetLink')}
            </Button>

            <p className="text-center text-[13px] text-[var(--color-ink-2)]">
              <Link
                href="/login"
                className="text-[var(--color-accent)] hover:underline underline-offset-[3px] decoration-[1px]"
              >
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
