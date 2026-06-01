# Proposal: Migrate gardenia-web from Angular 20 to Next.js (App Router) with pnpm

## Intent

**Problem.** gardenia-web runs on Angular 20 (zoneless, standalone, signals). The organization is standardizing its frontend stack on React/Next.js for hiring, shared tooling, and ecosystem alignment. Maintaining a divergent Angular app raises long-term cost and knowledge fragmentation.

**Why now.** The project is still small — ~40 TypeScript files across 2 bounded contexts (auth, spaces). Migration cost scales with surface area, so the window before the codebase grows is the cheapest moment to migrate. The DDD + Hexagonal structure means `domain/` and most of `application/` are pure TypeScript with zero Angular imports — they port as file moves, not rewrites.

**Opportunity.** A clean App Router foundation on day one, framework-agnostic design tokens preserved as-is, and an unchanged nginx Docker deployment via static export. pnpm is already the package manager (`pnpm@9.15.4`) — zero migration cost there.

**Success looks like.** Feature parity with the current Angular app, all critical flows (login, register, refresh, space creation/selection, multitenant header injection) working, CI green, Angular fully removed.

## Scope

### In Scope

- Scaffold Next.js 15 (App Router, TypeScript strict, Tailwind v4, static export) with CI + Docker updated.
- Port the framework-agnostic `domain/` layers of both contexts (auth, spaces) unchanged.
- Re-implement `application/` state as Zustand stores (replacing signals-based services).
- Re-implement `infrastructure/` HTTP with `ky` (repositories + the 401-refresh interceptor).
- Re-implement DI as TypeScript module singletons + `process.env.NEXT_PUBLIC_*`.
- Re-implement guards via `middleware.ts` (cookie check) + page-level `spaceGuard`.
- Port 7 UI atoms and all pages (Login, Register, SpaceCreate, SpaceList, ShellLayout) to React.
- Migrate forms to React Hook Form; icons to `lucide-react`.
- Migrate tests from Karma + Jasmine to Vitest + React Testing Library.
- Audit `@angular/cdk` usage and select a replacement (Radix UI or Headless UI).
- Remove all Angular dependencies, Karma config, and Angular ESLint config.

### Out of Scope

- New features or UX changes — this is a parity migration, not a redesign.
- Backend / API contract changes (the API stays identical; only the client moves).
- SSR / server components beyond what static export allows (deferred — see Decisions).
- Playwright e2e implementation (currently `available: false`; not introduced here).
- The `users` context (not present in current codebase; only auth + spaces exist).
- Switching state libraries, HTTP clients, or CSS approach later — locked for this change.

## Capabilities

> Contract with the sdd-spec phase. This is a framework migration that PRESERVES behavior. No NEW user-facing capabilities and no MODIFIED requirements at the spec level — behavior parity is the goal. Specs here describe the migration's technical acceptance behavior (parity, refresh mutex, guard semantics), not new product requirements.

### New Capabilities

- `nextjs-foundation`: App Router scaffold, TypeScript strict, Tailwind v4 static export, design-system port, CI/Docker — the migration substrate.
- `auth-runtime-react`: React/Zustand/ky re-implementation of auth state, HTTP repository, 401-refresh interceptor mutex, and route guards (parity behavior, not new auth requirements).
- `spaces-runtime-react`: React/Zustand re-implementation of spaces state, active-space storage, and space resolution in ShellLayout (parity behavior).

### Modified Capabilities

- None. This migration does not change product requirements; existing auth/spaces behavior is preserved exactly. Any behavioral spec is a parity assertion, not a requirement change.

## Approach

**Strategy: Phased Big Bang (DDD-preserving)** — Option C from exploration. Option B (Strangler Fig / parallel SPAs) is **eliminated**: the access token lives in an in-memory signal/store and cannot be shared across two SPAs on different origins. Option A (greenfield) discards the DDD value already built. Option C ports domain/application layers independently before React exists, making each phase testable and reviewable with no legacy drag.

### Phases

| # | Phase | Deliverable |
|---|-------|-------------|
| 1 | **Scaffold** | Next.js 15 App Router, TS strict, Tailwind v4 + design tokens, 7 UI atoms, Vitest + RTL, CI + Docker (static export → nginx). |
| 2 | **Auth domain** | `auth/domain/` port → AuthStateService→Zustand → AuthHttpRepository→ky → **interceptor (mutex spike FIRST)** → Login/Register pages (RHF) → middleware guards. |
| 3 | **Spaces domain** | `spaces/domain/` port → SpacesStateService→Zustand → ActiveSpaceStorage (plain class) → pages/layout → space resolution in ShellLayout. |
| 4 | **Integration** | Wiring, multitenant `X-Space-ID` header injection, end-to-end smoke test of all critical flows. |
| 5 | **Cleanup** | Remove Angular deps, Karma, Angular ESLint; finalize Next.js ESLint + tsconfig. |

