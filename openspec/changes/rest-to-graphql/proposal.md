# Proposal: REST → GraphQL Migration (non-auth transports)

## Intent

gardenia-api exposes a production-ready, code-first GraphQL API covering every non-auth context (spaces, plants, planting spots, plant species, qr). gardenia-web already ships Apollo Client v4 + `graphql@16`, with `ApolloClientProvider` wired into the root tree — but the client is bare (no auth, no `X-Space-ID`, no error handling) and the app still talks REST through Axios for spaces and plants.

This change consolidates non-auth data access onto a single, typed GraphQL transport: one normalized cache, one request pipeline, and an API surface that matches the backend's authoritative schema. It removes the dual-transport drift (Axios for data, Apollo idle) and pays down the infrastructure debt left by the prior Apollo install.

## Scope

### In Scope
- Extend `apollo.client.ts` with an `ApolloLink` chain: `authLink` (JWT from Zustand) + `spaceLink` (`X-Space-ID` from `useSpacesStore`) + `onError` (token refresh) + `httpLink`.
- Replace `SpacesHttpRepository` with a GraphQL adapter (`spacesFindByUser`, `spaceCreate`).
- Replace `PlantsHttpRepository` with a GraphQL adapter (`plantsFindByCriteria`, `plantFindById`).
- Port token-refresh mutex (`refreshTokenOnce`) into the Apollo `onError` link.
- New unit specs using `MockedProvider` (`@apollo/client/testing`) replacing Axios mocks.
- Document `NEXT_PUBLIC_GRAPHQL_URL` in env reference.

### Out of Scope
- Auth migration — `login/register/logout/refresh/me/forgot-password` stay REST.
- GraphQL Codegen / typed documents (deferred; schema-drift accepted at runtime for now).
- Subscriptions / real-time.
- Any backend change (missing `JwtAuthGuard` on plant queries, public `users*` resolvers — flagged, not fixed here).
- Migrating other contexts (planting spots, plant species, qr) — only the repos the frontend uses today.

## Capabilities

> This migration is an infrastructure-layer refactor. Application ports (`ISpacesRepository`, `IPlantsRepository`) and observable behavior are unchanged — only the transport swaps.

### New Capabilities
None.

### Modified Capabilities
None. No spec-level requirement changes; port contracts and presentation behavior stay identical.

## Approach

Adopt **Apollo with link chain, scoped strictly to the infrastructure layer** (exploration Option 1 — zero new dependencies). The repository pattern isolates the change: presentation and application layers stay untouched because the ports do not change. Each HTTP repository is replaced by an Apollo-backed adapter implementing the same port.

Header injection mirrors today's Axios interceptors via composable links: `authLink` reads the access token from the auth store, `spaceLink` reads the active space id from `useSpacesStore`. Token refresh — the highest-risk piece — is replicated in an `onError` link that reuses the existing `refreshTokenOnce` mutex and retries the failed operation via Observable chaining, avoiding duplicate concurrent refreshes.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/infrastructure/http/apollo.client.ts` | Modified | Add authLink + spaceLink + onError refresh link |
| `src/core/spaces/infrastructure/repositories/spaces-http.repository.ts` | Modified | Swap REST calls for `spacesFindByUser` / `spaceCreate` |
| `src/core/plants/infrastructure/repositories/plants-http.repository.ts` | Modified | Swap REST calls for `plantsFindByCriteria` / `plantFindById` |
| `src/core/{spaces,plants}/application/ports/*.repository.port.ts` | Unchanged | Port interfaces stay identical |
| `src/core/**/repositories/*.spec.ts` | Modified | Axios mocks → `MockedProvider` |
| `auth-http.repository.ts` + Axios client | Unchanged | Auth stays REST |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Token refresh race in `onError` link | High | Reuse `refreshTokenOnce` mutex; chain retry via Observable, single in-flight refresh |
| `X-Space-ID` stale/empty on store hydration | Med | Read store at request time in `spaceLink`; guard space-scoped ops until hydrated; honor `@SkipSpace` ops |
| `MockedProvider` test pattern unfamiliar | Med | Add shared Apollo test util; one reference spec before broad rollout |
| `NEXT_PUBLIC_GRAPHQL_URL` undocumented/unset | Med | Document in env reference; fail fast on missing var |
| Plant queries lack `JwtAuthGuard` on backend | Low | Backend concern — flag only, no frontend action |

## Rollback Plan

Change is confined to the infrastructure layer behind unchanged ports. Revert the two repository files and `apollo.client.ts` to their REST/Axios versions (or `git revert` the change commits) — presentation and application layers require no rollback. The Axios client stays in place throughout, so reverting restores full REST behavior immediately.

## Dependencies

- Apollo Client v4 (`@apollo/client@^4.2.0`) and `graphql@^16.14.0` — already installed.
- gardenia-api GraphQL endpoint reachable via `NEXT_PUBLIC_GRAPHQL_URL`.

## Success Criteria

- [ ] `SpacesHttpRepository` and `PlantsHttpRepository` resolve via GraphQL through the extended Apollo client.
- [ ] No non-auth REST calls remain for spaces/plants; auth still uses REST.
- [ ] `X-Space-ID` and JWT are injected on every space-scoped GraphQL request.
- [ ] Token refresh works on expired-token GraphQL errors without duplicate refresh calls.
- [ ] All repository specs pass with `MockedProvider`; strict-TDD suite green.
- [ ] `NEXT_PUBLIC_GRAPHQL_URL` documented in the env reference.
