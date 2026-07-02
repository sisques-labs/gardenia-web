# Tasks: space-invite-preview-ux

## Dependency

Blocked on `gardenia-api` change `space-invitation-preview` shipping `spaceInvitationPreview` query and GraphQL `extensions.code` fix — can be developed in parallel against a mocked repository (TDD, per `AGENTS.md`) but E2E-verified only after the API change deploys.

## Phase 1 — GQL layer & domain

- [ ] **T-1** — OpenSpec proposal, spec, design, tasks
- [ ] **T-2** — `space-invitation-preview.interface.ts` domain interface
- [ ] **T-3** — `space-invitation-preview.query.ts` GQL document + `getInvitationPreview` on `ISpacesRepository` + `spaces.gql.repository.ts`
- [ ] **T-4** — Repository unit tests for `getInvitationPreview` (mock `apolloClient`)

## Phase 2 — Application & presentation

- [ ] **T-5** — `GetSpaceInvitationPreviewUseCase` + unit tests
- [ ] **T-6** — `useSpaceInvitationPreview` hook (`useQuery`, `retry: false`) + unit tests
- [ ] **T-7** — `invite-error-code.ts`: `getInvitationErrorCode(error): string | null` reading `extensions.code`; delete `isAlreadyMemberError`/`messageIndicatesAlreadyMember` from `invite-accept-in-flight.ts` + their tests
- [ ] **T-8** — Rewrite `SpaceInviteScreen` state machine (`missingCode` / `previewLoading` / `previewNotFound` / `previewExpired` / `ready` / `accepting` / `acceptError` / `success`) — remove `useAcceptInvitationFlow`'s auto-accept `useEffect`, replace with explicit `onClick` handlers
- [ ] **T-9** — i18n: add `spaces.invite.*` keys (`en`/`es`), update `i18n-parity.test.ts`
- [ ] **T-10** — Component tests for each screen state (RTL) covering S-1..S-6 from `spec.md`

## Phase 3 — Verify & ship

- [ ] **T-11** — `pnpm test`, `pnpm lint`, `pnpm tsc --noEmit`
- [ ] **T-12** — Manual verification against a deployed `space-invitation-preview` API build (valid / expired / not-found / already-authenticated / unauthenticated paths)
- [ ] **T-13** — PR to `main`
