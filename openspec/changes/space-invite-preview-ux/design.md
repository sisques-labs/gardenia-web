# Design: space-invite-preview-ux

## Layering

```
app/[lang]/(auth)/invite/page.tsx          Server — locale + dict (unchanged)
  └─ SpaceInviteScreen                     Client — state machine, no auto-accept
       ├─ useSpaceInvitationPreview(code)  TanStack useQuery — public, no auth required
       │    └─ GetSpaceInvitationPreviewUseCase → spacesGqlRepository.getInvitationPreview(code)
       └─ useAcceptInvitation()            TanStack useMutation (existing, reused)
            └─ AcceptSpaceInvitationUseCase → spacesGqlRepository.acceptInvitation(code)
```

`useSpaceInvitationPreview` MUST run regardless of auth state — it is what lets the screen show space context to a signed-out visitor before they hit the login CTA (`ADR-1`).

## Screen state machine (`SpaceInviteScreen`)

Replaces the current 3-state (`missingCode` / `accepting` / `acceptError`) auto-accept flow.

```
missingCode          — no ?code= in URL (unchanged)
  │
previewLoading        — useSpaceInvitationPreview pending
  │
previewNotFound       — preview query error, extensions.code === "InvitationNotFoundException"
  │
previewExpired        — preview succeeded, isExpired: true (not an error — see api design ADR-2)
  │
ready                 — preview succeeded, isExpired: false
  ├─ (unauthenticated) → shows spaceName + role + "Sign in to continue" button
  │                        → router.push(`/${lang}/login?returnUrl=...`) on click (manual, not auto)
  └─ (authenticated)   → shows spaceName + role + "Join" button
                           → onClick calls acceptInvitation(code)
  │
accepting             — accept mutation pending (button disabled, spinner)
  │
acceptError            — accept mutation failed; message chosen from extensions.code
  │                       (InvitationExpiredException | InvitationNotFoundException | fallback)
  │
success                — accept mutation succeeded; shows "Joined {spaceName}" for ~1.2s, then redirect to /home
```

`missingCode`, `previewNotFound`, `previewExpired`, `acceptError` are terminal — no retry loop; user is told to ask the space owner for a fresh link (existing invitations have no resend, out of scope here).

## Hook split

- `use-space-invitation-preview/useSpaceInvitationPreview.hook.ts` — `useQuery({ queryKey: ['space-invitation-preview', code], queryFn: () => getSpaceInvitationPreviewUseCase.execute(code), enabled: !!code, retry: false })`. `retry: false` because `InvitationNotFoundException` should surface immediately, not retry silently.
- `useAcceptInvitationFlow` is retired. Its responsibilities split: auth-gate check + navigation move into `SpaceInviteScreen` itself (explicit user-triggered actions, not a `useEffect` auto-run), accept mutation stays in the existing `useAcceptInvitation` hook.
- `invite-accept-in-flight.ts`: `claimInviteAccept`/`releaseInviteAccept`/`wasInviteAcceptCompleted`/`markInviteAcceptCompleted` are kept (still needed to guard the explicit "Join" button against double-submit / re-render re-trigger). `isAlreadyMemberError` and `messageIndicatesAlreadyMember` are deleted — accept errors are now discriminated via `extensions.code` (see below), and the already-member case is a silent success from the API, never surfaces as an error to discriminate.

## Error discrimination

Apollo `CombinedGraphQLErrors` exposes `.errors[].extensions`. New helper `getInvitationErrorCode(error: unknown): string | null` in `space-invite.screen.tsx`'s module (or a small `invite-error-code.ts` alongside `invite-accept-in-flight.ts`) reads `error.errors[0]?.extensions?.code`, mirroring the API's `exception.name` contract (`space-invitation-preview` design ADR-4 in `gardenia-api`). Falls back to a generic error message when `extensions.code` is absent (defensive — e.g. network errors have no GraphQL extensions).

```ts
type InviteErrorCode = 'InvitationNotFoundException' | 'InvitationExpiredException' | 'DuplicateMembershipException';
```

Message mapping lives in i18n (`spaces.invite.errors.{code}`), not hardcoded in the component.

## Repository / GQL layer

- `infrastructure/repositories/graphql/queries/space-invitation-preview.query.ts` — new `gql` document, no `@apollo/client` auth requirement (public query, but the shared Apollo client still attaches `Authorization` if a token exists — harmless, API ignores it for this query per `@SkipSpace()`).
- `spaces.gql.repository.ts`: `getInvitationPreview(code: string): Promise<SpaceInvitationPreview>` added to `ISpacesRepository`.
- New domain interface `SpaceInvitationPreview` in `domain/interfaces/space-invitation-preview.interface.ts`: `{ spaceName: string; role: InvitationRole; expiresAt: string; isExpired: boolean }` — mirrors the API's narrow projection (ADR-1 in `gardenia-api` design), deliberately not reusing `SpaceInvitation` (which carries `code`/`qrId`/`id` that the preview response never returns).

## i18n

New keys under `spaces.invite`:

```
spaces.invite.previewLoading
spaces.invite.expired
spaces.invite.notFound
spaces.invite.joinPrompt         // "You've been invited to {spaceName} as {role}"
spaces.invite.signInCta
spaces.invite.joinCta
spaces.invite.joining
spaces.invite.success            // "You've joined {spaceName}"
spaces.invite.errors.InvitationNotFoundException
spaces.invite.errors.InvitationExpiredException
spaces.invite.errors.fallback
```

`{spaceName}`/`{role}` interpolation follows the existing dictionary convention (check `spaces.settings.*` for the project's interpolation helper before introducing a new one — reuse if present, otherwise simple `.replace()` is acceptable given no i18n library is used per `AGENTS.md`).

`i18n-parity.test.ts` updated for the new keys.
