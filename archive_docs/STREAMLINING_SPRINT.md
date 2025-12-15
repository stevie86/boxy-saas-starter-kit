# HostelPulse Streamlining Sprint: "Operation Clean Slate"

## 1. Objective
To eliminate technical debt, unify the architectural pattern, and enforce type safety, resulting in a stable, build-ready codebase.

**Goal:** A green build (`npm run build`), zero `any` types in critical paths, and a single routing paradigm (Pages Router).

---

## 2. Branching Strategy
We will use a **Trunk-Based Development** approach with short-lived feature branches for this sprint to minimize merge conflicts.

*   **Main Branch:** `main` (Production-ready code)
*   **Sprint Branch:** `sprint/streamlining-cleanup` (Base for this sprint)
*   **Feature Branches:** `fix/<feature-name>` (Merged into Sprint Branch)

**Workflow:**
1.  Create `sprint/streamlining-cleanup` from `main`.
2.  Create feature branches (e.g., `fix/routing`) from `sprint/streamlining-cleanup`.
3.  PR/Merge into `sprint/streamlining-cleanup`.
4.  Final Verify -> Merge `sprint/streamlining-cleanup` into `main`.

---

## 3. Sprint Tasks (The "Todo" List)

### Phase 1: The Purge (Architecture Unification)
*Branch:* `fix/unify-routing`

- [ ] **Remove App Router Artifacts:**
    - Delete `app/` directory (removes the "Hybrid" conflict).
    - Ensure `pages/index.tsx` exists and serves as the homepage.
    - Delete `app.json` (if unused/related to app router).
- [ ] **Remove Dead Code:**
    - Delete `components/bookings/` (orphaned).
    - Delete `components/rooms/` (orphaned).
    - Delete `temp_backup/`, `temp_feedback*/`, `temp_process_queue/`.
- [ ] **Fix Configuration:**
    - Update `next.config.js`: Remove invalid `eslint` block.
    - Update `package.json`: Ensure `build` script handles linting correctly (`next build --no-lint` if needed for now).

### Phase 2: The Safety Net (Type Safety)
*Branch:* `fix/type-safety`

- [ ] **Ban `any` in Queries:**
    - Refactor `lib/queries/bookings.ts`: Replace `const where: any` with `Prisma.BookingWhereInput`.
    - Refactor `lib/queries/rooms.ts`: Replace `const where: any` with `Prisma.RoomWhereInput`.
- [ ] **Strict Utilities:**
    - Fix `lib/stripe.ts`: Define types for `teamMember` and `session`.
    - Fix `lib/pushbullet.ts`: Type the callback errors/responses.
    - Fix `lib/server-common.ts`: Type `forceConsume` parameter.

### Phase 3: Organization (File Structure)
*Branch:* `chore/organize-files`

- [ ] **Root Cleanup:**
    - Create `docs/archive/` and move `*_SUMMARY.md`, `*_FIX.md`, `*_GUIDE.md`.
    - Create `logs/history/` and move `*.log`.
    - Create `scripts/legacy/` for unused scripts like `delete-team.js`.

---

## 4. Acceptance Criteria (Definition of Done)
1.  **Build Passes:** `npm run build` completes without error.
2.  **Type Check Passes:** `npm run type-check` returns 0 errors.
3.  **Clean Root:** Root directory contains only config files and core folders (`pages`, `lib`, `prisma`, etc.).
4.  **No `app/` folder:** The project is strictly a Pages Router application.

---

## 5. Execution Command Center

To start this sprint, run the following to set up the branch:

```bash
git checkout main
git pull
git checkout -b sprint/streamlining-cleanup
```
