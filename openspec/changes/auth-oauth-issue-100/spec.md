# Delta Spec: OAuth Login + Auth-Refresh Redirect (Issue #100)

## Change Name
`auth-oauth-issue-100`

## Scope
This is a **delta spec** — it describes only what changes relative to the existing `auth-ui` specification. Requirements in `openspec/specs/auth/auth-ui.spec.md` that are NOT listed here remain in force and unchanged.

---

## Capability 1: oauth-login (NEW)

This capability does not exist. All requirements below describe behavior that MUST be introduced.

---

### R1.1 — OAuth Button Initiation

Each `AuthSocial` provider button (GitHub, Apple, Google) MUST navigate the browser directly to the OAuth initiation endpoint:

```
${NEXT_PUBLIC_OAUTH_API_ORIGIN}/auth/oauth/${provider}
```

Navigation MUST be performed via `window.location.href` assignment.

Navigation MUST NOT use `fetch`, `axios`, `router.push`, `<a href>`, or any other mechanism that routes through the Next.js `/api` proxy.

Provider identifiers MUST be: `github`, `apple`, `google` (lowercase, matching API path segments).

---

### R1.2 — Callback Route

The system MUST expose a client-side-only route at `app/[lang]/(auth)/callback/page.tsx`.

The route MUST:
- Be marked `'use client'`
- Export `export const dynamic = 'force-dynamic'`
- On mount, read `window.location.hash` and extract the `access_token` query parameter from it
- Not perform any server-side rendering or data fetching

---

### R1.3 — Successful Callback Finalization

When the callback route mounts and `access_token` is present and non-empty in the hash:

The system MUST:
1. Store the token via `useAuthStore` (`setAccessToken`)
2. Read `returnUrl` from `window.location.search` if present
3. Redirect to `returnUrl` if valid, otherwise redirect to the app home route (`/[lang]`)

The redirect MUST occur after the token is stored.

The system MUST NOT trigger a full page refresh as part of the finalization redirect — use `router.replace`.

---

### R1.4 — Failed Callback

When the callback route mounts and `access_token` is absent or empty in the hash:

The system MUST redirect to `/[lang]/login?error=oauth_failed` via `router.replace`.

No token storage, no hydration, and no side effects MUST occur before this redirect.

---

### R1.5 — OAuth Error Banner on Login Screen

When the login screen is rendered with `?error=oauth_failed` present in the query string:

The system MUST render a visible error banner displaying the i18n string keyed `auth.oauthFailed`.

The banner MUST NOT render when `?error` is absent or has any value other than `oauth_failed`.

This check MUST be performed inside the existing `Suspense` boundary (via `useSearchParams`) — no new `Suspense` wrapper is required.

---

### R1.6 — Environment Variable: NEXT_PUBLIC_OAUTH_API_ORIGIN

The system MUST define and validate `NEXT_PUBLIC_OAUTH_API_ORIGIN` in `src/shared/config/env.ts`.

The variable MUST:
- Be typed as `string`
- Be required at runtime (throw or log a clear error if undefined or empty)
- Be distinct from `NEXT_PUBLIC_API_URL` (the proxy origin)

No default value pointing to a relative path (`/api`) is acceptable — the purpose of this variable is specifically to bypass the proxy.

---

## Capability 2: auth-ui (MODIFIED — delta only)

The following requirements SUPERSEDE the corresponding requirements in `openspec/specs/auth/auth-ui.spec.md`. All other `auth-ui` requirements remain unchanged.

---

### R2.1 — AuthSocial Buttons Initiate OAuth (supersedes existing AuthSocial requirement)

The `AuthSocial` component MUST render 3 social login buttons: GitHub, Apple, Google.

Each button MUST be **enabled** (no `disabled` attribute, no `aria-disabled`, no `cursor: not-allowed` styling).

Each button MUST initiate OAuth navigation on click as described in R1.1.

The previous requirement that buttons "MUST NOT trigger any auth action" is **replaced** by this requirement.

The existing scenario "Social buttons render without action" is **replaced** by the BDD scenarios below.

---

### R2.2 — Refresh-401 Redirects to Login

When `POST /auth/refresh` returns HTTP 401:

Both the **axios interceptor** (`src/shared/infrastructure/http/axios.client.ts`) and the **Apollo `onErrorLink`** (`src/shared/infrastructure/http/apollo.client.ts`) MUST:
1. Call `clearAuth()` on the auth store
2. Call `window.location.replace('/login')` to redirect the user to the login page
3. NOT retry the original request
4. NOT call any further interceptor logic after the redirect

