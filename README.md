# Aurum Portal

A full-stack Next.js portal for Neo Bank and OrbitOne. It authenticates with Supabase Auth, uses a pasted tool token only for the single sync request that immediately follows, then discards it. The portal syncs encrypted Aurum data into the existing Supabase database and serves dashboard data from that database.

## Requirements

- Node.js 20.18+ (or newer supported by the selected Next.js release)
- An existing Supabase project with this repository's `migrations/` already applied

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and `SESSION_SECRET` in `.env.local`. `PROXY` is optional. Do not expose either secret through a `NEXT_PUBLIC_` variable.

## Commands

```bash
npm run dev      # local development
npm run build    # production build
npm start        # run the production build
```

## Structure

`app/` contains pages and API routes, `components/` holds reusable UI, `lib/db/` owns database access, `lib/auth/` owns sessions, `services/` orchestrates business logic, and each external source owns one folder under `scraping/`.

## Deployment

Deploy as a Next.js application. Add the environment values in the host dashboard. Neo Bank sync requests can take 3–5 minutes, so the `/api/token` and `/api/sync` handlers specify a 300-second maximum duration; use a host/plan that supports this duration.

See [ARCHITECTURE.md](ARCHITECTURE.md) and [MIGRATION.md](MIGRATION.md) for the design and detailed Flask mapping.
