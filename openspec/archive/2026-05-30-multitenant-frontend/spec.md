# Spec: Multi-tenant Frontend (Spaces) — Phase 1

## Capabilities Covered

| Capability | Type | Domains |
|------------|------|---------|
| `spaces` | New | `core/spaces/` |
| `space-context` | New | `core/auth/auth.interceptor`, `app.routes`, `app.ts` |
| `auth` | Modified | `core/auth/` — register flow, AuthStateService |

---

## Capability: spaces

### Purpose

Frontend space domain that loads the user's spaces, sets and persists the active space, and exposes the active space ID for use by the interceptor.

### Requirement: Load User Spaces

The system MUST provide a port and a stubbed HTTP repository for fetching the list of spaces belonging to the authenticated user. All HTTP methods MUST compile with typed signatures and return placeholder data or an empty observable, annotated with `TODO: implement when API is ready`.

#### Scenario: Spaces load after login

- GIVEN the user has authenticated successfully
- WHEN the init sequence triggers space loading
- THEN `SpacesStateService.availableSpaces` MUST contain the resolved list (empty array if API stub returns none)

#### Scenario: HTTP stub compiles without real API

- GIVEN the spaces API endpoint does not exist yet
- WHEN the Angular build runs
- THEN compilation MUST succeed with no TypeScript errors

### Requirement: Set and Persist Active Space

The system MUST persist the active `spaceId` in `localStorage` and rehydrate it on application init. `SpacesStateService` MUST expose `currentSpaceId` as a signal.

#### Scenario: Active space survives reload

- GIVEN the user had an active space set
- WHEN the page is reloaded
- THEN `SpacesStateService.currentSpaceId` MUST equal the previously selected `spaceId` after hydration

#### Scenario: Stale localStorage spaceId not in available spaces

- GIVEN `localStorage` contains a `spaceId` that is not present in the loaded spaces list
- WHEN the init sequence completes space loading
- THEN the system MUST fall back to the first available space in the list
- AND MUST update `localStorage` with the new active `spaceId`

#### Scenario: No spaces returned

- GIVEN the authenticated user has no spaces
- WHEN space loading completes
- THEN the system MUST redirect the user to `/spaces/new`
- AND `SpacesStateService.currentSpaceId` MUST be `null`

### Requirement: Space Routes

The system MUST expose two routes: `/spaces` (list) and `/spaces/new` (create). Both MUST be wired to standalone components. The create form MUST compile and submit without requiring a live API.

#### Scenario: /spaces/new renders without API

- GIVEN the user navigates to `/spaces/new`
- WHEN the component loads
- THEN the page MUST render the create-space form
- AND submission MUST not throw a runtime error even when the HTTP stub returns an empty observable

---

## Capability: space-context

### Purpose

Injects `X-Space-ID` into every authenticated, non-auth HTTP request, and gates protected routes on a fully resolved active space.

### Requirement: X-Space-ID Header Injection

The `authInterceptor` MUST add an `X-Space-ID` header to every outgoing request that is NOT targeting an `/auth/` endpoint. The header MUST be omitted when no active space is set.

#### Scenario: Header injected on authenticated request

- GIVEN the user is authenticated and an active space is set
- WHEN an HTTP request is made to any non-auth endpoint
- THEN the request MUST include `X-Space-ID: {currentSpaceId}`

#### Scenario: Header not sent to auth endpoints

- GIVEN the user is authenticated and an active space is set
- WHEN an HTTP request is made to `/auth/login` or `/auth/register`
- THEN the request MUST NOT include an `X-Space-ID` header

#### Scenario: Header omitted when no active space

- GIVEN the user is authenticated but no active space is resolved yet
- WHEN an HTTP request is made to a non-auth endpoint
- THEN the request MUST NOT include an `X-Space-ID` header

### Requirement: spaceGuard — Protected Route Gating

The system MUST provide a `spaceGuard` functional guard that blocks navigation to protected routes until an active space is resolved. Routes without a resolved space MUST redirect to `/spaces`.

#### Scenario: Protected route accessible with resolved space

- GIVEN the user is authenticated and `SpacesStateService.currentSpaceId` is non-null
- WHEN the user navigates to a protected route
- THEN navigation MUST succeed

#### Scenario: spaceGuard blocks route with no active space

- GIVEN the user is authenticated but `SpacesStateService.currentSpaceId` is `null`
- WHEN the user attempts to navigate to a protected route
- THEN navigation MUST be blocked
- AND the user MUST be redirected to `/spaces`

### Requirement: Authenticated Shell

The application MUST render an authenticated shell (layout wrapper) for all protected routes. The shell header MUST display the active space name. The name MUST update reactively when the active space changes.

#### Scenario: Header shows active space name

- GIVEN the user is authenticated and an active space is set
- WHEN the authenticated shell renders
- THEN the header MUST display the `name` of the current space

---

## Capability: auth (Modified)

### Purpose

Fixes the register flow so the `spaceId` returned by `POST /auth/register` is captured, persisted, and used to bootstrap the space context.

### Requirement: Register Captures spaceId

`POST /auth/register` returns `{ accessToken, user, spaceId }`. The system MUST capture `spaceId` from the response, persist it in `localStorage`, and set it as the active space in `SpacesStateService`.

#### Scenario: Happy path — register auto-selects space

- GIVEN a new user submits the register form
- WHEN the API responds with `{ accessToken, user, spaceId }`
- THEN `spaceId` MUST be stored in `localStorage`
- AND `SpacesStateService.currentSpaceId` MUST equal the returned `spaceId`
- AND the user MUST be redirected to the authenticated shell

#### Scenario: Register response spaceId survives reload

- GIVEN the user registered and the `spaceId` was persisted
- WHEN the page is reloaded
- THEN `SpacesStateService.currentSpaceId` MUST be rehydrated from `localStorage` and equal the original `spaceId`

### Requirement: AuthStateService Active-Space Awareness

`AuthStateService` MUST NOT directly own space state. It MAY delegate space init to `SpacesStateService` after authentication succeeds. The separation MUST keep auth and space concerns in distinct services.

#### Scenario: Space init triggered after login

- GIVEN the user logs in successfully
- WHEN `AuthStateService` processes the login response
- THEN `SpacesStateService` MUST be called to load and resolve the active space before protected routes are accessible

---

## Non-Functional Requirements

| Requirement | Strength | Detail |
|-------------|----------|--------|
| Security: X-Space-ID not leaked to auth endpoints | MUST | Interceptor condition checked per request |
| Compilation without live API | MUST | All HTTP stubs compile with typed signatures |
| localStorage key collision avoidance | SHOULD | Use namespaced key (e.g. `gardenia:activeSpaceId`) |
| Space loading does not block initial render | SHOULD | Shell renders optimistically; guards block route, not render |
| Accessibility — header space name | MAY | Space name in header has an `aria-label` or visible label |

---

## Out of Scope

- Space switcher UI (Phase 2)
- Member management: invite, remove, role changes (Phase 2)
- Space settings page (Phase 2)
- Real HTTP calls to spaces API (parallel — API team)
- End-to-end integration tests requiring a live API
