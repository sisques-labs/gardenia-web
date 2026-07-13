# Tasks: nodes-module

## Phase 1 — Domain & GQL layer

- [x] **T-1** — OpenSpec proposal, design, tasks, spec
- [x] **T-2** — Domain interfaces (`Bridge`, `Node`), repository port
- [x] **T-3** — GQL queries/mutation + response types + `NodesGqlRepository` + unit tests

## Phase 2 — Application & presentation

- [x] **T-4** — `GetBridgesUseCase`, `GetNodesUseCase`, `ClaimBridgeUseCase` + unit tests
- [x] **T-5** — `useBridges`, `useNodes`, `useClaimBridge` hooks + unit tests
- [x] **T-6** — `claim-bridge.schema.ts` (Zod), `ClaimBridgeDialog` component
- [x] **T-7** — `NodesScreen` + `NodesListSkeleton` + i18n (`en`/`es` parity)
- [x] **T-8** — `app/[lang]/(protected)/nodes/page.tsx` + nav entry (`shell.nav.nodes`)

## Phase 3 — Verify & ship

- [x] **T-9** — `pnpm test` + `pnpm lint` + `pnpm tsc --noEmit`
- [x] **T-10** — PR to `develop`
