export const locales = ['en', 'yo', 'ha', 'ig'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const localeMetadata = {
  en: { label: 'English',  nativeLabel: 'English', flag: null },
  yo: { label: 'Yoruba',   nativeLabel: 'Yorùbá',  flag: null },
  ha: { label: 'Hausa',    nativeLabel: 'Hausa',   flag: null },
  ig: { label: 'Igbo',     nativeLabel: 'Igbo',    flag: null },
} as const
