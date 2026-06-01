# Proposal: Multi-tenant Frontend (Spaces) — Phase 1

## Intent

The API is multi-tenant: every authenticated non-auth request requires an `X-Space-ID` header, and the user is rejected (400) without it. The frontend has ZERO space awareness — it discards the `spaceId` returned by `POST /auth/register` (active bug), never injects `X-Space-ID`, and has no authenticated shell. This change establishes the minimum space foundation so any authenticated feature can work.

## Scope

### In Scope
- Fix register bug: capture and persist the returned `spaceId`.
- New `core/spaces/` DDD domain: interfaces, models, repository port, state service, HTTP repository (API calls stubbed).
- `X-Space-ID` header injection in `authInterceptor` (from active space signal, skipped when absent or on auth endpoints).
- Init sequence: auth → load spaces → set active space → enable protected routes.
- Persist active `spaceId` across reloads via `localStorage`.
- Authenticated shell with `authGuard` + a `spaceGuard`; header shows active space name (display only).
- Basic routes: `/spaces` list, `/spaces/new` create (UI wired, API stubbed).

### Out of Scope
- Space switcher UI (Phase 2).
- Member management (add/remove/roles), space settings (Phase 2).
- API REST controller implementation (built in parallel by API team).
- Real HTTP calls — left as `TODO: implement when API is ready`.

## Capabilities

### New Capabilities
- `spaces`: frontend space domain — load user spaces, set/persist active space, expose `X-Space-ID` context.
- `space-context`: header injection + init sequence gating protected routes on a resolved active space.

### Modified Capabilities
- `auth`: register must return and persist `spaceId`; `AuthStateService` gains active-space awareness.

## Approach

Phased (Option 3, Phase 1). Build the `core/spaces/` domain mirroring `core/auth/` layering. `SpacesStateService` holds `availableSpaces` + `currentSpaceId` signals, hydrated from `localStorage` on init. Interceptor reads the active space signal. All HTTP methods in `spaces-http.repository.ts` are compile-ready TODO stubs (typed signatures, `TODO: implement when API is ready`), so the domain compiles and integrates the moment the API ships. Register fix flows the `spaceId` from response → state → `localStorage`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `core/auth/.../auth-response.interface.ts`, `auth.repository.port.ts`, `auth-http.repository.ts`, `register.service.ts` | Modified | Return/capture `spaceId` |
| `core/auth/.../auth-state.service.ts` | Modified | Active space signal + persistence |
| `core/auth/.../auth.interceptor.ts` | Modified | Inject `X-Space-ID` |
| `core/spaces/**` | New | Full DDD domain (stubbed HTTP) |
| `app.routes.ts`, `app.ts`, `shared/.../header.ts` | Modified | Shell, routes, space name display |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| API spaces endpoints not ready | High | HTTP repo as compile-ready TODO stubs; domain ships independently |
| Active space lost on refresh | Med | Persist `spaceId` in `localStorage`, rehydrate on init |
| `X-Space-ID` sent null before spaces load | Med | Interceptor skips header when absent; `spaceGuard` blocks protected routes until resolved |

## Rollback Plan

All changes are additive or isolated. Revert the feature commit/PR: new `core/spaces/` folder is deleted, auth/interceptor/routes diffs reverted. No migrations, no API contract changes from our side. App returns to login/register-only state.

## Dependencies

- API REST controller for spaces (`GET /spaces`, `POST /spaces`) — parallel work, required only for end-to-end integration, not for merge.

## Success Criteria

- [ ] Register persists `spaceId`; survives reload via `localStorage`.
- [ ] `core/spaces/` domain compiles with typed, stubbed HTTP repository.
- [ ] `X-Space-ID` injected on authenticated requests when an active space exists.
- [ ] Protected routes gated behind `authGuard` + `spaceGuard`; header shows active space name.
- [ ] No real HTTP calls block compilation — all stubbed with TODOs.
