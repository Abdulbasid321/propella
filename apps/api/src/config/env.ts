import { z } from 'zod'

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  ANTHROPIC_API_KEY: z.string(),
  RESEND_API_KEY: z.string(),
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
