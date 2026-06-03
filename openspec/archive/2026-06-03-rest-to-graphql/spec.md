# Spec: REST → GraphQL Migration (non-auth transports)

## Purpose

Define the behavioral requirements for the Apollo link chain extension and the two GraphQL repository adapters that replace `SpacesHttpRepository` and `PlantsHttpRepository`. Port contracts (`ISpacesRepository`, `IPlantsRepository`) and all presentation/application layer behavior are unchanged.

---

## Requirements

### Requirement: Apollo Link Chain — Auth Header

The Apollo client MUST inject an `Authorization: Bearer {accessToken}` header on every GraphQL request. The token MUST be read from the Zustand auth store at request time (not at client construction time). If no access token is present, the header MUST be omitted.

#### Scenario: Valid JWT attached to query

- GIVEN the auth store holds a valid access token
- WHEN any GraphQL operation is dispatched
- THEN the HTTP request MUST carry `Authorization: Bearer {token}`

#### Scenario: No token — header omitted

- GIVEN the auth store holds no access token
- WHEN any GraphQL operation is dispatched
- THEN the HTTP request MUST NOT include an `Authorization` header

---

### Requirement: Apollo Link Chain — Space Header

The Apollo client MUST inject an `X-Space-ID: {spaceId}` header on every GraphQL operation that is NOT annotated as space-agnostic. The space ID MUST be read from `useSpacesStore` at request time.

#### Scenario: Active space ID present

- GIVEN `useSpacesStore` holds a non-null active space ID
- WHEN a space-scoped GraphQL operation is dispatched
- THEN the HTTP request MUST carry `X-Space-ID: {activeSpaceId}`

#### Scenario: Space ID missing

- GIVEN `useSpacesStore` holds no active space ID
- WHEN a space-scoped operation is dispatched
- THEN the operation MUST be skipped or result in a client-side error — it MUST NOT reach the server with an empty `X-Space-ID`

---

### Requirement: Apollo Link Chain — Token Refresh on 401

When a GraphQL response signals an unauthenticated error (HTTP 401 or a GraphQL error with code `UNAUTHENTICATED`), the link chain MUST attempt a token refresh exactly once using the existing `refreshTokenOnce` mutex, then retry the original operation transparently. If the refresh fails, the chain MUST call logout and surface the error.

#### Scenario: Expired token — refresh succeeds — retry returns data

- GIVEN the current access token is expired
- AND the refresh endpoint returns a new token
- WHEN a GraphQL query is executed
- THEN the link chain MUST refresh the token once
- AND retry the original operation with the new token
- AND return the response data to the caller as if no error occurred

#### Scenario: Expired token — refresh fails — logout triggered

- GIVEN the current access token is expired
- AND the refresh endpoint returns an error
- WHEN a GraphQL query is executed
- THEN the link chain MUST call logout
- AND propagate an error to the caller
- AND NOT retry the operation again

#### Scenario: No duplicate refresh on concurrent failures

- GIVEN two concurrent GraphQL operations both receive a 401
- WHEN the `onError` link fires for both simultaneously
- THEN `refreshTokenOnce` MUST be called only once (mutex guarantees deduplication)
- AND both operations MUST retry after the single refresh resolves

---

### Requirement: Apollo Client URL Configuration

The Apollo HTTP link MUST use `NEXT_PUBLIC_GRAPHQL_URL` as the GraphQL endpoint. If the variable is absent, the client SHALL fall back to `http://localhost:3001/graphql`. The variable MUST be documented in the project's env reference (`.env.example` or equivalent).

#### Scenario: Env var set

- GIVEN `NEXT_PUBLIC_GRAPHQL_URL=https://api.example.com/graphql` is set
- WHEN the Apollo client sends a request
- THEN the request MUST target `https://api.example.com/graphql`

#### Scenario: Env var absent — fallback used

- GIVEN `NEXT_PUBLIC_GRAPHQL_URL` is not set
- WHEN the Apollo client sends a request
- THEN the request MUST target `http://localhost:3001/graphql`

---

### Requirement: Spaces GQL Repository — listByUser

`SpacesGqlRepository.listByUser()` MUST execute the `spacesFindByUser` GraphQL query and return a `Promise<Space[]>` that satisfies `ISpacesRepository`. It MUST NOT use Axios or any REST call.

#### Scenario: Query returns spaces

- GIVEN a valid JWT and active space ID are in the stores
- WHEN `listByUser()` is called
- THEN the repository MUST send a `spacesFindByUser` GQL query
- AND return an array of `Space` objects matching the port contract

#### Scenario: Query returns empty list

- GIVEN the user has no spaces
- WHEN `listByUser()` is called
- THEN the repository MUST return an empty array `[]`

---

### Requirement: Spaces GQL Repository — create

`SpacesGqlRepository.create(name)` MUST execute the `spaceCreate` GraphQL mutation and return a `Promise<Space>` that satisfies `ISpacesRepository`. It MUST NOT use Axios or any REST call.

#### Scenario: Mutation creates a space

- GIVEN a valid JWT and space name are provided
- WHEN `create(name)` is called
- THEN the repository MUST send a `spaceCreate` GQL mutation with `name` as input
- AND return the created `Space` object

---

### Requirement: Plants GQL Repository — list

`PlantsGqlRepository.list()` MUST execute the `plantsFindByCriteria` GraphQL query and return a `Promise<Plant[]>` that satisfies `IPlantsRepository`. It MUST NOT use Axios or any REST call.

#### Scenario: Query returns plant list

- GIVEN a valid JWT and active space ID are in the stores
- WHEN `list()` is called
- THEN the repository MUST send a `plantsFindByCriteria` GQL query
- AND return an array of `Plant` objects

#### Scenario: Query returns empty result

- GIVEN the space has no plants
- WHEN `list()` is called
- THEN the repository MUST return an empty array `[]`

---

### Requirement: Plants GQL Repository — getById

`PlantsGqlRepository.getById(id)` MUST execute the `plantFindById` GraphQL query and return a `Promise<Plant>` that satisfies `IPlantsRepository`. It MUST NOT use Axios or any REST call.

#### Scenario: Query returns single plant

- GIVEN a valid `id` string and a valid JWT
- WHEN `getById(id)` is called
- THEN the repository MUST send a `plantFindById` GQL query with the given `id`
- AND return the matching `Plant` object

---

### Requirement: Repository Unit Tests via MockedProvider

Every new GQL repository MUST have co-located unit tests using `@apollo/client/testing`'s `MockedProvider`. Tests MUST cover at minimum: successful response, empty response (where applicable), and network/GQL error handling.

#### Scenario: MockedProvider returns mocked data

- GIVEN `MockedProvider` is configured with a matching mock for the operation
- WHEN the repository method is called within the provider
- THEN the test MUST receive the mocked response without a real network call

#### Scenario: MockedProvider returns a GQL error

- GIVEN `MockedProvider` is configured to return a GraphQL error
- WHEN the repository method is called
- THEN the repository MUST propagate the error (throw or reject)

---

## Out of Scope (spec boundary)

- Auth endpoints (`login`, `refresh`, `logout`) — MUST remain REST/Axios; MUST NOT be migrated.
- Port interfaces `ISpacesRepository` and `IPlantsRepository` — MUST NOT change.
- Presentation and application layers — MUST NOT change as a result of this migration.
- GraphQL codegen, subscriptions, or other contexts (planting spots, plant species, qr).