### Tech Stack

| Concern | Choice | Replaces |
|---------|--------|----------|
| Routing | Next.js 15 App Router | RouterOutlet / loadComponent |
| State | Zustand | signal/computed services |
| HTTP | ky | HttpClient + interceptors |
| Forms | React Hook Form | ReactiveFormsModule |
| Icons | lucide-react | @lucide/angular |
| Tests | Vitest + RTL | Karma + Jasmine |
| CDK | Radix UI / Headless UI (post-audit) | @angular/cdk |

## Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Router** | App Router (not Pages Router) | App Router is the current default and forward path; file-system routing maps cleanly to the route tree; supports layouts (ShellLayout), middleware, and `loading`/`error` conventions. Pages Router is legacy — no reason to adopt it on a fresh build. |
| **Rendering** | Static export (`output: 'export'`) | The app is a token-authenticated SPA; all data is fetched client-side from the API. No per-request server rendering is needed. Static export produces plain HTML/JS served by the **existing nginx Docker image unchanged** — lowest-risk deployment. SSR would add a Node runtime to ship, breaking the current 2-stage nginx pipeline for no benefit. (Revisit SSR only if SEO/server-data needs emerge — out of scope.) |
| **State** | Zustand | **Critical constraint**: the ky 401-refresh interceptor runs OUTSIDE the React tree and must read the in-memory access token without hooks. Zustand stores are plain objects accessible via `store.getState()` from anywhere — Context/Redux-with-hooks cannot do this cleanly. Zustand also maps 1:1 to the existing signals-based singleton services. |
| **HTTP** | ky | `beforeRetry` / `afterError` hooks are the direct analog of Angular functional interceptors, enabling the 401-refresh mutex port. Lightweight fetch wrapper, no axios bulk, native AbortController/Promise. |
| **Guards** | `middleware.ts` (cookie-only) + page-level `spaceGuard` | Middleware runs on the Edge Runtime and can only inspect the httpOnly **refresh cookie** for presence (the access token is in memory, invisible to middleware). Auth/guest gating = cookie check in middleware. The current `spaceGuard` makes an HTTP `loadSpaces()` call — **infeasible on Edge**; space resolution moves into ShellLayout as a client-side effect with redirect. |
| **DI** | Module singletons + env vars | `InjectionToken` + `inject()` → exported TypeScript module singletons (one instance per module) for repositories/services; `API_URL` → `process.env.NEXT_PUBLIC_API_URL`. No DI container needed at this scale. |
| **CDK** | Audit before estimating | `@angular/cdk` primitives in use are unknown (HTML templates not yet scanned). Effort ranges from trivial (focus trap) to heavy (overlay/portal). **Mandatory audit of HTML templates in Phase 1** before committing to Radix vs Headless UI and sizing the work. |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/main.ts`, `src/app/app.{ts,config,routes}.ts` | Removed | Angular bootstrap replaced by App Router file-system routing. |
| `src/app/core/auth/domain/` | Moved | Pure TS — ported unchanged. |
| `src/app/core/auth/application/.../auth-state.service.ts` | Rewritten | Signals → Zustand store. |
| `src/app/core/auth/infrastructure/interceptors/auth.interceptor.ts` | Rewritten | RxJS Subject mutex → ky `afterError` Promise mutex. **Highest-risk item.** |
| `src/app/core/spaces/domain/` | Moved | Pure TS — ported unchanged. |
| `src/app/core/spaces/application/.../spaces-state.service.ts` | Rewritten | `takeUntilDestroyed()` + RxJS → Zustand + `useEffect` cleanup. |
| `src/app/core/spaces/infrastructure/storage/active-space.storage.ts` | Modified | Drop `@Injectable`, keep localStorage as plain class. |
| `src/app/**/presentation/guards/` | Rewritten | → `middleware.ts` + ShellLayout effect. |
| `src/app/shared/presentation/components/ui/` (7 atoms) | Rewritten | Angular templates → React components (same props API). |
| `src/design-system/*.css`, `src/styles.css` | Moved | Framework-agnostic — ported as-is. |
| `karma.conf.js`, all `.spec.ts` | Rewritten | → Vitest + RTL. |
| `.github/workflows/*`, `Dockerfile`, `eslint` config | Modified | Build/test/lint commands updated; nginx stage preserved. |

## Risks

| # | Risk | Likelihood | Mitigation |
|---|------|------------|------------|
| 1 | **Auth interceptor 401-refresh mutex** — concurrent-request queue (`isRefreshing` flag + `Subject<string\|null>`) is a subtle pattern; incorrect port causes duplicate refreshes, token races, or stuck requests. | High | **Spike the ky `afterError` Promise-mutex BEFORE Phase 2 commits to ky.** Write the concurrency test (N parallel 401s → single refresh) first. Gate Phase 2 on a passing spike. |
| 2 | **`@angular/cdk` unknown usage** — exact primitives unscanned; could be trivial or a complex overlay/portal. | Medium | **Audit HTML templates in Phase 1** before sizing. Choose Radix vs Headless UI only after the audit. Surface findings to re-estimate Phase 1/3. |
| 3 | **spaceGuard HTTP call in middleware** — Edge Runtime cannot call internal APIs; forces design change with a UX flash risk on redirect. | Medium | Middleware checks cookie presence only; move space resolution to ShellLayout client effect. Add a loading skeleton to mask the resolution flash. |
| 4 | **Reactive Forms → React Hook Form** — 3 forms; validation parity (sync/async validators, error messages) must match. | Medium | Map each Angular validator to an RHF rule/zod schema explicitly; port the existing form spec assertions to RTL. |
| 5 | **Test migration (~15 spec files)** — domain/application tests migrate near-zero; component tests need full RTL rewrites. | Low | Migrate domain/application specs first (highest reuse). Rewrite component specs alongside each component port, not in a separate pass. |
| 6 | **EventBus lifecycle** — `takeUntilDestroyed()` → `useEffect` cleanup; easy to leak a subscription if missed in a subscriber component. | Low | Establish a single `useEventBus` hook with built-in `useEffect` unsubscribe; lint/review for direct `EventBus.subscribe` calls in components. |

## Rollback Plan

- The migration happens on a feature branch (or chained PRs) targeting `main`. Angular `main` remains the production source until the final cutover merge.
- **Cutover is the last merge** (Phase 5). Until then, production keeps shipping from the Angular tree.
- If a phase fails acceptance, the feature branch is held — production is unaffected because the Angular build/Docker pipeline is untouched until cutover.
- Post-cutover regression: `git revert` the cutover merge restores the Angular app and its CI/Docker pipeline intact (preserved in git history, removed only in Phase 5).
- The nginx static-serving layer is unchanged across both stacks, so deployment infra needs no rollback.

## Dependencies

- Next.js 15, Zustand, ky, react-hook-form, lucide-react, Vitest, @testing-library/react — all pnpm-installable.
- Radix UI or Headless UI — **selection blocked on the Phase 1 `@angular/cdk` audit**.
- No backend/API changes required; API contract is a hard dependency that stays fixed.

## Estimated Effort

> Rough order-of-magnitude. Total ≈ **3–6 weeks** for a small (~40-file) codebase. PRs sized to the 400-line review budget — expect chained PRs per phase.

| Phase | Estimate | PRs |
|-------|----------|-----|
| 1 — Scaffold + design system + UI atoms + CI/Docker + CDK audit | 3–5 days | 2–3 chained |
| 2 — Auth (incl. mutex spike) | 4–7 days | 3–4 chained |
| 3 — Spaces | 3–5 days | 2–3 chained |
| 4 — Integration + smoke | 1–2 days | 1 |
| 5 — Cleanup (remove Angular) | 1 day | 1 |

**Critical path / front-loaded risk**: the Phase 2 mutex spike. Resolve it early — it gates the ky commitment.

## Success Criteria

- [ ] All critical flows pass: login, register, token refresh (incl. concurrent 401s → single refresh), space create, space list/select, multitenant `X-Space-ID` header on every authenticated request.
- [ ] Feature parity with the Angular app — no behavior or UX regressions.
- [ ] `domain/` layers ported unchanged (no logic diffs); DDD + Hexagonal layering preserved (domain imports nothing from infrastructure/presentation).
- [ ] Vitest + RTL suite green; domain/application coverage ≥ existing levels.
- [ ] CI green (lint, typecheck, test, build) on the new stack; Docker builds and serves via the **unchanged** nginx stage.
- [ ] All Angular dependencies, Karma config, and Angular ESLint config removed; `package.json` Angular-free.
- [ ] `@angular/cdk` replacement complete with parity for all audited primitives.
