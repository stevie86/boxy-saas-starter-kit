# Streamlining Sprint + MVP Design (2025 Optimized)

## Goals
- Ship a stable, single-router app with clean builds (`npm run build`) and strict typing (`npm run type-check`).
- Preserve the HostelPulse hostel-focused UX (modern gradients, warm palette, hostel-specific copy) across landing and app.
- Cut dead weight: remove legacy folders/config and BoxyHQ remnants.

## Scope & Priorities
1) **Routing & Structure**
   - Choose one router (recommended: App Router). Remove the other and update Tailwind `content` to match.
   - Clean root: drop orphaned components, temp folders, unused scripts per original sprint list.
2) **Type & Build Stability**
   - Fix TypeScript errors in `lib/nextAuth.ts`, `models/*`, API handlers, and `lib/utils/dates` exports; add missing module typings (`react-daisyui`, `@retracedhq/logs-viewer` placeholder).
   - Ensure `session.user.id` is typed; eliminate `any` in queries/utilities.
   - Resolve middleware deprecation (switch to `proxy`); force Webpack build if Turbopack stalls.
3) **Design & Branding (MVP cues, 2025 look)**
   - Keep Hostelpulse palette, gradient hero, hostel-specific hero/pricing/FAQ copy; remove BoxyHQ assets/links.
   - Apply theme tokens to shared UI primitives so auth/dashboard match landing; ensure responsive spacing and `next/image` usage where applicable.
4) **Data & Validation**
   - Co-locate data fetching in server components where possible; use `revalidate`/`cache` appropriately.
   - Add Zod schemas for forms/APIs; type Prisma queries with generated types.
5) **Testing & Gates**
   - CI gates: `npm run lint`, `npm run type-check`, `npm run build`.
- Add Playwright smoke for landing + auth entry if time permits.

## Load Guardrails (initial prod, ~5 hostels x 20 rooms)
- Ensure booking queries filter by `teamId` and date range; add DB indexes on `teamId`, `checkIn`, `checkOut`, `status` to avoid scans.
- Enforce conflict detection before confirming bookings; add a DB uniqueness constraint on overlapping reservations per room/bed if feasible.
- Use Postgres pooling (pgbouncer/Supabase pools) and set Prisma pool limits in prod env.
- Monitor basics: request latency/error rate; seed a small dataset and run a smoke load (k6/Artillery) against list + check-in/out endpoints.

## Quick Commands
- Dev preview: `npm run dev -- --hostname 0.0.0.0 --port 3000`
- Type check: `npm run type-check`
- Lint: `npm run lint`
- Build (fallback to Webpack): `NEXT_TURBOPACK=0 npm run build`
- Preferred package manager: use `pnpm` (lockfile present) for faster, reliable installs (`pnpm install`, `pnpm build -- --webpack`).
