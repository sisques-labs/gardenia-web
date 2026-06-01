# Tasks: Migrate gardenia-web from Angular to Next.js (App Router) + pnpm

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 3,000–5,000 (40 files ported + Dockerfile + CI + all pages) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Scaffold) → PR 2 (Auth domain) → PR 3 (Spaces domain) → PR 4 (Integration) → PR 5 (Cleanup) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

> **Action required before `sdd-apply`**: decide chain strategy (stacked-to-main vs feature-branch-chain vs size-exception). Each PR must stay under 400 changed lines. Phase 1 itself may need to be split into Phase 1a (scaffold + CI/Docker) and Phase 1b (shadcn + ky/store scaffolds).

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1a | Next.js scaffold, Tailwind v4, shadcn/ui, Vitest, CI, Docker | PR 1 | Foundation; no domain code |
| 1b | Core structure, Zustand shells, ky client scaffold, route groups | PR 2 | Depends on 1a; no HTTP logic yet |
| 2 | Auth domain port + mutex spike + AuthStore + LoginPage + RegisterPage + middleware | PR 3 | Gated on spike test passing |
| 3 | Spaces domain port + SpacesStore + ShellLayout + SpaceListPage + SpaceCreatePage | PR 4 | Depends on PR 3 |
| 4 | Integration smoke + boot-auth + X-Space-ID wiring | PR 5 | E2E validation |
| 5 | Angular removal + ESLint cleanup | PR 6 | Cutover |

---

## Phase 1: Scaffold — Foundation, Tooling, CI, Docker

> Strict TDD active. For each new unit: write RED test first, then GREEN, then refactor.

- [ ] 1.1 **[PARALLEL]** Initialize Next.js 15 project in-place: run `npx create-next-app@latest` with App Router, TypeScript strict, Tailwind v4, `src/` dir; confirm `next.config.ts` has NO `output: 'export'`. Spec: Node Server Build.
- [ ] 1.2 **[PARALLEL]** Configure Tailwind v4 in `src/app/globals.css`: `@import "tailwindcss"` + import `src/design-system/*.css` tokens; move `src/styles.css` content here. Verify `@theme` custom properties exist post-build. Spec: Tailwind v4 Design Tokens.
- [ ] 1.3 **[AFTER 1.1, 1.2]** Initialize shadcn/ui for Tailwind v4 (NOT default v3): run `npx shadcn@latest init`, manually wire CSS variables to Tailwind v4 `@theme` block. Spec: shadcn/ui Component Library.
- [ ] 1.4 **[AFTER 1.3]** Install shadcn components via CLI: `Button`, `Card`, `Input`, `Select`, `Textarea`, `Badge`. Add `lucide-react`. Verify `src/components/ui/` populated. Spec: shadcn/ui Component Library.
- [ ] 1.5 **[RED]** Write `src/components/ui/button.test.tsx`: assert Button renders with `variant="default"` and correct text. Spec: Scenario "Button component renders with variant".
- [ ] 1.6 **[GREEN → REFACTOR after 1.5]** Confirm Button shadcn component satisfies 1.5 test; fix any CSS-variable mismatch with Tailwind v4. Spec: shadcn/ui Component Library.
- [ ] 1.7 **[PARALLEL after 1.1]** Configure Vitest + RTL: create `vitest.config.ts` (jsdom, globals, `@` alias, react plugin), `vitest.setup.ts` (jest-dom matchers), install `@testing-library/react`, `@testing-library/jest-dom`, `@vitejs/plugin-react`. Update `package.json` `"test"` script to `vitest run`. Spec: Vitest + RTL Test Harness.
- [ ] 1.8 **[AFTER 1.7]** Write `vitest.setup.ts` test: assert `expect(true).toBe(true)` passes; run `pnpm test` and confirm Vitest reports green. Spec: Scenario "Test command executes successfully".
- [ ] 1.9 **[AFTER 1.1]** Rewrite `Dockerfile`: 2-stage `node:24-bookworm-slim` builder → `node:24-bookworm-slim` runner; runner copies `.next/` + `public/`, installs prod deps, `CMD ["pnpm", "start"]`. Delete `nginx.conf`. Spec: Docker Next.js Node Server.
- [ ] 1.10 **[AFTER 1.1]** Update `.github/workflows/ci.yml`: swap `ng test`/`karma` → `pnpm test` (Vitest); update build step output path to `.next/`; keep `tsc --noEmit` and `pnpm lint`. Spec: CI Smoke Build.
- [ ] 1.11 **[AFTER 1.1]** Create `src/app/` route group structure: `(auth)/login/page.tsx`, `(auth)/register/page.tsx`, `(protected)/layout.tsx`, `(protected)/page.tsx`, `(protected)/spaces/page.tsx`, `spaces/new/page.tsx`. All pages render a placeholder `<div>` with route name. No logic yet.
- [ ] 1.12 **[AFTER 1.11]** Create root `src/app/layout.tsx` with `<Providers>` shell (empty provider component in `src/components/providers.tsx`); import `globals.css`. TSX must pass `tsc --noEmit`.
- [ ] 1.13 **[AFTER 1.11]** Create `middleware.ts` at project root with full route guard logic: public routes `['/login', '/register']`, cookie-presence gate (placeholder cookie name — confirm backend name in task), `authGuard` redirect to `/login?returnUrl=...`, `guestGuard` redirect to `/`. Export `config.matcher`. Spec: middleware.ts Route Guard Active in Production.
- [ ] 1.14 **[RED/GREEN, AFTER 1.13]** Write integration-style test for `middleware.ts` guard logic (mock `NextRequest`): assert protected routes redirect unauthenticated, guest routes redirect authenticated. Spec: Scenarios "middleware redirects on missing auth cookie" and "middleware allows public routes without cookie".
- [ ] 1.15 **[AFTER 1.3]** Confirm `tsconfig.json` has `"strict": true` and path alias `"@/*": ["./src/*"]`; run `tsc --noEmit` — zero errors. Spec: Scenario "TypeScript strict mode enforced".
- [ ] 1.16 **[PARALLEL after 1.1]** Move `src/design-system/*.css` to their new location (if path changed); verify build still resolves them. Spec: Tailwind v4 Design Tokens.

