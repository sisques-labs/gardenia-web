# Tasks: REST → GraphQL Migration (non-auth transports)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 350–480 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 — Apollo link chain · PR 2 — Spaces repo · PR 3 — Plants repo + cleanup |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Apollo link chain (authLink, spaceLink, onError) + doRefresh export | PR 1 | Base: `fix/plants-ui-visual-gaps`; self-contained; no repo changes |
| 2 | SpacesHttpRepository → GQL adapter + unit tests | PR 2 | Base: PR 1 branch |
| 3 | PlantsHttpRepository → GQL adapter + unit tests + env doc + cleanup | PR 3 | Base: PR 2 branch; final integration |

---

## Phase 1 — Apollo Link Chain (PR 1)

### 1.1 Export `doRefresh` from `axios.client.ts`
- [x] 1.1 RED — write failing test in `src/shared/infrastructure/http/apollo.client.spec.ts` asserting that `doRefresh` is importable from `axios.client.ts` and returns the new token string (mock `bareHttp.post`).
- [x] 1.2 GREEN — add `export` keyword to `doRefresh` in `src/shared/infrastructure/http/axios.client.ts`.
- [x] 1.3 REFACTOR — verify no circular import is introduced; confirm existing Axios interceptor test still passes.

### 1.2 `authLink` — Authorization header
- [x] 1.4 RED — in `apollo.client.spec.ts`, test that a request dispatched when `useAuthStore.getState().accessToken` is `'tok123'` carries `Authorization: Bearer tok123`; assert header is absent when token is `null`. Mock `useAuthStore`.
- [x] 1.5 GREEN — add `authLink` using `new ApolloLink` (or `setContext`) in `src/shared/infrastructure/http/apollo.client.ts`; reads `useAuthStore.getState().accessToken` at request time.
- [x] 1.6 REFACTOR — extract store reads into named helpers if repeated; confirm no construction-time snapshot.

### 1.3 `spaceLink` — X-Space-ID header
- [x] 1.7 RED — test that a request with non-null `useSpacesStore.getState().currentSpaceId` carries `X-Space-ID: {id}`; test that absent space ID omits the header (does not send empty string).
- [x] 1.8 GREEN — add `spaceLink` using `new ApolloLink` or `setContext` in `apollo.client.ts`; reads `useSpacesStore.getState().currentSpaceId` at request time; skips header when null.
- [x] 1.9 REFACTOR — ensure link composes cleanly after `authLink`.

### 1.4 `onError` link — 401/UNAUTHENTICATED refresh + retry
- [x] 1.10 RED — test: 401 networkError triggers `refreshTokenOnce(doRefresh)` → retry once with `__retried` flag; second failure calls `clearAuth`; concurrent 401s deduplicate via mutex (3 scenarios from spec).
- [x] 1.11 GREEN — implement `onError` link in `apollo.client.ts` per the Observable pattern from design; use `operation.getContext().__retried` guard; call `useAuthStore.getState().clearAuth()` on refresh failure.
- [x] 1.12 REFACTOR — ensure `forward(operation).subscribe(observer)` path handles both `graphQLErrors` UNAUTHENTICATED and `networkError.statusCode === 401`.

### 1.5 Compose final link chain
- [x] 1.13 GREEN — wire `from([authLink, spaceLink, onError, httpLink])` as the Apollo client `link` in `apollo.client.ts`; remove bare `httpLink` assignment.
- [x] 1.14 RED→GREEN — test that `apolloClient.link` chain order matches spec (`authLink → spaceLink → onError → httpLink`) by asserting request header presence in integration-style unit test.

---

## Phase 2 — Spaces GQL Repository (PR 2)

### 2.1 GQL document constants
- [ ] 2.1 RED — in `src/core/spaces/infrastructure/repositories/spaces-http.repository.spec.ts` (new file), write a failing test asserting `SPACES_FIND_BY_USER` and `SPACE_CREATE` gql consts are defined and have `kind === 'Document'`.
- [ ] 2.2 GREEN — add inline `gql` constants `SPACES_FIND_BY_USER` and `SPACE_CREATE` at the top of `src/core/spaces/infrastructure/repositories/spaces-http.repository.ts`.

