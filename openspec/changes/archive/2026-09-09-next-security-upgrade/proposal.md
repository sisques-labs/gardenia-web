# Proposal: Next.js Security Upgrade (16.2.10 → 16.3.4)

## Intent

PR #497 is blocked: its Docker/Trivy gate (`block_on_critical: true`) flags the image because `next@16.2.10` is vulnerable. Research resolved the finding into two distinct advisories:

| Advisory | Nature | Exploitable here? |
|---|---|---|
| CVE-2026-75604 (GHSA-p293-qw3h-jr36) | Windows-only backslash path traversal in cache route handling | **No** — runtime is `node:24-bookworm-slim` (Linux) |
| GHSA-2xp9-vwfh-vxw4 (CVSS 9.5, no CVE) | OS-agnostic AVIF Image Optimization RCE via libheif/sharp | **Yes** — 19 `next/image` call sites serve user-uploaded content via custom `images.remotePatterns` |

The AVIF RCE is the real, present risk. Unblocking the gate is the immediate trigger; closing a live RCE is the reason.

## Scope

### In Scope

- `package.json`: `next` `16.2.10` → `16.3.4`; `eslint-config-next` `16.2.10` → `16.3.4`.
- `pnpm-lock.yaml`: regenerated via `pnpm install` (never hand-edited — nested peer-dep resolution strings).
- Verification: `pnpm lint`, `pnpm tsc --noEmit`, `pnpm test:coverage`, Docker smoke build + Trivy re-scan.

### Out of Scope

- `next.config.ts`, `Dockerfile`, CI workflows — exploration confirmed none reference the `next` version.
- Every other dependency pinned in PR #497.
- PR #497's base-branch question — already resolved as unrelated.

## Capabilities

### New Capabilities

None — dependency upgrade, no spec-level behavior change.

### Modified Capabilities

None.

## Approach

Target **16.3.4, not the strict-minimum 16.3.3**. Both releases fix both advisories, but 16.3.3 ships with AVIF optimization *disabled* as part of the fix — a functional regression for an app serving user images. 16.3.4 re-enables AVIF with fixes retained and is npm `latest`. `eslint-config-next` never published a 16.3.3, so lockstep parity (this project's invariant) is only reachable at 16.3.4.

Delivery follows the convention of sibling PRs #487–496: a branch off `dependabot/updates`, PR targeting `dependabot/updates`, conventional commit `fix(deps): bump next to 16.3.4`.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `package.json` | Modified | Two version pins |
| `pnpm-lock.yaml` | Modified | Regenerated |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Minor-version regression (16.2 → 16.3) | Med | Full lint + typecheck + test + build gate before merge |
| Branch-name collision with PR #497's head | Med | New branch off `dependabot/updates`; never push to it directly |
| AVIF behavior differs post-fix | Low | Verify `next/image` rendering on an uploaded-photo screen |
| Lockfile corruption | Low | `pnpm install` only; diff-review the result |

## Rollback Plan

Revert the single commit (`package.json` + `pnpm-lock.yaml`), run `pnpm install`, redeploy. No data, schema, or config migration is involved — the change is fully reversible.

## Dependencies

- `next@16.3.4` and `eslint-config-next@16.3.4` published on npm (confirmed by research).

## Success Criteria

- [ ] `next` and `eslint-config-next` both pinned to `16.3.4`; lockfile matches.
- [ ] Trivy scan reports no CRITICAL for `next`; PR #497's Docker gate passes.
- [ ] `pnpm lint`, `pnpm tsc --noEmit`, `pnpm test:coverage` all pass.
- [ ] `pnpm build` and the Docker standalone smoke build succeed.
- [ ] `next/image` still renders user-uploaded photos (AVIF path intact).
