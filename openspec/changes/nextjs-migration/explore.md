# Exploration: Migrate gardenia-web Angular 20 → Next.js (latest) with pnpm

## Current State

**pnpm**: Already the package manager (`packageManager: "pnpm@9.15.4"` in `package.json`, `angular.json` cli.packageManager, Dockerfile via corepack, all CI scripts). Zero migration cost here.

**Codebase size**: ~40 TypeScript files across 2 bounded contexts (auth, spaces) + shared. Small project.

### What's framework-agnostic and portable as-is

- All `domain/` layers per context — pure TypeScript, zero Angular imports
- `src/design-system/*.css` — pure CSS, Tailwind v4 `@theme` tokens
- `src/styles.css` — `@import "tailwindcss"` + design system, identical in Next.js
- `EventBusService` — RxJS Subject, works anywhere

### What must be replaced

| Angular construct | Files affected | Next.js replacement |
|---|---|---|
| `signal()` / `computed()` / `input()` | AuthStateService, SpacesStateService, all components | Zustand store + `useMemo` + React props |
| `HttpClient` + functional interceptors | auth.interceptor.ts, auth-http.repository.ts | `ky` with `beforeRetry`/`afterError` hooks |
| `InjectionToken` + `inject()` DI | AUTH_REPOSITORY, SPACES_REPOSITORY, API_URL | TypeScript module singletons + `process.env.NEXT_PUBLIC_API_URL` |
| `CanActivateFn` guards | auth.guard.ts, guest.guard.ts, space.guard.ts | Next.js `middleware.ts` (cookie check) + page-level for spaceGuard |
| `ReactiveFormsModule` / `FormBuilder` | login.page.ts, register.page.ts, space-create | React Hook Form |
| `takeUntilDestroyed()` | SpacesStateService constructor | `useEffect` cleanup |
| `@lucide/angular` | icon.ts | `lucide-react` (direct package swap) |
| `RouterOutlet` / `loadComponent` | app.ts, app.routes.ts | Next.js App Router file-system routing |
| Angular components (all pages/UI atoms) | 7 UI atoms + LoginPage, RegisterPage, SpaceCreatePage, SpaceListPage, ShellLayout | React components |
| Karma + Jasmine | karma.conf.js, all `.spec.ts` | Vitest + React Testing Library |

## Affected Areas

`/src/main.ts`, `/src/app/app.ts`, `/src/app/app.config.ts`, `/src/app/app.routes.ts` — Angular bootstrap, full replacement.

`/src/app/core/auth/infrastructure/interceptors/auth.interceptor.ts` — Most complex migration item. The concurrent 401 refresh mutex using a module-level `isRefreshing` flag + RxJS `Subject<string | null>` must be ported to a ky `afterError` hook using a shared `Promise` mutex. Non-trivial.

`/src/app/core/auth/application/services/auth-state/auth-state.service.ts` — Angular singleton with signals → Zustand store.

`/src/app/core/spaces/application/services/spaces-state/spaces-state.service.ts` — Uses `takeUntilDestroyed()` inside constructor + RxJS Observable chain. Rewrite as Zustand store with async actions + `useEffect` cleanup.

`/src/app/shared/presentation/components/ui/` — 7 Angular components → 7 React components. Props API is largely the same; template syntax changes.

`/src/app/core/auth/presentation/guards/` + `/src/app/core/spaces/presentation/guards/` → `middleware.ts` at Next.js root.

**spaceGuard special case**: The current guard calls `loadSpaces()` (HTTP) inside the guard function. Next.js middleware runs on the Edge Runtime — calling arbitrary internal APIs from middleware is complex. Recommended design: middleware only checks cookie/token presence; space resolution logic moves into the `ShellLayout` React component as a client-side effect with redirect.

`/src/app/core/spaces/infrastructure/storage/active-space.storage.ts` — Remove `@Injectable`, keep localStorage logic as a plain class or module function.

## Approaches

| Approach | Pros | Cons | Effort |
|---|---|---|---|
| **A — Big Bang greenfield** | Clean slate, App Router from day one, no legacy drag | Feature freeze, all work blocked until complete | High |
| **B — Strangler Fig (parallel SPAs)** | Continuous delivery, low risk per slice | In-memory access token CANNOT be shared between SPAs — FATAL; double infra + double CI | Very High |
| **C — Phased Big Bang (DDD-preserving)** | Domain/application layers port independently before React exists; each phase is testable and reviewable; no legacy drag | Still a feature freeze window | Medium-High |

**Option B is eliminated**: the access token is in-memory (`AuthStateService._accessToken` signal / future Zustand store). Two separate browser SPAs running on different origins cannot share in-memory state.

## Recommendation

**Option C — Phased Big Bang preserving DDD layer structure.**

**Rationale**:
- Project is small (~40 files, 2 contexts). A phased big bang is tractable in 3–6 weeks.
- `domain/` and most of `application/` have zero Angular imports — they port as pure TypeScript moves with no logic changes.
- pnpm is already in place.
- Tailwind v4 + CSS design tokens are framework-agnostic — zero rework.
- Static export (`output: 'export'`) keeps the nginx Docker deployment unchanged, reducing risk.

**Proposed phases**:

1. **Scaffold**: Next.js 15 (App Router, TypeScript strict, Tailwind v4, static export) + port design system + 7 UI atoms + set up Vitest + RTL + update CI/Docker
2. **Auth domain**: port `auth/domain/` → `AuthStateService` → Zustand → `AuthHttpRepository` → ky → auth interceptor (mutex spike first) → LoginPage/RegisterPage (RHF) → middleware guards
3. **Spaces domain**: port `spaces/domain/` → `SpacesStateService` → Zustand → `ActiveSpaceStorage` (plain class) → pages/layout → space resolution in ShellLayout
4. **Integration**: wiring, end-to-end smoke test
5. **Cleanup**: remove all Angular dependencies, update eslint config, remove karma

**Tech stack decisions**:
- HTTP: `ky` (lightweight fetch wrapper, `beforeRetry`/`afterError` = Angular interceptor equivalent)
- State: Zustand (works outside React tree — critical for the ky interceptor reading access token without hooks)
- Forms: React Hook Form
- Icons: `lucide-react` (direct swap for `@lucide/angular`)
- CDK replacement: Radix UI or Headless UI — CANNOT confirm until `@angular/cdk` usage is audited from HTML templates
- Testing: Vitest + RTL

## Risks

1. **Auth interceptor refresh mutex** — Severity: HIGH. The concurrent 401 queue (`isRefreshing` flag + `Subject<string | null>`) is a subtle pattern. Spike this before Phase 2 commits to ky.
2. **@angular/cdk unknown usage** — Severity: MEDIUM. Exact CDK primitives in use are unknown (HTML templates not scanned). Could range from simple focus trap to complex overlay. Must audit HTML templates before estimating CDK replacement effort.
3. **spaceGuard HTTP call in middleware** — Severity: MEDIUM. Edge Runtime limitation forces design change (middleware → page-level redirect). UX flash risk.
4. **Reactive Forms → React Hook Form** — Severity: MEDIUM. 3 forms identified. Manageable but requires attention to validation parity.
5. **Test migration (~15 spec files)** — Severity: LOW. Domain/application tests migrate near-zero; component tests need RTL rewrites.
6. **EventBus lifecycle** — Severity: LOW. `takeUntilDestroyed()` → `useEffect` cleanup. Easy to miss in subscriber components.
