# Spec: space-invite-page

## Requirements

### R-1 — Invite route
The app MUST expose `/{locale}/invite?code={displayCode}` matching the API QR target URL shape.

### R-2 — Authentication gate
If the user is not authenticated when the invite page loads, the app MUST redirect to `/{locale}/login` with a `returnUrl` that preserves the full invite path and `code` query parameter.

### R-3 — Accept mutation
When authenticated, the page MUST call the GraphQL mutation `spaceAcceptInvitation` with `{ code }`. The mutation MUST NOT require an active `X-Space-ID` header (API uses `@IdentityOnly()`).

### R-4 — Post-accept navigation
After a successful accept, the app MUST refresh the user's spaces list, set the newly joined space as active when detectable, and redirect to `/{locale}/home`.

### R-5 — Error states
The page MUST show a user-visible message when `code` is missing or when the accept mutation fails.

## Acceptance Scenarios

**S-1**: Authenticated user opens `/en/invite?code=TES · 2026 · AB` → mutation succeeds → redirected to `/en/home` with the joined space active.

**S-2**: Unauthenticated user opens `/en/invite?code=TES · 2026 · AB` → redirected to login with `returnUrl=/en/invite?code=...` → after login, accept runs automatically.

**S-3**: User opens `/en/invite` without `code` → error message shown, no mutation fired.
