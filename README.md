# Winz

Exam-prep web app for IB and IGCSE math — Phase 1 MVP.

**Stack:** Next.js App Router · TypeScript · Auth.js (credentials) · SQLite + Prisma · local `/uploads`

## Quick start

```bash
npm install
cp .env.example .env   # if needed
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (from seed)

| Role | Username / email | Password |
| --- | --- | --- |
| Admin | `ashwin` / `ashwin@winz.app` | `WinzAdmin2026!` |
| Student | `demostudent` / `demo@winz.app` | `StudentDemo1!` |

Login accepts **username or email**.

## Phase 1 features

- Marketing: `/`, `/testimonials`, `/contact`
- Auth: signup + login
- Dashboard → Practice or Test (individual)
- Admin: MCQ / enter-answer questions, images, taxonomy
- Profile: past attempt results

## Deferred (not in this PR)

Group rooms, leaderboards, streaks, parent accounts, competitive mechanics, solution-image reveal polish after assessment, contact email delivery.
