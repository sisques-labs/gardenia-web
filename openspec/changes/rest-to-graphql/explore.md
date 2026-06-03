# Exploration: REST → GraphQL migration in gardenia-web

## Summary

gardenia-api has a complete, production-ready GraphQL API for all non-auth contexts. gardenia-web already has Apollo Client v4 installed and wired but unused. Migration requires only infrastructure-layer changes: two repository replacements + Apollo link chain for auth/spaceId headers.

---

## Backend (gardenia-api) — GraphQL is production-ready

- `GraphQLModule` with `ApolloDriver`, `autoSchemaFile: true` (code-first), playground enabled
- Auth stays REST — `GET /auth/login`, `/auth/refresh`, etc. are NOT migrated

### Global guards on the GQL endpoint

| Guard | Behavior |
|---|---|
| `OptionalJwtAuthGuard` | Decodes JWT when present, passes through if absent. Applied globally. |
| `SpaceGuard` | Reads `X-Space-ID` header from GQL context. Returns 400 if absent, 403 if not member. Resolvers with `@SkipSpace()` bypass it. |
| `JwtAuthGuard` | Applied per-resolver/mutation for strict protection. |

### Full query/mutation inventory

| Operation | Name | Auth | Space |
|---|---|---|---|
| Query | `spaceFindById` | JWT required | required |
| Query | `spacesFindByUser` | JWT required | @SkipSpace |
| Query | `plantFindById` | OptionalJwt (no explicit guard) | required |
| Query | `plantsFindByCriteria` | OptionalJwt | required |
| Query | `plantingSpotFindById` | JWT required | required |
| Query | `plantingSpotsFindByCriteria` | JWT required | required |
| Query | `plantSpeciesFindById` | JWT required | @SkipSpace |
| Query | `plantSpeciesFindByCriteria` | JWT required | @SkipSpace |
| Query | `qrFindById` | JWT required | depends |
| Query | `usersFindByCriteria` | **none (guard commented out)** | — |
| Query | `userFindById` | **none (guard commented out)** | — |
| Mutation | `spaceCreate` | JWT | @SkipSpace |
| Mutation | `spaceAddMember / spaceRemoveMember` | JWT | required |
| Mutation | `plantCreate / Update / Delete` | JWT | required |
| Mutation | `plantingSpotCreate / Update / Delete` | JWT | required |
| Mutation | `plantSpeciesCreate / Update / Delete` | JWT | @SkipSpace |
| Mutation | `qrRegenerate` | JWT | — |

---

## Frontend (gardenia-web) — current data-fetching map

| Module | File | Current REST call |
|---|---|---|
| spaces | `src/core/spaces/infrastructure/repositories/spaces-http.repository.ts` | `GET /spaces` → listByUser, `POST /spaces` → create |
| plants | `src/core/plants/infrastructure/repositories/plants-http.repository.ts` | `GET /plants` → list, `GET /plants/:id` → getById |
| auth | `src/core/auth/infrastructure/repositories/auth-http.repository.ts` | All `/auth/*` — **STAYS REST** |

### Apollo Client status

- `@apollo/client@^4.2.0` + `graphql@^16.14.0` already installed
- `src/shared/infrastructure/http/apollo.client.ts` exists — bare client pointing to `NEXT_PUBLIC_GRAPHQL_URL` (defaults to `http://localhost:3001/graphql`)
- `ApolloClientProvider` already in root `Providers` tree
- **Missing**: auth header link, X-Space-ID link, token refresh on error

---

## Approach recommendation

**Extend the existing Apollo client with an auth + space link chain.**

The client, provider, and dependencies are already in place. Change is confined to infrastructure layer only — port interfaces do not change.

```ts
const authLink = new ApolloLink((operation, forward) => {
  const token = useAuthStore.getState().accessToken;
  const spaceId = useSpacesStore.getState().currentSpaceId;
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(spaceId ? { 'X-Space-ID': spaceId } : {}),
    },
  }));
  return forward(operation);
});
```

Token refresh on 401 via `onError` link calling the existing `refreshTokenOnce` mutex.

### Alternatives considered

| Approach | Pros | Cons |
|---|---|---|
| Apollo link chain (chosen) | Zero new deps; already installed; normalized cache | Token refresh link non-trivial |
| graphql-request | Tiny, simple, fits repo pattern | Not installed; no cache; manual refresh |
| Apollo + codegen | Full type safety; schema drift caught at build | High init effort; needs CI setup |

---

## Risks

| Risk | Severity |
|---|---|
| Token refresh in Apollo `onError` link (Observable chaining) | HIGH |
| X-Space-ID timing on Zustand store hydration | MEDIUM |
| Missing `NEXT_PUBLIC_GRAPHQL_URL` env documentation | MEDIUM |
| Test pattern change: Axios mocks → Apollo `MockedProvider` | MEDIUM |
| Plant queries missing `JwtAuthGuard` on backend | LOW (backend concern) |
| User resolver guards commented out — public endpoints | LOW (security, not blocker) |

---

## Files affected

- `src/shared/infrastructure/http/apollo.client.ts` — add link chain
- `src/core/spaces/infrastructure/repositories/spaces-gql.repository.ts` — new GQL repo
- `src/core/plants/infrastructure/repositories/plants-gql.repository.ts` — new GQL repo
- `*.spec.ts` for both repos — new test pattern with `MockedProvider`
- `.env.local` — `NEXT_PUBLIC_GRAPHQL_URL` must be documented

---

*Explored: 2026-06-03 — gardenia-api fully supports GQL, migration is infrastructure-only.*
