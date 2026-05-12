import { z } from 'zod'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../../.env') })

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  ANTHROPIC_API_KEY: z.string().optional().default(''),
  RESEND_API_KEY: z.string().optional().default(''),
  FRONTEND_URL: z.string(),
  COOKIE_DOMAIN: z.string().optional(),
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  const missing = parsed.error.issues
    .map((issue) => issue.path.join('.'))
    .join(', ')
  throw new Error(`Missing required environment variables: ${missing}`)
}

export const env = parsed.data
