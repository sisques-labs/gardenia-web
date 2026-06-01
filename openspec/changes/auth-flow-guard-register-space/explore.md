# Exploration: auth-flow-guard-register-space

## Current State

### Routing (`app.routes.ts`)
Three guards already exist and are wired:
- `authGuard` — redirects unauthenticated to `/login` (with `returnUrl`). Applied to root `''` protected zone.
- `guestGuard` — redirects authenticated users away from `/login` and `/register` back to `/`.
- `spaceGuard` — applied alongside `authGuard` on root; loads spaces lazily, redirects to `/spaces/new` if none found.

**Critical gap**: `/spaces/new` has NO guard — an unauthenticated user can reach it directly.

### AuthStateService
- `isAuthenticated = computed(() => this._accessToken() !== null)` — pure signal, no localStorage persistence.
- `clearSession()` navigates to `/login`.
- Fully signal-compliant.

### SpacesStateService
- Exposes `currentSpace` (computed signal), `availableSpaces`, `isResolved`, `isLoading`.
- Constructor subscribes to `UserRegisteredEvent` via EventBus and calls `setActiveSpace(event.spaceId)` — space is set in memory immediately after register.
- `loadSpaces()` resolves from `ActiveSpaceStorage` (localStorage).

### RegisterPage
- Form: `email` + `password` only. No space name field.
- Flow: `register()` → `login()` → navigate to `/`.
- Backend already auto-creates a default space and returns `spaceId` in `RegisterResponse`.
- Space gets wired via event bus post-register — already works end-to-end.

### AuthInterceptor
- ALREADY injects `X-Space-ID` from `spacesState.currentSpace()` for all non-auth requests.
- Skips `/auth/*` — correct behavior.
- **No changes needed here.**

## Gaps Found

1. No guard to redirect unauthenticated users to `/register` (currently goes to `/login`)
2. `/spaces/new` is reachable by unauthenticated users (security gap)
3. RegisterPage does not include a `spaceName` field (open question: is it required?)

## Approach Options

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| A. New `register.guard.ts` | Clean DDD, testable, follows naming | Minor duplication with `authGuard` | Low |
| B. Parameterize `authGuard` as factory | No duplication | Breaks existing API, over-engineering | Medium |
| C. Route `data` in `authGuard` | No new file | Magic strings, harder to test | Low |
| D. Add `spaceName` to register form | User names their first space | Requires backend contract check | Medium |
| E. Post-register → `/spaces/new` | Reuses existing page | More steps for user | Low |

## Recommendation

**Guard**: Approach A — new `register.guard.ts` that redirects unauthenticated to `/register`. Also fix the `/spaces/new` security gap (add `authGuard`).

**Space on register**: The backend already handles space creation and `SpacesStateService` wires everything via EventBus. The flow already works. The open question is UI only: does the user need to NAME their space during register? If yes → extend form + port + service + backend contract. If no → zero changes needed on the space side.

## Risks

- `/spaces/new` unguarded — fix regardless of this change
- `spaceName` backend contract unknown — must verify before implementing
- `isAuthenticated` is memory-only; hard reload loses token (pre-existing, handled by `RefreshService`, out of scope)
- UX split: some unauthenticated paths → `/login`, others → `/register` must be documented clearly

## Files Affected

| File | Change |
|------|--------|
| `src/app/app.routes.ts` | Apply new guard; add `authGuard` to `/spaces/new` |
| `src/app/core/auth/presentation/guards/register/register.guard.ts` | NEW |
| `src/app/core/auth/presentation/guards/register/register.guard.spec.ts` | NEW |
| `src/app/core/auth/presentation/pages/register/register.page.ts` | Add `spaceName` field (if required) |
| `src/app/core/auth/presentation/pages/register/register.page.html` | Add `spaceName` input (if required) |
| `src/app/core/auth/application/ports/auth.repository.port.ts` | Extend signature (if required) |
| `src/app/core/auth/application/services/register/register.service.ts` | Extend (if required) |
| `src/app/core/auth/infrastructure/repositories/auth-http.repository.ts` | Extend (if required) |
