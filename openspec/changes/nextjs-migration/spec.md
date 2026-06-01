# Spec: nextjs-migration

## Summary

This spec covers the behavioral acceptance requirements for migrating gardenia-web from Angular 20 to Next.js 15 (App Router). All requirements assert parity with the Angular implementation — no new product features are introduced.

## Capabilities Covered

| Capability | Spec File | Requirements | Type |
|---|---|---|---|
| `nextjs-foundation` | `specs/nextjs-foundation/spec.md` | 6 | New (full spec) |
| `auth-runtime-react` | `specs/auth-runtime-react/spec.md` | 8 | New (full spec) |
| `spaces-runtime-react` | `specs/spaces-runtime-react/spec.md` | 7 | New (full spec) |

**Total: 21 requirements, 52 scenarios**

## Phase → Capability Mapping

| Phase | Capability | Key Acceptance Gate |
|---|---|---|
| 1 — Scaffold | `nextjs-foundation` | Node server builds, shadcn/ui installed, CI green, Docker Next.js server runs, middleware redirects correctly |
| 2 — Auth domain | `auth-runtime-react` | 401 mutex concurrency test passes, guards redirect correctly, token in-memory only |
| 3 — Spaces domain | `spaces-runtime-react` | X-Space-ID on all requests, ShellLayout resolves space, localStorage persistence |
| 4 — Integration | `spaces-runtime-react` (integration scenarios) | End-to-end flow against real API, page refresh preserves session |
| 5 — Cleanup | `spaces-runtime-react` (cleanup scenarios) | No Angular packages, no Karma config, build clean |

## Critical Path

The **401 refresh mutex** (auth-runtime-react) is the highest-risk requirement. The concurrency scenario (N parallel 401s → exactly 1 refresh) MUST be validated by a Vitest unit test before Phase 2 is considered complete. This test gates the ky commitment for all subsequent phases.

## Risks

| # | Risk | Spec Impact |
|---|---|---|
| 1 | Mutex concurrency test fails — ky `afterError` semantics differ from RxJS Subject | REQ: 401 Refresh Mutex may need implementation revision; spec behavior is correct |
| 2 | shadcn/ui Tailwind v4 compatibility — shadcn ships with Tailwind v3 by default; v4 support requires manual CSS variable wiring | REQ: Tailwind v4 Design Tokens must be verified visually after shadcn init |
| 3 | spaceGuard resolution in ShellLayout | Spec reflects resolved design (client effect + loading skeleton + middleware cookie gate) |
