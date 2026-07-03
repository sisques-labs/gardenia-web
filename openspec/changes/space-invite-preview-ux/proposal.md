# Proposal: space-invite-preview-ux

## Intent

Replace the current blind, automatic invitation acceptance (`space-invite-page`) with an explicit preview-then-confirm flow: the invitee sees the space name, offered role, and expiry state before anything is accepted, gets a distinct message per failure mode instead of one generic error string, and gets visible confirmation after joining instead of a silent redirect. Depends on the `gardenia-api` counterpart change `space-invitation-preview` (public preview query + `extensions.code` on GraphQL errors).

## Scope

- OpenSpec change `space-invite-preview-ux` in `gardenia-web`
- Spaces bounded context: new GQL query (`spaceInvitationPreview`), port method, use case, hook, and a rewritten `space-invite.screen.tsx` with explicit states: `loading` → `expired` | `notFound` | `ready` (unauthenticated: CTA to login; authenticated: CTA to join) → `accepting` → `success` (redirect) | `error`
- Structured error handling: consume `error.graphQLErrors[0].extensions.code` (GraphQL) instead of matching `message.includes('already a member')`
- Success feedback: brief confirmation state naming the joined space before redirecting to `/home`
- i18n: new `spaces.invite.*` keys for preview/expired/join/success states (`en`/`es` parity)

## Out of Scope

- Changes to `login.screen.tsx` or the auth module — invite context is shown on `/invite` itself via an explicit "Continue to sign in" CTA (after preview loads) rather than threading space name through the login redirect. Keeps this change spaces-only.
- Revocation/listing of invitations, email notifications (tracked separately per the invitation-flow audit).
- The already-a-member idempotent-success path (`AcceptSpaceInvitationCommandHandler` already returns success, not an error, when the user is already a member — confirmed in the API handler; `isAlreadyMemberError` string-matching in `invite-accept-in-flight.ts` is effectively dead code today and is removed as part of this change, not preserved as a fallback).

## Rollback

Revert to the previous auto-accept `SpaceInviteScreen`/`useAcceptInvitationFlow`; the new preview query/hook are additive and can be left unused if rolled back independently of the API change.
