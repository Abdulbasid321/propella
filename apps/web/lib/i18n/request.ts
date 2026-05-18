import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale, type Locale } from './locales'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !(locales as readonly string[]).includes(locale)) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default as Record<string, unknown>,
  }
})
