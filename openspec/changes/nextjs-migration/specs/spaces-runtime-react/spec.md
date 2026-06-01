# spaces-runtime-react Specification

## Purpose

Defines the behavioral requirements for the React/Zustand re-implementation of the spaces bounded context. All requirements assert parity with the Angular implementation: X-Space-ID header injection, active space resolution, space list page, ShellLayout behavior, and localStorage persistence. No new product behavior is introduced.

## Requirements

### Requirement: X-Space-ID Header on Authenticated Requests

Every authenticated non-auth HTTP request MUST include an `X-Space-ID: {activeSpaceId}` header. The value MUST be read from the Zustand spaces store at request time.

#### Scenario: X-Space-ID present on authenticated request

- GIVEN the user is authenticated and an active space is selected in the Zustand store
- WHEN any authenticated non-auth HTTP request is made via ky
- THEN the request includes `X-Space-ID: {activeSpaceId}` with the current store value

#### Scenario: Request without active space is blocked or deferred

- GIVEN the user is authenticated but no active space is selected (null)
- WHEN a non-auth HTTP request is attempted
- THEN the request either waits for space resolution or is rejected with a clear error — it MUST NOT be sent with a missing or empty X-Space-ID header

---

### Requirement: Active Space Resolution on Login

After a successful login or registration, the active space MUST be resolved. If the Zustand spaces store has no active space set, the client MUST call `GET /spaces`, select the first space from the response, and store it in the Zustand spaces store. This MUST occur before the user can make requests requiring X-Space-ID.

#### Scenario: Space resolved from API after login

- GIVEN the user has just logged in and the Zustand spaces store has no active space
- WHEN the ShellLayout or space resolution effect runs
- THEN a GET request is sent to `{API_URL}/spaces`
- AND the first space in the response is set as the active space in the Zustand spaces store
- AND the active space is also persisted to localStorage via ActiveSpaceStorage

#### Scenario: Space already in store — no API call

- GIVEN the Zustand spaces store already has a valid active space ID
- WHEN the ShellLayout mounts
- THEN no GET request is sent to `{API_URL}/spaces`

---

### Requirement: SpaceList Page Renders User Spaces

The SpaceList page MUST fetch and display the list of spaces available to the authenticated user.

#### Scenario: Spaces list rendered

- GIVEN the user is authenticated with an active space
- WHEN the user navigates to the SpaceList page
- THEN a GET request is sent to `{API_URL}/spaces`
- AND the response list of spaces is rendered, one item per space

#### Scenario: Empty spaces list

- GIVEN the API returns an empty array for GET /spaces
- WHEN the SpaceList page renders
- THEN an empty state message is displayed (no spaces shown)

---

### Requirement: ShellLayout Space Guard

ShellLayout MUST resolve the active space on mount. If no space is found after resolution (API returns empty or fails), the user MUST be redirected to `/spaces` (or equivalent space-selection route). A loading state MUST be shown during resolution to avoid a flash of unrendered content.

#### Scenario: No spaces found — redirect

- GIVEN the user is authenticated but the API returns zero spaces
- WHEN ShellLayout mounts and space resolution completes
- THEN the user is redirected to the space-selection route (`/spaces`)

#### Scenario: Loading skeleton shown during resolution

- GIVEN the ShellLayout has mounted but space resolution is in-flight
- WHEN the page is rendered during the loading period
- THEN a loading skeleton (or equivalent placeholder) is visible instead of the main content

#### Scenario: Space resolved — content rendered

- GIVEN space resolution completes successfully
- WHEN ShellLayout re-renders after resolution
- THEN the main layout content (slot/children) is rendered and the loading skeleton is removed

---

### Requirement: ActiveSpaceStorage — localStorage Persistence

The selected active space ID MUST be persisted to `localStorage` via the `ActiveSpaceStorage` class. On app load, if a stored space ID exists, it MUST be read and set in the Zustand spaces store before the first authenticated request is made.

#### Scenario: Active space persisted to localStorage on selection

- GIVEN the user selects or resolves an active space
- WHEN `ActiveSpaceStorage.set(spaceId)` is called
- THEN `localStorage.getItem('activeSpaceId')` returns the persisted space ID

#### Scenario: Active space restored from localStorage on load

- GIVEN `localStorage` contains a previously persisted space ID
- WHEN the app loads and the Zustand spaces store initializes
- THEN the stored space ID is set as the active space without an API call

#### Scenario: localStorage cleared on logout

- GIVEN a space ID is persisted in localStorage
- WHEN the user logs out (Zustand auth store cleared)
- THEN `localStorage.getItem('activeSpaceId')` returns null

---

### Requirement: Spaces Domain Unit Tests Pass

All spaces domain and application layer unit tests MUST pass in Vitest. Coverage MUST be at parity with the existing Karma test suite for equivalent logic.

#### Scenario: Spaces Zustand store tests pass

- GIVEN Vitest test files for the spaces Zustand store and space resolution logic exist
- WHEN `pnpm test` runs
- THEN all spaces store tests pass

#### Scenario: ActiveSpaceStorage unit tests pass

- GIVEN Vitest tests for `ActiveSpaceStorage` cover set, get, and clear operations
- WHEN `pnpm test` runs
- THEN all ActiveSpaceStorage tests pass

---

### Requirement: Full Integration Flow — Auth + Spaces + X-Space-ID

The complete end-to-end flow MUST work against the real `gardenia-api`: register → login → spaces list → authenticated request with correct X-Space-ID header. Page refresh MUST NOT log the user out (the refresh token cookie flow MUST restore the session).

#### Scenario: End-to-end authenticated flow

- GIVEN the gardenia-api is running and reachable
- WHEN the user registers, logs in, and navigates to the spaces list
- THEN the SpaceList page displays the user's spaces
- AND all subsequent authenticated requests include both `Authorization: Bearer {token}` and `X-Space-ID: {activeSpaceId}`

#### Scenario: Page refresh preserves session

- GIVEN the user is logged in and has an active space
- WHEN the browser page is hard-refreshed (F5 / Cmd+R)
- THEN the in-memory access token is restored via the refresh token cookie
- AND the user is not redirected to `/login`
- AND the active space is restored from localStorage

---

### Requirement: Angular Cleanup Complete

After Phase 5 cleanup, no Angular packages MUST remain in `package.json`. No Karma config files MUST exist in the repository. `pnpm build` MUST complete without Angular-related warnings or errors.

#### Scenario: No Angular packages in package.json

- GIVEN Phase 5 cleanup has been applied
- WHEN `package.json` `dependencies` and `devDependencies` are inspected
- THEN no package with an `@angular/` prefix is present

#### Scenario: No Karma config files remain

- GIVEN Phase 5 cleanup has been applied
- WHEN the repository is searched for `karma.conf.*` files
- THEN no Karma config files are found

#### Scenario: Build completes without Angular warnings

- GIVEN Phase 5 cleanup has been applied
- WHEN `pnpm build` is executed
- THEN the build exits with code 0 and no Angular-related warnings appear in stdout or stderr
