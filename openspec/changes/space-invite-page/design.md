# Design: space-invite-page

## Route placement

`/invite` lives under `(auth)` — same layout shell as login/register, **not** under `(protected)`. Protected layout mounts `SpacesProviders`, which redirects to `/spaces/new` when no `currentSpaceId` exists; invite accept must run before the user has the target space active.

## Layering

```
app/[lang]/(auth)/invite/page.tsx          Server — locale + dict
  └─ SpaceInviteScreen                     Client — auth gate + auto-accept
       └─ useAcceptInvitation              TanStack mutation
            └─ AcceptSpaceInvitationUseCase
                 ├─ spacesGqlRepository.acceptInvitation(code)
                 └─ spacesGqlRepository.listByUser() + store update
```

## Active space resolution

`spaceAcceptInvitation` returns the accepting `userId`, not `spaceId`. After accept, the use case refetches `spacesFindByUser` and picks the first space whose id was not in `availableSpaces` before accept. That space is set as `currentSpaceId`.

## Apollo / headers

`spaceLink` only adds `X-Space-ID` when `currentSpaceId` is set. Accept uses `@IdentityOnly()` on the API; an stale header from another space should not block accept.

## i18n

Add `spaces.invite` keys in `en.ts` / `es.ts`; parity test updated.