The redirect MUST use `window.location.replace` (not `router.push`, not `window.location.href`) to prevent the broken session state from appearing in browser history.

---

### R2.3 — Redirect Guard: No Loop When Already on Login

When `POST /auth/refresh` returns 401 and the current path (`window.location.pathname`) already contains `/login`:

The system MUST NOT trigger the redirect described in R2.2.

`clearAuth()` MUST still be called.

This guard MUST be applied in BOTH the axios interceptor and the Apollo `onErrorLink`.

---

## i18n Requirements

### R3.1 — oauthFailed Key

The auth i18n dictionaries MUST include the key `oauthFailed` (nested under the `auth` namespace) in both `src/core/auth/presentation/i18n/en.ts` and `src/core/auth/presentation/i18n/es.ts`.

The English value MUST communicate that OAuth login failed and invite the user to try again. The Spanish value MUST be a natural Rioplatense equivalent.

---

## Cross-Cutting Requirements

### CC1 — Strict TDD

All new components, hooks, and modified interceptor logic introduced by this change MUST have corresponding Vitest unit tests.

Tests MUST be written or updated **before** the implementation is considered complete.

Existing `AuthSocial` tests that assert buttons are disabled MUST be rewritten to assert the new OAuth initiation behavior (RED → GREEN cycle).

### CC2 — i18n Coverage

No user-visible string introduced by this change may be hardcoded. All strings MUST reference keys in the auth i18n dictionaries.

### CC3 — No localStorage

Tokens MUST remain in the Zustand in-memory store only. No `localStorage`, `sessionStorage`, or cookie writes are permitted from web client code for token storage.

---

## BDD Scenarios

### Scenario 1: Successful OAuth flow — button click initiates navigation

```
GIVEN the login screen is rendered
AND NEXT_PUBLIC_OAUTH_API_ORIGIN is set to "https://api.example.com"
WHEN the user clicks the GitHub social button
THEN window.location.href is set to "https://api.example.com/auth/oauth/github"
AND no fetch or axios request is made
```

### Scenario 2: Successful OAuth callback — token stored and user redirected

```
GIVEN the user is on /[lang]/auth/callback
AND window.location.hash contains "access_token=abc123"
AND no returnUrl is present in the query string
WHEN the callback page mounts
THEN setAccessToken("abc123") is called on the auth store
AND the user is redirected to the app home route via router.replace
```

### Scenario 3: OAuth callback with missing token — redirect to login with error

```
GIVEN the user is on /[lang]/auth/callback
AND window.location.hash does not contain an access_token (or it is empty)
WHEN the callback page mounts
THEN no token is stored
AND the user is redirected to /[lang]/login?error=oauth_failed via router.replace
```

### Scenario 4: Login screen renders oauth_failed error banner

```
GIVEN the login screen is rendered
AND the URL query string contains ?error=oauth_failed
WHEN the component renders
THEN a visible error banner with the auth.oauthFailed i18n message is displayed
AND no other error state (attempt counter, field halo) is shown
```

### Scenario 5: Refresh-401 triggers redirect to login

```
GIVEN the user has an expired session
AND the current path is /dashboard (not /login)
WHEN an API call triggers the axios interceptor or Apollo onErrorLink
AND POST /auth/refresh returns 401
THEN clearAuth() is called
AND window.location.replace('/login') is called
AND the original request is NOT retried
```

### Scenario 6: Redirect guard — no redirect loop when already on login

```
GIVEN the user is on /[lang]/login
WHEN an Apollo or axios call triggers a refresh attempt
AND POST /auth/refresh returns 401
THEN clearAuth() is called
AND window.location.replace is NOT called
AND no redirect occurs
```

### Scenario 7: Callback with returnUrl — redirects to returnUrl after success

```
GIVEN the user is on /[lang]/auth/callback
AND window.location.hash contains "access_token=xyz"
AND the query string contains returnUrl=/dashboard/plants
WHEN the callback page mounts
THEN setAccessToken("xyz") is called
AND the user is redirected to /dashboard/plants via router.replace
```

---

## Out of Scope (explicit exclusions)

- "Logout all sessions" UI — API endpoint exists but Issue #100 does not require it
- OAuth account linking / unlinking screens
- Server-side session cookie rework
- New OAuth providers beyond GitHub, Apple, Google
- Any changes to `app/[lang]/(auth)/layout.tsx` shell components
