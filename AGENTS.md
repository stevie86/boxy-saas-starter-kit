# Repository Guidelines

## Project Structure & Module Organization
- `app/`: App Router routes, layouts, and global styles (`app/globals.css`).
- `pages/`: Legacy routes/APIs (auth, teams, settings) plus error pages.
- `components/`, `hooks/`, `lib/`, `models/`: Reusable UI, shared logic, and data helpers.
- `prisma/`: Schema and migrations; run Prisma commands from here.
- `locales/` and `public/`: Translations, static assets, and emails.
- `__tests__/` for unit/integration tests; `tests/e2e/` for Playwright end-to-end flows.

## Build, Test, and Development Commands
- Install: `npm install` (or `pnpm install` if you prefer).
- Develop: `npm run dev` (Next.js on port 3000; uses `.env` copied from `.env.example`).
- Build: `npm run build` (runs `prisma generate` then `next build`).
- Start: `npm run start` after a build; set `PORT=4002` when running with Playwright config.
- Lint/Format/Types: `npm run lint`, `npm run lint:fix`, `npm run format:check`, `npm run type-check`.
- Database: `npm run db:migrate` (dev migrations), `npm run db:push` (sync schema), `npm run db:studio`.
- Tests: `npx jest __tests__ --runInBand` for units; `npx playwright test` for e2e (requires running app, e.g., `PORT=4002 npm run start` in another shell).

## Coding Style & Naming Conventions
- TypeScript-first codebase; keep strict typing on props and API responses.
- Prettier defaults (2-space indent, double quotes, semicolons) and Next.js ESLint rules are enforced; run linters before pushing.
- React components/hooks in PascalCase; files in `components/` and `app/` should match component names.
- Follow the Node style guide referenced in `CONTRIBUTING.md`; avoid unused exports and prefer explicit returns over implicit `any`.

## Testing Guidelines
- Unit tests sit next to feature folders or in `__tests__/` with `.test.ts`/`.test.tsx` suffixes; mock network/DB calls.
- E2E tests live in `tests/e2e/` and rely on Playwright setup/teardown scripts in `tests/e2e/support/`; keep them idempotent and avoid hard-coded data.
- Add coverage for new behaviors, especially auth flows, Prisma models, and multi-locale rendering; update fixtures when APIs change.

## Commit & Pull Request Guidelines
- Use short, imperative commit subjects similar to existing history (e.g., `Fix ReCAPTCHA ref type mismatch`); group related changes together.
- PRs target `main` and should include: concise summary, linked issue/task, screenshots or terminal output for UI/behavioral changes, and notes on tests run (`lint`, `type-check`, `jest`, `playwright`).
- Keep changes scoped; prefer smaller PRs over multi-feature drops.

## Security & Configuration Tips
- Never commit secrets; duplicate `.env.example` to `.env` locally and add new env keys there.
- Regenerate Prisma client (`npm run db:generate`) after schema edits and document any required migrations.
- When touching authentication or middleware, test both App Router (`app/`) and legacy Pages Router (`pages/`) paths to avoid regressions.
