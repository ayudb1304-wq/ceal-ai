# Ceal AI

Ceal helps boutique creative agencies close projects with confidence. Turn SOWs into AI-generated handoff checklists, reduce “zombie project” delays, and get clients to certified sign-off with fewer missing-asset disputes.

**Built for:** Agencies closing $5k–$20k projects who want faster time-to-close and better trust at handoff.

## Features

- **SOW extraction** — Upload a scope of work; AI proposes deliverables and checklist items for your approval.
- **Onboarding** — Agency onboarding flow with Supabase-backed profiles.
- **Auth** — NextAuth with Google sign-in.
- **Dashboard** — Post-onboarding hub (expand with projects and checklists).

## Tech stack

- **Next.js** (App Router), **TypeScript**, **Tailwind CSS**, **shadcn/ui**
- **Supabase** — Database and auth integration
- **NextAuth.js** — Session and OAuth

## Getting started

### Prerequisites

- Node.js 18+
- Supabase project
- Google OAuth client (for sign-in)

### Setup

1. Clone and install:

   ```bash
   git clone https://github.com/ayudb1304-wq/ceal-ai.git
   cd ceal-ai
   npm install
   ```

2. Copy env and configure:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your `NEXTAUTH_*`, `NEXT_PUBLIC_SUPABASE_*`, and `SUPABASE_SERVICE_ROLE_*` values.

3. Run Supabase migrations (see `supabase/README.md`) against your project.

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `app/` — Next.js App Router (landing, auth, onboarding, dashboard)
- `src/components/` — UI (landing, onboarding, auth)
- `lib/` — AI (SOW extraction), Supabase client, server utilities
- `supabase/migrations/` — Schema and RLS

## License

Private / All rights reserved.