---

## Phase 2: Auth Domain — Port, Mutex Spike, Store, Pages, Guards

> All tasks in this phase depend on Phase 1 being complete. The mutex SPIKE (2.1–2.3) GATES the rest of Phase 2.

### 2a: Mutex Spike (gate — must be green before any HTTP work)

- [ ] 2.1 **[SPIKE — RED]** Write `src/lib/http/refresh-mutex.spec.ts`: fire N=5 concurrent mock requests, all returning 401; assert `doRefresh` mock called exactly once; assert all 5 retry with the new token; assert refresh failure clears auth exactly once. Spec: Scenario "Single refresh on concurrent 401s" + "Refresh fails — user logged out".
- [ ] 2.2 **[SPIKE — GREEN]** Implement `src/lib/http/refresh-mutex.ts` (`refreshTokenOnce` with module-level nullable Promise) until 2.1 test is green. Design §2 — mutex primitive.
- [ ] 2.3 **[SPIKE — VERIFY]** Run `pnpm test` focused on `refresh-mutex.spec.ts`. Gate: this test MUST pass before 2.4+. Spec: Scenario "401 mutex concurrency test passes".

### 2b: Domain + Application Port

- [ ] 2.4 **[PARALLEL, AFTER 2.3]** Move `src/app/core/auth/domain/` → `src/core/auth/domain/` as-is (pure TS, zero edits). Verify `tsc --noEmit` still passes. Design §7.
- [ ] 2.5 **[PARALLEL, AFTER 2.3]** Port `src/app/core/auth/application/ports/`: remove `InjectionToken` imports and declarations; keep interfaces unchanged; export plain TypeScript interfaces. Design §7.
- [ ] 2.6 **[AFTER 2.5]** Port `src/app/core/auth/application/services/` (login, register, logout, me, refresh): remove `@Injectable()` + `inject()`; change `Observable<T>` → `Promise<T>`; export one module singleton per service. Write unit tests alongside each service. Design §7.

### 2c: Infrastructure — ky Client + Repository

- [ ] 2.7 **[AFTER 2.3]** Create `src/lib/http/client.ts`: `http` ky singleton with `prefixUrl: process.env.NEXT_PUBLIC_API_URL`, `credentials: 'include'`, `retry: { limit: 0 }`, `beforeRequest: [injectAuthHeader, injectSpaceHeader]`, `afterError: [afterError]`; bare instance for refresh/retry (no afterError). Design §4.
- [ ] 2.8 **[AFTER 2.7, AFTER 2.4]** Implement `src/core/auth/infrastructure/repositories/auth-http.repository.ts` with ky (no leading `/` on paths). Replace `HttpClient` calls. Implement `AuthHttpRepository.refresh()` using bare ky instance. Design §7.
- [ ] 2.9 **[RED/GREEN, AFTER 2.8]** Write `auth-http.repository.spec.ts`: mock `http` module; assert `login` posts to `auth/login`, `refresh` posts to `auth/refresh` with `credentials:'include'`. Spec: Scenario "Single refresh on concurrent 401s".

