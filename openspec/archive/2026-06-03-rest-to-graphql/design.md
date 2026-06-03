# Design: REST → GraphQL Migration (non-auth transports)

## Technical Approach

Extend the existing bare `apolloClient` with a composable link chain that mirrors the current Axios interceptors (`authLink → spaceLink → onError → httpLink`), then reimplement `SpacesHttpRepository` and `PlantsHttpRepository` as GraphQL adapters behind their unchanged ports (`ISpacesRepository`, `IPlantsRepository`). Auth stays on Axios. The change is confined to the infrastructure layer; presentation/application are untouched. Token refresh reuses the existing `refreshTokenOnce` mutex and the Axios `bareHttp.post('/auth/refresh')` flow (refresh token lives in an httpOnly cookie — there is NO `refreshToken` field in the Zustand store).

## Architecture Decisions

| Decision | Choice | Alternatives rejected | Rationale |
|---|---|---|---|
| Client injection | Import the `apolloClient` singleton directly in each repo (matches `http` import in current repos) | Constructor injection / DI container | No DI in this codebase; singleton mirrors existing pattern and keeps `new XRepository()` test ergonomics |
| GQL document location | Co-locate `gql` tagged-template consts in each repo file (`SPACES_FIND_BY_USER`, `SPACE_CREATE`, `PLANTS_FIND_BY_CRITERIA`, `PLANT_FIND_BY_ID`) | Separate `.graphql` files + codegen | Codegen is OUT of scope; inline `gql` keeps the change small and self-contained |
| Refresh in onError | Reuse `refreshTokenOnce(doRefresh)` from `refresh-mutex.ts`; export `doRefresh` from `axios.client.ts` | Duplicate refresh logic in Apollo | Single in-flight refresh shared across BOTH transports prevents the HIGH-risk race; `doRefresh` already updates the auth store |
| Header sourcing | Links read Zustand `getState()` at request time inside `setContext`/`ApolloLink` | Snapshot headers at client init | Tokens/space rotate; request-time read matches Axios interceptor behavior |
| userId / spaceId origin | Repos read `useAuthStore.getState().currentUser.id` and `useSpacesStore.getState().currentSpaceId` internally | Add params to ports | Ports take no args (`listByUser()`, `list()`); must NOT change port signatures |

## Data Flow

    Repo.method() ──gql query/mutate──→ apolloClient
         │
         ▼
    authLink (Bearer from useAuthStore) ─→ spaceLink (X-Space-ID from useSpacesStore, skip if null)
         │
         ▼
    onError ──401/UNAUTHENTICATED?──→ refreshTokenOnce(doRefresh) ──→ setAccessToken
         │ no                              │ token        │ null
         ▼                                 ▼              ▼
       httpLink (POST GRAPHQL_URL)   forward(operation)  clearAuth() + surface error

## File Changes

| File | Action | Description |
|---|---|---|
| `src/shared/infrastructure/http/apollo.client.ts` | Modify | Add `authLink`, `spaceLink`, `onError` link; compose `from([...])` before `httpLink` |
| `src/shared/infrastructure/http/axios.client.ts` | Modify | `export` `doRefresh` so the Apollo `onError` link reuses the same refresh + store-update |
| `src/core/spaces/infrastructure/repositories/spaces-http.repository.ts` | Modify | Swap Axios for `apolloClient.query`/`mutate`; inline `gql` docs; read `currentUser.id` |
| `src/core/plants/infrastructure/repositories/plants-http.repository.ts` | Modify | Swap Axios for `apolloClient.query`; `plantsFindByCriteria` from store, `plantFindById` |
| `src/core/spaces/infrastructure/repositories/spaces-http.repository.spec.ts` | Create | MockedProvider/mocked-`apolloClient` spec |
| `src/core/plants/infrastructure/repositories/plants-http.repository.spec.ts` | Modify | Replace Axios mock with mocked `apolloClient` |
| `.env.example` / README | Modify | Document `NEXT_PUBLIC_GRAPHQL_URL` |

File names keep the `-http` suffix to minimize diff/import churn (rename is OUT of scope; transport-agnostic naming can follow later).

## Interfaces / Contracts

Ports unchanged. Backend operations bound per method:
- `listByUser()` → `spacesFindByUser(userId: String!) [Space!]!` (@SkipSpace) — userId from auth store
- `create(name)` → `spaceCreate(input: CreateSpaceInput!) Space!` (@SkipSpace)
- `list()` → `plantsFindByCriteria(criteria: FindPlantCriteriaInput!) [Plant!]!` — criteria `{ spaceId }` from spaces store
- `getById(id)` → `plantFindById(id: String!) Plant`

Token refresh Observable (Apollo v4 `onError`, the HIGH-risk core):

```ts
import { onError } from '@apollo/client/link/error';
import { Observable } from '@apollo/client';
import { refreshTokenOnce } from '@/core/auth/infrastructure/http/refresh-mutex';
import { doRefresh } from '@/shared/infrastructure/http/axios.client';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

const onErrorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  const unauthorized =
    (networkError as { statusCode?: number })?.statusCode === 401 ||
    graphQLErrors?.some((e) => e.extensions?.code === 'UNAUTHENTICATED');
  if (!unauthorized || operation.getContext().__retried) return;

  return new Observable((observer) => {
    refreshTokenOnce(doRefresh)
      .then((token) => {
        if (!token) {
          useAuthStore.getState().clearAuth();
          observer.error(networkError ?? graphQLErrors?.[0]);
          return;
        }
        operation.setContext({ __retried: true }); // authLink re-reads fresh token from store
        forward(operation).subscribe(observer);     // retry once, pipe to original observer
      })
      .catch((err) => observer.error(err));
  });
});
```

`authLink` re-reads `accessToken` at retry time, so no manual header rewrite is needed. `__retried` context guard prevents infinite loops (mirrors Axios `_retry`).

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit | Each repo method issues correct document + variables, maps result, propagates errors | `vi.mock('@/shared/infrastructure/http/apollo.client')` exposing `{ query, mutate }` as `vi.fn()`; assert `query` called with `{ query: DOC, variables }`; mirrors existing plants spec style |
| Unit | Link chain (optional) | Prefer mocking `apolloClient` per above; `MockedProvider` reserved for component-level tests, not infra repos |
| Strict TDD | All repo specs RED→GREEN via vitest before implementation | Required by project strict-TDD gate |

Mock GQL responses live inline in each spec (matching `mockPlants`/`mockPlant` convention). userId/spaceId sourcing tested by stubbing `useAuthStore.getState`/`useSpacesStore.getState`.

## Migration / Rollout

No data migration. Axios client stays in place; reverting the two repo files + `apollo.client.ts` restores REST immediately. `NEXT_PUBLIC_GRAPHQL_URL` must be set (fail-fast already defaults to `localhost:3001/graphql`).

## Open Questions

- [ ] Does the GQL endpoint return 401 as `networkError.statusCode` or only as `UNAUTHENTICATED` extension? Design handles both; confirm against gardenia-api to drop dead branch.
- [ ] `plantsFindByCriteria` shape of `FindPlantCriteriaInput` beyond `spaceId` (pagination?) — current port returns flat `Plant[]`, so assume `{ spaceId }` only.
