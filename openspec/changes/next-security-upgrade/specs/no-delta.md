# Spec Phase — No Capability Delta

## Change

`next-security-upgrade` — `next` `16.2.10` → `16.3.4`, `eslint-config-next` `16.2.10` → `16.3.4`.

## Determination

**No delta specs are required for this change.** Confirmed by reading `proposal.md`:

> ### New Capabilities
> None — dependency upgrade, no spec-level behavior change.
> ### Modified Capabilities
> None.

## Spot-Check (spec-phase verification of the proposal's claim)

| Check | Result |
|---|---|
| Affected files | `package.json` (two version pins), `pnpm-lock.yaml` (regenerated) only — no source files |
| `next.config.ts` / `Dockerfile` / CI workflows referencing the `next` version | None (confirmed in proposal's Out of Scope, re-verified: no application code changes) |
| Existing `openspec/specs/` domains (`auth/auth-ui`, `auth/forgot-password`) | Neither references `next`/`eslint-config-next` versioning, build tooling, or image-optimization behavior — both remain untouched and valid as-is |
| New user-facing or system capability introduced | None — this is a security patch release; `next/image` AVIF rendering behavior is restored to its pre-regression state (16.3.4 vs the interim 16.3.3), not changed relative to the current 16.2.10 behavior users see today |
| New/changed system behavior (routing, caching, API surface) | None — CVE-2026-75604 and GHSA-2xp9-vwfh-vxw4 are both fixed transparently inside `next`'s image-optimization and cache-handling internals; no application-level contract changes |

**Conclusion**: the proposal's "no capability delta" determination is correct. This is a pure dependency version bump patching two upstream vulnerabilities, with zero changes to any spec'd behavior, requirement, or scenario in `openspec/specs/`.

## ADDED Requirements

None.

## MODIFIED Requirements

None.

## REMOVED Requirements

None.

## RENAMED Requirements

None.

## Spec Graph State

This artifact satisfies the `spec` node in the `proposal -> specs -> tasks` dependency graph for `next-security-upgrade` with an explicit, evidence-backed no-op. `sdd-tasks` may proceed directly from `proposal.md`; no domain spec file exists under `specs/` to read or promote, and `sdd-archive` MUST NOT merge anything from this change into `openspec/specs/`.
