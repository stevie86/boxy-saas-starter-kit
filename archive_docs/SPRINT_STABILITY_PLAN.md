# Stability Sprint — Clean Foundation (Autonomous)

## Goal
Re-establish a stable, LTS-pinned base for HostelPulse: clean Next.js App Router app, Prisma/Postgres on Node 20 LTS, minimal feature surface (markets list, market detail, create market, place bet, view odds), ready for predictable deploys.

## Constraints
- Runtime: Node 20 LTS (pin in `mise.toml`/`.nvmrc` and `package.json` `engines`), npm/pnpm lockfile committed.
- Frameworks: Next 16.x, React 18.3.x, TypeScript 5.x, Prisma 5.22.x; no new experimental deps.
- Infra: Postgres 14/15; env via `.env` (mirrored in `.env.example`); Nixpacks/Docker-friendly (no native/system deps beyond OpenSSL/libpq).
- Testing gates: `npm run lint`, `npm run type-check`, `npm run build`; `npx prisma validate` before migrations; smoke API checks via `curl`.

## Scope (in/out)
- In: Version pinning/hardening, dependency pruning, env alignment, Prisma schema/migrations sanity, API/FE wiring for core flows, baseline UI polish only (no new features).
- Out: New feature work, experimental UI systems, auth/payments changes, infra beyond Postgres/Docker/Nixpacks.

## Work Plan (do in order, keep each step passing)
1) Baseline & branch
   - Create `stabilize-foundation` branch.
   - Treat `mise` as source of truth: `node = "20.18.1"`, `pnpm = "10.23.0"` in `mise.toml`; run `mise install`.
   - Mirror versions for other tools: add/update `.nvmrc` and `package.json` `engines.node=">=20 <21"` to match `mise`.
2) Dependency hardening
   - Pin Next/React/TS/ESLint/Prisma to current stable minors; remove unused deps/devDeps.
   - Regenerate lockfile (`npm install` or `pnpm install --frozen-lockfile=false`), commit.
3) Config & env hygiene
   - Align `.env.example` with required vars (`DATABASE_URL`, `NEXTAUTH_URL`, auth/Stripe keys as needed); add comments for required formats.
   - Ensure `next.config.js`, `tsconfig.json`, `eslint.config.cjs`, `tailwind.config.js` match standard, no stray plugins.
4) Prisma & database
   - Run `npx prisma validate`; inspect `prisma/schema.prisma` for drift.
   - If schema changes needed, update and run `npm run db:push` (or `db:migrate` if migrations exist); `npm run db:generate`.
   - Add a simple `health` query (e.g., `prisma.$queryRaw` ping) for diagnostics if missing.
5) API stabilization
   - Verify core routes for markets/bets exist and use Prisma safely (input validation, error handling).
   - Add minimal integration tests or `curl` examples to README/MD for create/list/get/place-bet/odds.
6) Frontend stabilization
   - Ensure pages load with mock/fallback data when API unavailable; type props strictly.
   - Light UI polish only (spacing/typography); no new flows.
7) QA gates
   - Run `npm run lint`, `npm run type-check`, `npm run build`.
   - Spot-check API with `curl` against local server; document commands in README.

## Deliverables
- Branch `stabilize-foundation` with pinned versions, refreshed lockfile, aligned env samples, validated Prisma schema, stable API/FE wiring for core flows.
- Updated docs: this sprint plan + README additions for env setup and `curl` smoke tests.
- Green checks: lint, type-check, build, prisma validate.

## Definition of Done
- Clean install on Node 20 succeeds with no extra steps.
- Prisma validate/generate passes; DB reachable via `DATABASE_URL` from `.env`.
- Core pages render without runtime errors; API endpoints respond per documented `curl` examples.
- No extraneous deps; lockfile matches `package.json`.