### 2d: Zustand AuthStore

- [ ] 2.10 **[RED, AFTER 2.4]** Write `src/stores/auth.store.spec.ts`: assert `setAccessToken`, `clearAuth`, derived `isAuthenticated`, token NOT in localStorage. Spec: Access Token Storage — In-Memory Only.
- [ ] 2.11 **[GREEN, AFTER 2.10]** Implement `src/stores/auth.store.ts` (Zustand, no persist). `clearAuth` resets token + user, no navigation. Design §3.
- [ ] 2.12 **[AFTER 2.11]** Wire `afterError` hook in `client.ts`: import `refreshTokenOnce`, import `useAuthStore.getState`, handle 401 refresh cycle + hard logout on `/auth/refresh` 401. Design §2 — afterError hook.

### 2e: Boot Auth + ky Hooks

- [ ] 2.13 **[AFTER 2.11]** Implement `beforeRequest` hooks in `client.ts`: `injectAuthHeader` (skip login/register), `injectSpaceHeader` (skip `/auth/` paths), both read via `getState()`. Design §4 — beforeRequest hooks. Spec: Authorization Header on Authenticated Requests.
- [ ] 2.14 **[AFTER 2.11]** Implement `src/hooks/use-boot-auth.ts`: on mount, if `accessToken === null`, call `POST /auth/refresh` via bare ky; on success hydrate token + `me()`; on failure treat as logged out. Design §0 — boot-time auth. Spec: Scenario "Page refresh preserves session".
- [ ] 2.15 **[AFTER 2.14]** Wire `useBootAuth` into `src/components/providers.tsx` (the root Providers component mounted in `src/app/layout.tsx`).

### 2f: Pages — Login + Register

- [ ] 2.16 **[RED, AFTER 2.11]** Write `login/page.test.tsx`: render LoginPage, submit empty form → assert validation errors shown, no HTTP call. Submit valid credentials → assert POST to `auth/login` and redirect. Spec: LoginPage Form and Submission scenarios.
- [ ] 2.17 **[GREEN, AFTER 2.16]** Implement `src/app/(auth)/login/page.tsx` with React Hook Form + shadcn Input/Button; on success store token via AuthStore, redirect to `/`. Spec: LoginPage Form and Submission.
- [ ] 2.18 **[RED, AFTER 2.11]** Write `register/page.test.tsx`: empty submit → validation errors; invalid email → email error; valid submit → POST `auth/register`, store token + spaceId, redirect. Spec: RegisterPage Form and Submission.
- [ ] 2.19 **[GREEN, AFTER 2.18]** Implement `src/app/(auth)/register/page.tsx` with React Hook Form + shadcn components; capture `spaceId` from response. Spec: RegisterPage Form and Submission.

### 2g: Auth Domain Tests

- [ ] 2.20 **[AFTER 2.6, 2.11]** Port remaining auth unit tests to Vitest: rename Jasmine spies to `vi.fn()`/`vi.spyOn()`; remove `TestBed`; import units directly. Run `pnpm test` — all auth tests green. Spec: Auth Domain Unit Tests Pass.

---

## Phase 3: Spaces Domain — Port, Store, Pages, ShellLayout

> Depends on Phase 2 complete (AuthStore and ky client available).

### 3a: Domain + Application Port

- [ ] 3.1 **[PARALLEL]** Move `src/app/core/spaces/domain/` → `src/core/spaces/domain/` as-is. Verify `tsc --noEmit`. Design §7.
- [ ] 3.2 **[PARALLEL]** Port `src/app/core/spaces/application/ports/`: remove `InjectionToken`; keep interfaces. Design §7.
- [ ] 3.3 **[AFTER 3.2]** Port `src/app/core/spaces/application/services/`: remove `@Injectable`, de-RxJS to `Promise`, export module singletons. Write unit tests alongside. Design §7.

### 3b: Infrastructure

