# Spec: space-invite-preview-ux

## Requirements

### R-1 — Preview before accept

The `/invite` page MUST fetch and display an invitation preview (space name, offered role, expiry state) before any membership-mutating call is made. The preview call MUST NOT require authentication.

### R-2 — No automatic acceptance

The app MUST NOT call the accept mutation automatically. Acceptance MUST be triggered by an explicit user action (a "Join" button) after the preview is shown.

### R-3 — Expired invitation state

When the preview response has `isExpired: true`, the app MUST show a distinct "this invite has expired" message and MUST NOT show a "Join" button.

### R-4 — Not-found invitation state

When the preview query fails with `extensions.code === "InvitationNotFoundException"`, the app MUST show a distinct "invitation not found" message.

### R-5 — Authentication gate is explicit, not silent

When the user is unauthenticated and the preview succeeds, the app MUST show the invite context (space name, role) alongside a "Sign in to continue" action. Navigation to `/login` MUST only happen on that explicit action, preserving `returnUrl` back to `/invite?code=...` (unchanged from current behavior).

### R-6 — Structured accept error handling

When the accept mutation fails, the app MUST derive the displayed message from `extensions.code` on the GraphQL error (not from matching substrings in the error message).

### R-7 — Success confirmation

After a successful accept, the app MUST show a confirmation naming the joined space before redirecting to `/home`.

## Acceptance Scenarios

**S-1**: User (unauthenticated) opens `/en/invite?code=XXX` for a valid, non-expired invitation to space "Greenhouse A" with role `member` → sees "You've been invited to Greenhouse A as member" + "Sign in to continue" button → no mutation fired yet.

**S-2**: User (authenticated) opens `/en/invite?code=XXX` for the same invitation → sees the same preview + a "Join" button → clicks it → accept mutation fires → on success, sees "You've joined Greenhouse A" briefly → redirected to `/en/home`.

**S-3**: User opens `/en/invite?code=XXX` where the invitation's `expiresAt` is in the past → sees "This invite has expired" → no "Join" button rendered.

**S-4**: User opens `/en/invite?code=XXX` where no invitation matches → sees "Invitation not found".

**S-5**: User opens `/en/invite` without `code` → sees the existing `missingCode` message (unchanged).

**S-6**: Authenticated user clicks "Join" and the accept mutation fails with `extensions.code === "InvitationExpiredException"` (race: expired between preview and click) → sees the expired-specific message, not a generic error.
