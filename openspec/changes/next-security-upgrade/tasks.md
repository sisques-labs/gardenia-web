# Tasks: Next.js Security Upgrade (16.2.10 → 16.3.4)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~10-20 (`package.json` 2 lines; `pnpm-lock.yaml` regenerated, excluded from authored risk count) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Bump `next`/`eslint-config-next` to 16.3.4, verify, ship | PR 1 | `pnpm test:coverage` | Manual: `pnpm dev`, uploaded-photo screen + `/_next/image` probe | `git revert` single commit + `pnpm install --no-frozen-lockfile` |

## Phase 0: Pre-Apply Security Gate

- [x] 0.1 Run `gh api repos/vercel/next.js/releases/tags/v16.3.3 --jq .body` and `gh api repos/vercel/next.js/releases/tags/v16.3.4 --jq .body`; record both outputs. Confirmed: 16.3.3 fixes both advisories (GHSA-p293-qw3h-jr36, GHSA-2xp9-vwfh-vxw4); 16.3.4 re-enables AVIF (#97949) on top of 16.3.3.
- [x] 0.2 Run `gh api repos/vercel/next.js/compare/v16.2.10...v16.3.4 --jq '.commits[].commit.message' | rg -i 'breaking|avif|image'`; record output. Only AVIF-related commits matched (disable in 16.3.x, then re-enable + require sharp 0.35.4 in #97949). No `sharp` dependency exists in this repo (pre-existing, unaffected).
- [x] 0.3 If any breaking change surfaces across the 16.3.0 boundary, STOP and report `blocked` — do not proceed to Phase 1. No breaking change found; proceeding.

## Phase 1: Branch Setup

- [x] 1.1 `git switch dependabot/updates && git pull --ff-only`. Already up to date.
- [x] 1.2 `git switch -c fix/next-security-upgrade`.

## Phase 2: Dependency Version Bump

- [x] 2.1 Edit `package.json`: `dependencies.next` `16.2.10` → `16.3.4` (exact pin, no `^`).
- [x] 2.2 Edit `package.json`: `devDependencies.eslint-config-next` `16.2.10` → `16.3.4` (exact pin, no `^`).
- [x] 2.3 Run `pnpm install --no-frozen-lockfile` to regenerate `pnpm-lock.yaml`. Regenerated; `next 16.3.4` / `eslint-config-next 16.3.4` installed.
- [x] 2.4 Run `pnpm install --frozen-lockfile`; must be a no-op (proves the Docker builder will pass). Confirmed: "Already up to date".

## Phase 3: Automated Verification (regression gate — no new RED tests, no-delta change)

- [x] 3.1 Run `pnpm lint`. 0 errors, 25 pre-existing warnings (none related to `next`/`eslint-config-next`).
- [x] 3.2 Run `pnpm tsc --noEmit`. No type errors.
- [x] 3.3 Run `pnpm test:coverage` — existing suite is the regression gate; no new behavior to drive with RED tests per the spec phase's no-delta determination. 321/321 test files, 1610/1610 tests passed.
- [x] 3.4 Run `pnpm build`. Exit 0, all routes built successfully.
- [x] 3.5 If any command in 3.1-3.4 fails, STOP and report `blocked`. N/A — all passed.

## Phase 4: Optional Docker Smoke Build

- [ ] 4.1 `docker build -t gardenia-web:next-1634 .`
- [ ] 4.2 `docker run --rm -p 3000:3000 gardenia-web:next-1634`

## Phase 5: Manual AVIF Verification

- [ ] 5.1 `pnpm dev`, log in, open a plant detail screen (plant-photo-gallery) with a real uploaded photo; confirm it renders and the lightbox opens it.
- [ ] 5.2 Probe `/_next/image?url=%2Fapi%2Fimage-proxy%2F{fileId}%3Ftoken%3D{token}%26spaceId%3D{spaceId}&w=640&q=75` directly; confirm HTTP 200 with an image content-type.
- [ ] 5.3 If the probe returns 400/500, STOP and report `blocked` — the 16.3.3-style AVIF disablement leaked into 16.3.4.

## Phase 6: Commit and PR

- [x] 6.1 Single commit: `fix(deps): bump next to 16.3.4` — no AI attribution. Commit `48a386d` on `fix/next-security-upgrade`.
- [x] 6.2 Open PR: base `dependabot/updates`, head `fix/next-security-upgrade`, title `fix(deps): bump next to 16.3.4`, body per design.md's "Commit / PR Shape" section. PR #498: https://github.com/sisques-labs/gardenia-web/pull/498