- [ ] 3.4 **[AFTER 3.1]** Implement `src/core/spaces/infrastructure/repositories/spaces-http.repository.ts` with `http` ky singleton. No leading `/` on paths. Write `spaces-http.repository.spec.ts` (mock ky). Spec: Scenario "Space resolved from API after login".
- [ ] 3.5 **[PARALLEL after 3.1]** Move `src/core/shared/` (EventBus + shared domain events): drop `@Injectable` from EventBus, export module singleton. Add `src/hooks/use-event-bus.ts` wrapping `EventBus.subscribe` in `useEffect` with cleanup. Design §7 — shared/infrastructure.

### 3c: Zustand SpacesStore

- [ ] 3.6 **[RED]** Write `src/stores/spaces.store.spec.ts`: assert `setSpaces`, `setActiveSpace`, `resolveFromStorage` (stored id → first → null fallback), `currentSpaceId` persisted to `localStorage` at key `gardenia.activeSpaceId`, `availableSpaces` NOT persisted, `clear()` resets all. Spec: ActiveSpaceStorage — localStorage Persistence.
- [ ] 3.7 **[GREEN, AFTER 3.6]** Implement `src/stores/spaces.store.ts` (Zustand + `persist` middleware, `partialize: (s) => ({ currentSpaceId: s.currentSpaceId })`, key `gardenia.activeSpaceId`). `currentSpace` is a derived selector. Design §3.
- [ ] 3.8 **[AFTER 3.7]** Wire `UserRegisteredEvent → setActiveSpace`: add `useEventBus('auth.user_registered', ...)` effect in ShellLayout or SpacesStore init. Design §6 — ShellLayout.

### 3d: Pages + ShellLayout

- [ ] 3.9 **[RED, AFTER 3.7]** Write `(protected)/layout.test.tsx` (ShellLayout): assert loading skeleton visible while `isResolved=false`; assert redirect to `/spaces/new` when `currentSpace===null` after resolve; assert children rendered when space resolved. Spec: ShellLayout Space Guard scenarios.
- [ ] 3.10 **[GREEN, AFTER 3.9]** Implement `src/app/(protected)/layout.tsx` (ShellLayout client component): auth gate → `loadSpaces()` → `resolveFromStorage` → loading skeleton while in-flight → redirect to `/spaces/new` if no space → render Header + children. Design §6.
- [ ] 3.11 **[RED, AFTER 3.7]** Write `spaces/page.test.tsx`: render SpaceListPage → assert GET `/spaces` called → assert space names rendered → assert empty state for empty list. Spec: SpaceList Page Renders User Spaces.
- [ ] 3.12 **[GREEN, AFTER 3.11]** Implement `src/app/(protected)/spaces/page.tsx` (SpaceList). Uses SpacesHttpRepository + SpacesStore.
- [ ] 3.13 **[RED, AFTER 3.7]** Write `spaces/new/page.test.tsx`: render SpaceCreatePage → submit form → assert POST to spaces endpoint → redirect. Spec: Active Space Resolution on Login.
- [ ] 3.14 **[GREEN, AFTER 3.13]** Implement `src/app/spaces/new/page.tsx` (SpaceCreate — outside `(protected)`, space-exempt). Design §6 — Why `spaces/new` is OUTSIDE `(protected)`.

### 3e: Spaces Domain Tests

- [ ] 3.15 **[AFTER 3.3, 3.7]** Port remaining spaces unit tests to Vitest: rename Jasmine APIs, remove TestBed, import directly. Run `pnpm test` — all spaces tests green. Spec: Spaces Domain Unit Tests Pass.

---

## Phase 4: Integration + Smoke Test

> Depends on Phases 2 and 3 complete.

- [ ] 4.1 **[SEQUENTIAL]** Confirm refresh cookie name with backend; update `middleware.ts` cookie key. Add `gardenia.isAuth=1` hint cookie approach if httpOnly scope blocks middleware read (Design §5 — open decision).
- [ ] 4.2 **[AFTER 4.1]** Integration smoke test: run against real gardenia-api (or MSW mock): register → login → spaces list → assert authenticated request includes `Authorization: Bearer` + `X-Space-ID`. Spec: Scenario "End-to-end authenticated flow".
- [ ] 4.3 **[AFTER 4.2]** Verify page-refresh session preservation: log in, hard-refresh, assert `useBootAuth` restores token, user NOT redirected to `/login`, active space restored from localStorage. Spec: Scenario "Page refresh preserves session".
- [ ] 4.4 **[AFTER 4.1]** Verify middleware redirect in Docker container: `docker build && docker run`; curl `/` without cookie → assert 307/308 to `/login`; curl `/_next/static/...` → assert 200. Spec: Docker Next.js Node Server scenarios + middleware.ts Route Guard Active in Production.

