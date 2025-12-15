# Clean Slate Handoff (Next.js 15 Minimal Base)

## Current State
- **Branch**: `clean-slate`
- **Runtime**: Node 20.18.1 (mise), pnpm 10.23.0 (`.nvmrc` + `package.json` engines)
- **App**: Minimal Next.js 15 App Router with a simple landing (`app/page.tsx`), no dashboard/APIs/features wired.
- **Styling**: Plain CSS (`app/globals.css`, `app/page.module.css`), no Tailwind/PostCSS.
- **DB/Prisma**: Schema retained in `prisma/schema.prisma` (hostel + auth models). No code uses it yet. `prisma/migrations` and `seed.ts` kept.
- **Deps**: Minimal: `next@15.0.3`, `react@18.3.1`, `react-dom@18.3.1`, `prisma/@prisma/client@5.22.0`, lint/TS basics only.
- **Removed**: Legacy components/pages/hooks/lib/models, Tailwind/PostCSS configs, Husky prepare hook, heavy UI/auth deps.

## Commands (run with mise for correct Node)
- Install: `mise install` (once), then `pnpm install`
- Dev: `pnpm dev` (Next.js 15, port 3000)
- Lint: `pnpm lint`
- Types: `pnpm type-check`
- Build: `pnpm build`
- Prisma validate (needs DATABASE_URL): `DATABASE_URL="postgresql://user:pass@host:5432/db" pnpm exec prisma validate`

## Env
- Minimal needed for now: none for dev shell. For Prisma/DB work: `DATABASE_URL` (add to `.env`/`.env.local` and mirror in `.env.example` when wiring DB).

## Prisma Schema (kept)
- Located at `prisma/schema.prisma`; includes users/teams/auth and hostel entities (Property, Room, Booking, BookingBed, Guest, Payment, Expense, etc.). No application code currently depends on it.

## Next Steps (suggested)
1) Wire Prisma: add a thin DB client helper, run `pnpm exec prisma generate`, and a simple health check API route.
2) Reintroduce minimal feature slices incrementally (rooms, bookings) with strict typing and small UI.
3) Add env sample updates (`.env.example`) when new config is required.
4) Keep builds fast: avoid turbopack, stick to webpack default, minimal deps.

## Status Checks (last run)
- `pnpm lint` ✅
- `pnpm type-check` ✅
- `pnpm build` ✅
