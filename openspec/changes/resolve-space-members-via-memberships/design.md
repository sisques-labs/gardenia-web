# Design: Space Members Display

> Frontend companion to gardenia-api #167. Scope and motivation in `proposal.md`.

---

## Context

- **Apollo client** automatically attaches `X-Space-ID` (from Zustand space store) and `Authorization` (JWT) headers to every request via middleware in `src/shared/infrastructure/http/apollo.client.ts`.
- **`usersFindByCriteria`** is the existing API query that now (after the API fix) returns all space members — not just home-space users.
- **`User` interface** already captures all needed profile fields: `id`, `username`, `firstName`, `lastName`, `avatarUrl`, `status`.
- **DDD layer pattern**: `domain → application → infrastructure → presentation`, as established by `spaces` and `plants` modules.
- **No role info from users query**: `usersFindByCriteria` returns `User` objects; membership roles live in `space_memberships` (spaces context). This is intentional — v1 shows members without role badges.

---

## Goals / Non-Goals

**Goals:**

- Minimal data layer: extend `IUsersRepository` + `UsersGqlRepository` with `listSpaceMembers()`.
- Use case + hook following the existing pattern (`GetSpaceMembers`, `useSpaceMembers`).
- Simple members list screen with loading skeleton and empty state.
- i18n in `en` and `es`; parity test.

**Non-Goals:**

- Role badge display (requires a separate memberships query — follow-up).
- Remove/kick member actions (separate RBAC concern).
- Pagination UI (API returns default 10; sufficient for v1).
- Real-time updates.

---

## Decisions

### ADR-001: Reuse `usersFindByCriteria` without extra port

**Decision:** Add `listSpaceMembers()` to `IUsersRepository` (not `ISpacesRepository`). The implementation calls `usersFindByCriteria` with an empty criteria object.

**Rationale:** Users are a `users` context concern. The `spaces` port deals with space management (create, list by user, accept invitation), not member profiles. Keeping the method in `IUsersRepository` mirrors the API's context separation and avoids polluting the spaces port.

**Alternative considered:** Add `listMembers()` to `ISpacesRepository` — rejected to avoid coupling space management with user profile data.

---

### ADR-002: No `spaceId` parameter on `listSpaceMembers()`

**Decision:** `listSpaceMembers()` takes no arguments. The Apollo client middleware injects `X-Space-ID` from the active Zustand space store, scoping the query server-side.

**Rationale:** Consistent with how `listByUser()`, `getById()`, and all other queries work — no explicit space threading in the application layer. The space context is an infrastructure concern (header).

---

### ADR-003: React Query for data fetching

**Decision:** `useSpaceMembers()` hook uses `useQuery` from `@tanstack/react-query` with key `['space-members', activeSpaceId]`. Invalidate on space switch.

**Rationale:** All other async state in this app uses React Query (e.g., `usePlants`, `useSpaces`). Consistent pattern; built-in loading/error states.

---

### ADR-004: Route at `/[lang]/spaces/members`

**Decision:** New Next.js page at `src/app/[lang]/(protected)/spaces/members/page.tsx`. Linked from the existing spaces navigation area.

**Rationale:** Keeps members logically under spaces. Alternative `/[lang]/members` was considered but is less intuitive.

---

## Implementation Detail

### GraphQL query document

```typescript
// src/core/users/infrastructure/repositories/graphql/queries/users-find-by-criteria.query.ts
import { gql } from '@apollo/client';

export const USERS_FIND_BY_CRITERIA = gql`
  query UsersFindByCriteria {
    usersFindByCriteria {
      items {
        id
        username
        firstName
        lastName
        avatarUrl
        status
      }
      total
    }
  }
`;
```

### Repository extension

```typescript
// IUsersRepository (port)
listSpaceMembers(): Promise<User[]>;

// UsersGqlRepository
async listSpaceMembers(): Promise<User[]> {
  const res = await apolloClient.query<UsersFindByCriteriaResponse>({
    query: USERS_FIND_BY_CRITERIA,
    fetchPolicy: 'network-only',
  });
  return res.data?.usersFindByCriteria?.items ?? [];
}
```

### Use case

```typescript
// GetSpaceMembersUseCase
export class GetSpaceMembersUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}
  async execute(): Promise<User[]> {
    return this.usersRepository.listSpaceMembers();
  }
}
```

### Hook

```typescript
// useSpaceMembers
export function useSpaceMembers() {
  const activeSpaceId = useSpacesStore(s => s.activeSpaceId);
  return useQuery({
    queryKey: ['space-members', activeSpaceId],
    queryFn: () => new GetSpaceMembersUseCase(usersGqlRepository).execute(),
    enabled: !!activeSpaceId,
  });
}
```

### `MemberCard` component

- Avatar: `<img src={avatarUrl} />` if present; else a `<div>` with the first letter of `username`.
- Name: `firstName + ' ' + lastName` (fallback to `username`).
- No role badge in v1.

---

## File Structure (new/modified)

```
src/core/users/
├── application/
│   ├── ports/
│   │   └── users.repository.port.ts                 ← MODIFIED: add listSpaceMembers()
│   └── use-cases/
│       └── get-space-members/
│           ├── get-space-members.use-case.ts         ← NEW
│           └── get-space-members.use-case.spec.ts    ← NEW
└── infrastructure/
    └── repositories/
        └── graphql/
            ├── queries/
            │   └── users-find-by-criteria.query.ts   ← NEW
            ├── responses/
            │   └── users-find-by-criteria.response.ts ← NEW
            ├── users.gql.repository.ts               ← MODIFIED: implement listSpaceMembers()
            └── users.gql.repository.spec.ts          ← MODIFIED: add listSpaceMembers test

src/core/spaces/presentation/
├── hooks/
│   └── use-space-members/
│       ├── useSpaceMembers.hook.ts                   ← NEW
│       └── useSpaceMembers.hook.spec.ts              ← NEW
└── screens/
    └── space-members/
        ├── space-members.screen.tsx                  ← NEW
        └── space-members.screen.spec.tsx             ← NEW

src/core/spaces/presentation/
└── components/
    └── member-card/
        ├── member-card.component.tsx                 ← NEW
        └── member-card.component.spec.tsx            ← NEW

src/app/[lang]/(protected)/spaces/members/
└── page.tsx                                          ← NEW

src/core/spaces/presentation/i18n/
├── en.ts                                             ← MODIFIED: add members namespace
└── es.ts                                             ← MODIFIED: add members namespace
```

---

## i18n Keys

```typescript
// members namespace (added to existing spaces i18n or users i18n)
members: {
  title: 'Miembros' | 'Members',
  empty: 'No hay miembros en este espacio.' | 'No members in this space.',
  loading: 'Cargando miembros...' | 'Loading members...',
}
```

---

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| API not yet fixed (deployed before gardenia-api #167) | Members list shows only home-space users — degraded but not broken |
| `activeSpaceId` not set when hook runs | `enabled: !!activeSpaceId` guard prevents premature fetch |
| `usersFindByCriteria` returns paginated result; default limit may be small | v1 uses default; follow-up adds pagination when needed |
