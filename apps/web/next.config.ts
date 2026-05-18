import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import pkg from './package.json'

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts')

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
}

export default withNextIntl(nextConfig)
