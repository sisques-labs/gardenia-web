# auth-runtime-react Specification

## Purpose

Defines the behavioral requirements for the React/Zustand/ky re-implementation of the auth bounded context. All requirements assert parity with the Angular implementation: token storage semantics, 401-refresh mutex behavior, route guard semantics, and form flow. No new product behavior is introduced.

## Requirements

### Requirement: LoginPage Form and Submission

The LoginPage MUST render a form with email and password fields. On submission, it MUST POST to `/auth/login`, store the received access token in Zustand (in-memory), and redirect the user to the default authenticated route.

#### Scenario: Successful login

- GIVEN the user is on `/login` and not authenticated
- WHEN the user enters valid credentials and submits the form
- THEN a POST request is sent to `{API_URL}/auth/login` with `{ email, password }` in the body
- AND the access token from the response is stored in the Zustand auth store (not in localStorage)
- AND the user is redirected to the default authenticated route (e.g. `/spaces`)

#### Scenario: Login form validation — empty fields

- GIVEN the LoginPage form is rendered
- WHEN the user submits without entering email or password
- THEN validation errors are displayed for both fields
- AND no HTTP request is sent

#### Scenario: Login API error

- GIVEN the user submits valid-looking credentials
- WHEN the API responds with 401 or 422
- THEN an error message is displayed to the user
- AND the user remains on `/login`

---

### Requirement: RegisterPage Form and Submission

The RegisterPage MUST render a registration form. On submission, it MUST POST to `/auth/register`, capture the `spaceId` from the response, store it and the access token in Zustand, and redirect to the authenticated route.

#### Scenario: Successful registration

- GIVEN the user is on `/register`
- WHEN the user fills in all required fields and submits
- THEN a POST request is sent to `{API_URL}/auth/register`
- AND the access token and `spaceId` from the response are stored in Zustand
- AND the user is redirected to the default authenticated route

#### Scenario: Register form validation — invalid email

- GIVEN the RegisterPage form is rendered
- WHEN the user submits with a malformed email
- THEN a validation error is shown for the email field
- AND no HTTP request is sent

---

### Requirement: Access Token Storage — In-Memory Only

The access token MUST be stored exclusively in the Zustand auth store (in-memory). It MUST NOT be written to `localStorage`, `sessionStorage`, or any cookie.

#### Scenario: Token not persisted to storage

- GIVEN a successful login response has been processed
- WHEN `localStorage` and `sessionStorage` are inspected
- THEN no access token value is present in either storage

#### Scenario: Token accessible from outside React tree

- GIVEN the Zustand auth store holds a valid access token
- WHEN `useAuthStore.getState().accessToken` is called outside a React component (e.g. inside the ky interceptor)
- THEN the current token value is returned synchronously

---

### Requirement: Refresh Token — httpOnly Cookie

The refresh token MUST be stored in an httpOnly cookie set by the API server. The client MUST NOT read, write, or delete the refresh token cookie directly. This behavior is identical to the Angular implementation.

#### Scenario: Refresh token is not readable by JavaScript

- GIVEN a successful login has set the refresh token cookie
- WHEN `document.cookie` is inspected
- THEN the refresh token cookie is not visible (httpOnly enforcement by the browser)

---

### Requirement: 401 Refresh Mutex — Single Refresh, Queue Concurrent Requests

When any ky request receives a 401 response, the client MUST attempt exactly one token refresh. Concurrent requests that also receive 401 MUST be queued and retried with the new token after the single refresh completes. The client MUST NOT send multiple simultaneous refresh requests.

#### Scenario: Single refresh on concurrent 401s

- GIVEN the access token is expired
- AND 3 concurrent authenticated requests are in-flight
- WHEN all 3 receive a 401 response
- THEN exactly one POST request is sent to `{API_URL}/auth/refresh`
- AND all 3 original requests are retried with the new access token after the refresh succeeds
- AND all 3 eventually succeed (assuming refresh succeeds)

#### Scenario: Refresh in progress — new 401 request queues

- GIVEN a refresh request is already in-flight
- WHEN another request receives a 401
- THEN the new request is queued (not triggering another refresh)
- AND the queued request is retried after the ongoing refresh resolves

---

### Requirement: Logout on Refresh Failure

If the token refresh attempt fails (API returns 401 or network error), the client MUST clear the Zustand auth store and redirect the user to `/login`.

#### Scenario: Refresh fails — user logged out

- GIVEN the access token is expired and a 401 triggers a refresh attempt
- WHEN the refresh API call returns 401
- THEN the Zustand auth store is cleared (access token set to null)
- AND the user is redirected to `/login`

#### Scenario: Refresh fails — queued requests rejected

- GIVEN multiple requests are queued waiting for a refresh
- WHEN the refresh fails
- THEN all queued requests reject with an auth error
- AND the user is redirected to `/login` exactly once

---

### Requirement: Authorization Header on Authenticated Requests

Every ky request to an authenticated endpoint MUST include an `Authorization: Bearer {token}` header. The token MUST be read from the Zustand auth store at request time (not cached in closure).

#### Scenario: Bearer header present on authenticated request

- GIVEN the Zustand auth store holds a valid access token
- WHEN any authenticated HTTP request is made via ky
- THEN the request includes `Authorization: Bearer {token}` with the current store value

---

### Requirement: Route Guard — Protect Authenticated Routes

`middleware.ts` MUST redirect unauthenticated users (no refresh token cookie) away from protected routes to `/login`. Authenticated users attempting to access `/login` or `/register` MUST be redirected to the default authenticated route.

#### Scenario: Unauthenticated access to protected route

- GIVEN the user has no refresh token cookie
- WHEN the user navigates to a protected route (e.g. `/spaces`)
- THEN `middleware.ts` redirects to `/login`

#### Scenario: Authenticated user accesses guest route

- GIVEN the user has a refresh token cookie
- WHEN the user navigates to `/login` or `/register`
- THEN `middleware.ts` redirects to the default authenticated route

#### Scenario: Unauthenticated user accesses guest route

- GIVEN the user has no refresh token cookie
- WHEN the user navigates to `/login`
- THEN the request passes through middleware without redirect
- AND the LoginPage renders

---

### Requirement: Auth Domain Unit Tests Pass

All auth domain and application layer unit tests MUST pass in Vitest. Coverage MUST be at parity with the existing Karma test suite for equivalent logic.

#### Scenario: Auth Zustand store tests pass

- GIVEN Vitest test files for the auth Zustand store exist
- WHEN `pnpm test` runs
- THEN all auth store tests pass

#### Scenario: 401 mutex concurrency test passes

- GIVEN a Vitest test that fires N concurrent requests returning 401 and asserts single refresh
- WHEN `pnpm test` runs
- THEN the concurrency test passes, asserting exactly 1 refresh call
