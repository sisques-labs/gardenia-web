# Tasks: Space Members Display

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~300–380 |
| 400-line budget risk | Low–Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Decision needed before apply | No |

---

## Phase 1: Data Layer

### 1.1 GraphQL query document

- [ ] 1.1 Create `src/core/users/infrastructure/repositories/graphql/queries/users-find-by-criteria.query.ts`.
  - Export `USERS_FIND_BY_CRITERIA` gql document querying `usersFindByCriteria { items { id username firstName lastName avatarUrl status } total }`.

- [ ] 1.2 Create `src/core/users/infrastructure/repositories/graphql/responses/users-find-by-criteria.response.ts`.
  - Export `UsersFindByCriteriaResponse` interface: `{ usersFindByCriteria: { items: User[]; total: number } }`.

### 1.2 Repository port and implementation

- [ ] 1.3 Update `src/core/users/application/ports/users.repository.port.ts`.
  - Add `listSpaceMembers(): Promise<User[]>` to `IUsersRepository`.

- [ ] 1.4 Update `src/core/users/infrastructure/repositories/graphql/users.gql.repository.ts`.
  - Import `USERS_FIND_BY_CRITERIA` and `UsersFindByCriteriaResponse`.
  - Add `async listSpaceMembers(): Promise<User[]>` — query with `fetchPolicy: 'network-only'`; return `res.data?.usersFindByCriteria?.items ?? []`.

- [ ] 1.5 Update `src/core/users/infrastructure/repositories/graphql/users.gql.repository.spec.ts`.
  - Add test: `listSpaceMembers()` calls Apollo `query` with `USERS_FIND_BY_CRITERIA` and returns `items` array; mock empty-data guard returns `[]`.

---

## Phase 2: Application Use Case

- [ ] 2.1 RED: Create `src/core/users/application/use-cases/get-space-members/get-space-members.use-case.spec.ts`.
  - Test "delegates to repository and returns members".
  - Test "propagates repository error".

- [ ] 2.2 GREEN: Create `src/core/users/application/use-cases/get-space-members/get-space-members.use-case.ts`.
  - `GetSpaceMembersUseCase { constructor(private readonly usersRepository: IUsersRepository) }`.
  - `execute(): Promise<User[]>` → `return this.usersRepository.listSpaceMembers()`.

---

## Phase 3: Presentation Hook

- [ ] 3.1 RED: Create `src/core/spaces/presentation/hooks/use-space-members/useSpaceMembers.hook.spec.ts`.
  - Mock `GetSpaceMembersUseCase`; assert `useQuery` called with key `['space-members', spaceId]`.
  - Assert hook disabled when `activeSpaceId` is `null`.

- [ ] 3.2 GREEN: Create `src/core/spaces/presentation/hooks/use-space-members/useSpaceMembers.hook.ts`.
  - `useSpaceMembers()`: read `activeSpaceId` from spaces store; return `useQuery({ queryKey: ['space-members', activeSpaceId], queryFn: () => new GetSpaceMembersUseCase(usersGqlRepository).execute(), enabled: !!activeSpaceId })`.

---

## Phase 4: Presentation Components

### 4.1 `MemberCard` component

- [ ] 4.1 RED: Create `src/core/spaces/presentation/components/member-card/member-card.component.spec.tsx`.
  - Renders avatar `<img>` when `avatarUrl` is provided.
  - Renders letter fallback `<div>` with first letter of `username` when `avatarUrl` is null.
  - Renders full name (`firstName + ' ' + lastName`) when both present; falls back to `username`.

- [ ] 4.2 GREEN: Create `src/core/spaces/presentation/components/member-card/member-card.component.tsx`.
  - Props: `{ user: User }`.
  - Avatar section: `avatarUrl ? <img ... /> : <div className="...">{ username[0].toUpperCase() }</div>`.
  - Name: `[firstName, lastName].filter(Boolean).join(' ') || username`.

### 4.2 `SpaceMembersScreen`

- [ ] 4.3 RED: Create `src/core/spaces/presentation/screens/space-members/space-members.screen.spec.tsx`.
  - Mock `useSpaceMembers`; renders loading skeleton when `isLoading: true`.
  - Renders empty state when `data: []`.
  - Renders a `MemberCard` for each user in `data`.

- [ ] 4.4 GREEN: Create `src/core/spaces/presentation/screens/space-members/space-members.screen.tsx`.
  - Call `useSpaceMembers()`.
  - Loading: render skeleton rows.
  - Empty: render `<p>{t.members.empty}</p>`.
  - Members: `data.map(u => <MemberCard key={u.id} user={u} />)`.

---

## Phase 5: i18n

- [ ] 5.1 Locate the spaces or shared i18n dictionaries (likely `src/core/spaces/presentation/i18n/en.ts` and `es.ts`).
  - Add `members: { title, empty, loading }` keys to both files.
  - English: `title: 'Members'`, `empty: 'No members in this space.'`, `loading: 'Loading members...'`.
  - Spanish: `title: 'Miembros'`, `empty: 'No hay miembros en este espacio.'`, `loading: 'Cargando miembros...'`.

- [ ] 5.2 Verify i18n parity test (if present) passes with new keys.

---

## Phase 6: Next.js Page + Navigation

- [ ] 6.1 Create `src/app/[lang]/(protected)/spaces/members/page.tsx`.
  - Import and render `<SpaceMembersScreen />`.
  - Page is inside the `(protected)` group — inherits auth guard.

- [ ] 6.2 Add a "Miembros / Members" navigation entry in the space sidebar or settings panel (wherever space-level nav is defined). Link to `/[lang]/spaces/members`.

---

## Phase 7: Post-implementation

- [ ] 7.1 Run `pnpm test` — all new specs pass.
- [ ] 7.2 Run `pnpm lint && pnpm build` — no type errors, no lint warnings.
- [ ] 7.3 Manual smoke test: log in, switch to a space, open `/spaces/members`, verify members appear (requires API fix deployed or mocked).
- [ ] 7.4 Update `CHANGELOG.md` under Unreleased: `feat(spaces): add space members listing screen`.
