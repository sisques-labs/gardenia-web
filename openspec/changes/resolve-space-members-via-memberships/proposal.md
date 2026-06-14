# Proposal: Space Members Display

## Why

The companion API change (gardenia-api #167) fixes `usersFindByCriteria` and `userFindById` to resolve space members via `space_memberships` instead of `users.space_id`. After that fix, the API correctly returns all members of a space — including users who joined via invitation.

However, **gardenia-web currently has no UI that lists space members**. The `SpaceMembership` interface is already defined (`src/core/spaces/domain/interfaces/space-membership.interface.ts`) but is unused. Without a listing screen, users have no way to see who belongs to their space, making the API fix invisible to end users.

This change closes that gap by adding a "Space Members" section so that:

1. Space owners and members can see who is in the space.
2. Invited users appear immediately after accepting their invitation (proving the API fix works end-to-end).

## What Changes

- **`IUsersRepository`**: Add `listSpaceMembers(): Promise<User[]>` to the port.
- **`UsersGqlRepository`**: Implement `listSpaceMembers()` via the existing `usersFindByCriteria` GraphQL query (with `X-Space-ID` header automatically applied by Apollo middleware).
- **GraphQL query document**: New `USERS_FIND_BY_CRITERIA` query document returning `{ items { id username firstName lastName avatarUrl status } }`.
- **`GetSpaceMembers` use case**: Application use case that delegates to the repository port.
- **`useSpaceMembers` hook**: React Query hook wrapping the use case.
- **`SpaceMembersScreen`**: Presentation screen — a scrollable list of member avatars + names. Displays a loading skeleton and an empty state.
- **`MemberCard` component**: Reusable card showing avatar (or letter fallback), full name / username, and role badge.
- **Route**: `/[lang]/spaces/members` — linked from the space sidebar or settings panel.
- **i18n**: `members` key in `en` and `es` dictionaries.

## Capabilities

### New Capabilities

- `spaces`: members listing screen at `/[lang]/spaces/members`.

### Modified Capabilities

- `users`: `IUsersRepository` gains `listSpaceMembers()` method; `UsersGqlRepository` implements it.

## Impact

| Area | Impact |
|------|--------|
| `src/core/users/application/ports/` | Add `listSpaceMembers()` to port |
| `src/core/users/infrastructure/repositories/graphql/` | Implement + query document |
| `src/core/users/application/use-cases/` | New `GetSpaceMembers` use case |
| `src/core/spaces/presentation/` | New screen + hook + component |
| `src/app/[lang]/(protected)/spaces/members/` | New Next.js page |
| i18n dicts | New `members` namespace |

### Delivery

| PR | Scope | Est. lines |
|----|-------|------------|
| 1 | Data layer: port, repository, query doc, use case, hook, i18n | ~150–200 |
| 2 | Presentation layer: screen, component, page, nav entry | ~150–200 |

Chained PRs recommended: **No** — fits comfortably in a single PR.

### Rollback plan

1. Remove the `/spaces/members` page and nav entry.
2. Remove `listSpaceMembers` from the port and repository (non-breaking to other callers).
3. No API-side rollback needed — this only consumes `usersFindByCriteria`.

## Success Criteria

- [ ] `/[lang]/spaces/members` shows all users who belong to the current space.
- [ ] Users invited via QR/code appear in the list after accepting (requires API fix deployed).
- [ ] Loading state and empty state render correctly.
- [ ] i18n keys are present in both `en` and `es`; parity test passes.
- [ ] Unit tests pass for use case and hook.

## Open Questions

1. **Where to link the members screen?** Proposal: add "Miembros" to the space settings sidebar or as a tab in the spaces area. Defer exact placement to the design phase.
2. **Role display?** The `usersFindByCriteria` query returns `User` objects, not roles. To show owner/member badges we'd need a separate `space_memberships`-aware query. Propose: show members without role badges in v1; role-aware listing is a follow-up.
