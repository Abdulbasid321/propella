# Propella

**Exam preparation for serious candidates.**

Propella is a full-stack AI-powered study platform built for Nigerian students sitting JAMB, WAEC, and NECO. It generates a personalized, topic-by-topic roadmap from the official syllabus, enforces spaced repetition automatically, and uses AI to produce quizzes, mock exams, and on-demand explanations — all inside a single focused product.

---

## Stack

**Frontend**

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-433E38?style=for-the-badge&logo=react&logoColor=white)

**Backend**

![Express](https://img.shields.io/badge/Express_4-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

**AI**

![Anthropic](https://img.shields.io/badge/Claude_API-000000?style=for-the-badge&logo=anthropic&logoColor=white)

**Tooling & Deployment**

![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

---

## Project structure

```
propella/
├── apps/
│   ├── web/                  Next.js 16 frontend
│   └── api/                  Express 4 backend
├── packages/
│   ├── shared/               Zod schemas, TypeScript types, XP constants
│   └── config/               Shared tsconfig, ESLint, Prettier
├── pnpm-workspace.yaml
└── README.md
```

---

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 10+
- MongoDB — local install or a free [MongoDB Atlas](https://cloud.mongodb.com) cluster

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

Fill in `apps/api/.env`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Long random string — `openssl rand -hex 64` |
| `JWT_REFRESH_SECRET` | Long random string — `openssl rand -hex 64` |
| `ANTHROPIC_API_KEY` | From [console.anthropic.com](https://console.anthropic.com) — required for quizzes and AI chat |
| `FRONTEND_URL` | `http://localhost:3000` in development |

### 3. Seed the syllabus

Loads all 11 subjects and their topics (JAMB, WAEC, NECO) into MongoDB.

```bash
pnpm --filter @propella/api seed
```

### 4. Start development servers

```bash
pnpm dev
```

| Server | URL |
|---|---|
| Web app | http://localhost:3000 |
| API | http://localhost:5000 |
| Health check | http://localhost:5000/health |

---

## Features

**Adaptive roadmap** — generates a topic-by-topic study plan from the official syllabus, weighted by the student's self-assessed strengths and weaknesses. The plan recomputes after every quiz attempt and study session using the SM-2 spaced repetition algorithm.

**AI quiz generation** — quizzes are generated on demand by Claude (`claude-sonnet-4-5`), calibrated to the exact JAMB/WAEC/NECO syllabus. Questions include full explanations. Recently-seen stems are excluded to prevent repetition.

**Mock exams** — full-length timed practice papers structured like the actual exam (40 questions/subject for JAMB, 60 total for WAEC/NECO), with a per-topic breakdown on results.

**AI assistant** — streaming chat powered by Claude Haiku. Contextualized to the student's current syllabus. Explains concepts, provides worked examples, and suggests practice questions.

**Marathon mode** — long focused study runs with a configurable Pomodoro cycle, SVG progress ring, and 2× XP multiplier. Runs as a full-screen distraction-free layout.

**Gamification** — XP ledger (append-only), streak tracking with freeze logic, seven rank tiers (Novice → Distinction, modeled on the Nigerian university classification system), weekly/monthly/all-time leaderboard.

**Reminder scheduler** — node-cron jobs fire streak-warning reminders for at-risk users and process due notifications every 5 minutes.

---

## Architecture notes

- **Monorepo** — shared Zod schemas live in `packages/shared` and are imported by both `apps/web` and `apps/api`. Types are never duplicated.
- **Auth** — JWT access tokens (15 min) + refresh tokens (30 days) stored in httpOnly cookies. Automatic token rotation on refresh.
- **XP** — stored as an append-only ledger in `XPEvent`. Total XP is always computed by aggregation; no denormalized total that can drift.
- **Roadmap** — one document per user. Nodes carry SM-2 state (`easeFactor`, `interval`, `repetitions`) updated after every quiz. Mastery formula: `mastery_new = mastery_old × 0.7 + quiz_correctness × 30`, clamped to [0, 100].
- **AI calls** — always routed through the Express backend. The Anthropic API key is never exposed to the browser.
- **Mobile navigation** — a Tools sheet (Framer Motion slide-up with drag-to-dismiss) houses the secondary nav items on mobile, keeping the bottom tab bar to five focused slots.

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start all dev servers in parallel |
| `pnpm build` | Build all packages and apps |
| `pnpm type-check` | Run TypeScript across the monorepo |
| `pnpm --filter @propella/api seed` | Seed syllabus data |
| `pnpm --filter @propella/web build` | Production build for the web app |

---

## License

Private. All rights reserved.
