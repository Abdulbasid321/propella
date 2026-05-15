import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toast'
import { HtmlLang } from '@/components/common/html-lang'
import { locales } from '@/lib/i18n/locales'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Propella — Exam preparation for serious candidates',
  description: 'Build a personalized study path for JAMB, WAEC, and NECO. Structured repetition. Real syllabus.',
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!(locales as readonly string[]).includes(locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <>
      <HtmlLang locale={locale} />
      <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </NextIntlClientProvider>
      </ThemeProvider>
    </>
  )
}
