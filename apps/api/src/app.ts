import express, { type Express } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import mongoSanitize from 'express-mongo-sanitize'
import cookieParser from 'cookie-parser'
import 'express-async-errors'
import { env } from './config/env'
import { errorHandler } from './middleware/error-handler'
import { authenticate } from './middleware/auth'
import authRoutes from './features/auth/auth.routes'
import subjectsRouter from './features/subjects/subjects.routes'
import onboardingRouter from './features/onboarding/onboarding.routes'
import dashboardRouter from './features/dashboard/dashboard.routes'
import roadmapRouter from './features/roadmap/roadmap.routes'
import sessionsRouter from './features/sessions/sessions.routes'
import gamificationRouter from './features/gamification/gamification.routes'
import usersRouter from './features/users/users.routes'
import progressRouter from './features/progress/progress.routes'
import quizzesRouter from './features/quizzes/quizzes.routes'
import marathonRouter from './features/marathon/marathon.routes'
import assistantRouter from './features/assistant/assistant.routes'
import mocksRouter from './features/mocks/mocks.routes'
import leaderboardRouter from './features/leaderboard/leaderboard.routes'
import notificationsRouter from './features/notifications/notifications.routes'

const app: Express = express()

// Security middleware
app.use(helmet())
// app.use(
//   cors({
//     origin: env.FRONTEND_URL,
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   }),
// )

// Allow multiple origins (dev + production)
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:3000',
  'http://192.168.0.2:3000',
  'https://propella-web-rvy6.vercel.app',
  'https://propella-web-rvy6-ep3fhci7g-abdulbasid-s-projects.vercel.app',
]
app.use(
  cors({
    origin: function(origin, callback) {
      // allow requests with no origin (like mobile apps, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

// Body parsing
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// Sanitization — strips $ and . from user input to prevent NoSQL injection
app.use(mongoSanitize())

// Health check (before auth)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() })
})

// Feature routes
app.use('/api/auth', authRoutes)
app.use('/api/subjects', subjectsRouter)
app.use('/api/onboarding', authenticate, onboardingRouter)
app.use('/api/dashboard', authenticate, dashboardRouter)
app.use('/api/roadmap', authenticate, roadmapRouter)
app.use('/api/sessions', authenticate, sessionsRouter)
app.use('/api/gamification', authenticate, gamificationRouter)
app.use('/api/users', authenticate, usersRouter)
app.use('/api/progress', authenticate, progressRouter)

app.use('/api/quizzes', authenticate, quizzesRouter)
app.use('/api/marathon', authenticate, marathonRouter)
app.use('/api/assistant', authenticate, assistantRouter)
app.use('/api/mocks', authenticate, mocksRouter)
app.use('/api/leaderboard', authenticate, leaderboardRouter)
app.use('/api/notifications', authenticate, notificationsRouter)

// Global error handler — must be last
app.use(errorHandler)

export default app