### 2.2 `listByUser()` via GQL
- [ ] 2.3 RED — test: mock `apolloClient` (`vi.mock('@/shared/infrastructure/http/apollo.client')`); stub `useAuthStore.getState().currentUser.id` as `'user-1'`; assert `apolloClient.query` is called with `{ query: SPACES_FIND_BY_USER }` and returns mapped `Space[]`.
- [ ] 2.4 GREEN — replace `http.get('/spaces')` in `SpacesHttpRepository.listByUser()` with `apolloClient.query({ query: SPACES_FIND_BY_USER })`; map `data.spacesFindByUser` to `Space[]`; read `userId` from auth store internally.
- [ ] 2.5 REFACTOR — remove `http` import from `spaces-http.repository.ts` if no longer used.

### 2.3 `create()` via GQL
- [ ] 2.6 RED — test: assert `apolloClient.mutate` is called with `{ mutation: SPACE_CREATE, variables: { name } }` and returns the created `Space`.
- [ ] 2.7 GREEN — replace `http.post('/spaces', { name })` with `apolloClient.mutate({ mutation: SPACE_CREATE, variables: { name } })`; map `data.spaceCreate`.
- [ ] 2.8 REFACTOR — verify return types match `ISpacesRepository` port exactly; no extra properties leaked.

### 2.4 Error propagation — Spaces
- [ ] 2.9 RED — test: when `apolloClient.query` rejects, `listByUser()` propagates the error; when `apolloClient.mutate` rejects, `create()` propagates the error.
- [ ] 2.10 GREEN — confirm no silent swallowing; no try/catch that masks errors.

---

## Phase 3 — Plants GQL Repository (PR 3)

### 3.1 GQL document constants
- [ ] 3.1 RED — in existing `src/core/plants/infrastructure/repositories/plants-http.repository.spec.ts`, add failing tests asserting `PLANTS_FIND_BY_CRITERIA` and `PLANT_FIND_BY_ID` gql consts have `kind === 'Document'`.
- [ ] 3.2 GREEN — add inline `gql` constants in `src/core/plants/infrastructure/repositories/plants-http.repository.ts`.

### 3.2 `list()` via GQL
- [ ] 3.3 RED — update spec: mock `apolloClient`; stub `useSpacesStore.getState().currentSpaceId` as `'space-1'`; assert `apolloClient.query` is called with `{ query: PLANTS_FIND_BY_CRITERIA, variables: { criteria: { spaceId: 'space-1' } } }` and maps to `Plant[]`; assert empty result returns `[]`.
- [ ] 3.4 GREEN — replace `http.get('/plants')` with `apolloClient.query({ query: PLANTS_FIND_BY_CRITERIA, variables: { criteria: { spaceId } } })`; read `spaceId` from spaces store; map `data.plantsFindByCriteria.items` → `Plant[]`.
- [ ] 3.5 REFACTOR — remove `PlantsListResponse` interface if response shape is now typed by GQL result; remove stale `http` import.

### 3.3 `getById()` via GQL
- [ ] 3.6 RED — test: assert `apolloClient.query` called with `{ query: PLANT_FIND_BY_ID, variables: { id } }` and returns mapped `Plant`.
- [ ] 3.7 GREEN — replace `http.get('/plants/${id}')` with `apolloClient.query({ query: PLANT_FIND_BY_ID, variables: { id } })`; map `data.plantFindById`.
- [ ] 3.8 REFACTOR — confirm `PlantsHttpRepository` no longer imports `http`; verify port compliance.

### 3.4 Error propagation — Plants
- [ ] 3.9 RED — test: `list()` propagates query rejection; `getById()` propagates query rejection.
- [ ] 3.10 GREEN — confirm no silent error swallowing.

---

## Phase 4 — Env Documentation + Cleanup (PR 3 continued)

- [ ] 4.1 Verify `.env.example` exists or locate the project's env reference file; add `NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql` with a comment.
- [ ] 4.2 Run `rg 'http\.get\|http\.post' src/core/spaces src/core/plants` — confirm zero REST calls remain in the two migrated repos.
- [ ] 4.3 Run `rg "from '@/shared/infrastructure/http/axios.client'" src/core/spaces src/core/plants` — confirm `http` import is gone from both migrated repository files (non-auth).
- [ ] 4.4 Confirm `src/core/auth` files are untouched (REST stays); run full vitest suite — all tests green.
