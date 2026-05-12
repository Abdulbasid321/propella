# Propella

AI-powered exam preparation for Nigerian students sitting JAMB, WAEC, and NECO.

## Getting started

### Prerequisites
- Node.js 20+
- pnpm 10+
- MongoDB (local or Atlas)

### Setup

```bash
# Install dependencies
pnpm install

# Copy and fill environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# Seed the syllabus data (requires DATABASE_URL set in apps/api/.env)
pnpm --filter @propella/api seed

# Start dev servers
pnpm dev
```

The web app runs on http://localhost:3000
The API runs on http://localhost:5000

### Project structure

```
propella/
├── apps/
│   ├── web/        Next.js 16, Tailwind v4, React 19
│   └── api/        Express 4, Mongoose 8, TypeScript
├── packages/
│   ├── shared/     Zod schemas and TypeScript types
│   └── config/     ESLint, tsconfig, Prettier base configs
```

### Build phases completed

- Phase 0: Monorepo setup, design system, all UI primitives
- Phase 1: Auth (signup/login/forgot password), onboarding wizard, syllabus seed
- Phase 2: Adaptive roadmap engine, dashboard, roadmap timeline, topic detail
- Phase 3: Study sessions, XP system, streak tracking, planner
- Phase 4: Quiz engine (AI-generated questions via Claude API), results page
- Phase 5: Marathon mode, leaderboard, badge system
- Phase 6: AI assistant (streaming), mock exams, progress analytics
- Phase 7: Reminder scheduler, landing page, pricing page