---

## Phase 5: Cleanup — Angular Removal + ESLint

> Depends on Phase 4 passing. This is the cutover PR.

- [ ] 5.1 **[PARALLEL]** Remove all `@angular/*`, `@lucide/angular`, `zone.js` packages from `package.json` (`dependencies` + `devDependencies`). Run `pnpm install`. Spec: Scenario "No Angular packages in package.json".
- [ ] 5.2 **[PARALLEL]** Delete: `karma.conf.js`, `angular.json`, `src/main.ts`, `src/app/app.config.ts`, `src/app/app.routes.ts`. Spec: Scenario "No Karma config files remain".
- [ ] 5.3 **[AFTER 5.1]** Update ESLint config to Next.js flat config (`eslint.config.mjs`): remove Angular ESLint plugin; add `eslint-config-next`. Run `pnpm lint` — zero errors. Design §8 — CI.
- [ ] 5.4 **[AFTER 5.1, 5.2, 5.3]** Run full CI suite: `pnpm lint && tsc --noEmit && pnpm test && pnpm build`. Assert exit 0, no Angular warnings in stdout/stderr. Spec: Scenario "Build completes without Angular warnings".
- [ ] 5.5 **[AFTER 5.4]** Update `openspec/config.yaml` context block to reflect Next.js stack (post-cutover reference). Mark change as ready for archive.

---

## Task Dependency Summary

```
1.1 ──┬── 1.3 ── 1.4 ── 1.5 ── 1.6
1.2 ──┘          └── 1.7 ── 1.8
1.1 ── 1.9
1.1 ── 1.10
1.1 ── 1.11 ── 1.12
               └── 1.13 ── 1.14
1.1 ── 1.15
1.1 ── 1.16

[All Phase 1 done] ──
  2.1 ── 2.2 ── 2.3 (SPIKE GATE)
    ├── 2.4 ──────────────── 2.20
    ├── 2.5 ── 2.6 ─────── 2.20
    ├── 2.7 ── 2.8 ── 2.9
    ├── 2.10 ── 2.11 ── 2.12
    │                  ── 2.13
    │                  ── 2.14 ── 2.15
    ├── 2.16 ── 2.17
    └── 2.18 ── 2.19

[Phase 2 done] ──
  3.1 ── 3.4
  3.2 ── 3.3 ── 3.15
  3.5
  3.6 ── 3.7 ── 3.8
              ── 3.9  ── 3.10
              ── 3.11 ── 3.12
              ── 3.13 ── 3.14
              ── 3.15

[Phase 3 done] ── 4.1 ── 4.2 ── 4.3
                       └── 4.4

[Phase 4 done] ── 5.1 ─┐
               ── 5.2   ├── 5.3 ── 5.4 ── 5.5
               (parallel)
```

---

## Files Affected (key paths)

| Phase | New / Modified / Deleted |
|-------|--------------------------|
| 1 | `next.config.ts`, `tsconfig.json`, `vitest.config.ts`, `vitest.setup.ts`, `Dockerfile`, `.github/workflows/ci.yml`, `middleware.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/(auth)/**`, `src/app/(protected)/**`, `src/app/spaces/new/**`, `src/components/providers.tsx`, `src/components/ui/**` (shadcn), `src/design-system/**` |
| 2 | `src/core/auth/**`, `src/stores/auth.store.ts`, `src/lib/http/client.ts`, `src/lib/http/refresh-mutex.ts`, `src/hooks/use-boot-auth.ts` |
| 3 | `src/core/spaces/**`, `src/core/shared/**`, `src/stores/spaces.store.ts`, `src/hooks/use-event-bus.ts`, `src/app/(protected)/layout.tsx`, `src/app/(protected)/spaces/page.tsx`, `src/app/spaces/new/page.tsx` |
| 4 | `middleware.ts` (cookie name finalized) |
| 5 | `package.json`, `eslint.config.mjs`, `openspec/config.yaml`; DELETE: `karma.conf.js`, `angular.json`, `src/main.ts`, `src/app/app.config.ts`, `src/app/app.routes.ts`, `nginx.conf` |
