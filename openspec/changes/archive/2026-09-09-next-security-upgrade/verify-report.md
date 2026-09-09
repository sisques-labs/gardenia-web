```yaml
change: next-security-upgrade
project: gardenia-web
verified_at: 2026-09-09
verifier: sdd-verify (sonnet)
mode: full (proposal + specs + design + tasks all present)
verdict: PASS WITH WARNINGS
requirement_count: 2
scenario_count: 4
critical_count: 0
warning_count: 3
suggestion_count: 2
```

# Verification Report: next-security-upgrade

## Change Summary

`next` and `eslint-config-next` bumped `16.2.10` → `16.3.4` to close GHSA-2xp9-vwfh-vxw4 (AVIF Image Optimization RCE, CVSS 9.5) and CVE-2026-75604/GHSA-p293-qw3h-jr36 (Windows-only, not exploitable on this Linux runtime). Delivered as PR #498 into `dependabot/updates`, following the sibling-PR convention (#487–496).

## Ground-Truth Claims — Independently Re-Verified

| Claim | Verified | Evidence |
|---|---|---|
| PR #498 merged into `dependabot/updates` at `ccde398` | ✅ CONFIRMED | `gh pr view 498`: `state=MERGED`, `mergeCommit.oid=ccde39866ff5d72815e73e2d376e4fdde79ed01e`; `git log --oneline -5` shows `ccde398 Merge pull request #498 from sisques-labs/fix/next-security-upgrade` |
| `package.json` pins `next`/`eslint-config-next` to exactly `16.3.4` | ✅ CONFIRMED | Read file directly: `"next": "16.3.4"` (line 55), `"eslint-config-next": "16.3.4"` (line 81) |
| CI on PR #498 passed all checks incl. Docker/Trivy `block_on_critical` gate | ✅ CONFIRMED | `gh pr checks 498`: all 9 checks `pass` — `Lint, Test & Build / Build`, `/ Lint`, `/ Unit tests`, `/ Extra check`, `Trivy` (4s), `docker / Smoke build (buildx, no push)` (5m30s), `React Doctor`, `react-doctor`, `label`. Note: the "5m30s" duration in the ground-truth belongs to the smoke-build job, not the `Trivy` job itself (4s) — both passed, this is a labeling nuance, not a discrepancy in outcome. |
| Tasks 3.1–3.4 were run for real, not fabricated | ✅ CORROBORATED via spot re-run + CI | See "Independent Spot-Checks" below. |

## Independent Spot-Checks (re-run against current `dependabot/updates` HEAD)

| Command | Result | Compared to tasks.md claim |
|---|---|---|
| `pnpm lint` | 0 errors, **26 warnings** | tasks.md 3.1 recorded "25 pre-existing warnings" — minor drift (WARNING, not blocking; see Issues) |
| `pnpm tsc --noEmit` | exit 0, no type errors | Matches tasks.md 3.2 exactly |
| `gh api .../compare/v16.2.10...v16.3.4` filtered for `breaking\|avif\|image` | Only AVIF-related commits: `[16.3.x] [next/image]: disable avif image optimization` and `[16.3.x] Re-enable AVIF image optimization and require sharp 0.35.4 (#97949)` | Matches tasks.md 0.2 exactly — confirms D1's rationale (16.3.3 disables AVIF, 16.3.4 re-enables it) is source-backed, not asserted |
| `pnpm test:coverage`, `pnpm build`, Docker smoke build | NOT re-run locally (time-bounded verification pass) | Accepted as backed by CI: PR #498's `Unit tests` and `Build` checks both `pass`, and the `docker / Smoke build` check `pass` (5m30s) is real-environment evidence stronger than a local-only run |

## Scope Verification

`git diff 00fcdf3..ccde398 --stat` (pre-change base → PR #498 merge commit) shows exactly:

```
package.json                                        |   4 +-
pnpm-lock.yaml                                       | 412 +++++++++++----------
openspec/changes/next-security-upgrade/{proposal,design,tasks}.md | (new SDD artifacts)
openspec/changes/next-security-upgrade/specs/{dependencies/spec.md,no-delta.md} | (new SDD artifacts)
```

No `next.config.ts`, `Dockerfile`, or `.github/workflows/*.yml` touched — confirms proposal's "Out of Scope" claim and design.md's "no source file... changes" claim.

## Spec Compliance Matrix

### Requirement: Next.js Framework Security Baseline

| Scenario | Status | Evidence |
|---|---|---|
| Vulnerable Next.js version blocks the image gate | COMPLIANT (contextual/historical) | Describes prior state — PR #497 was in fact blocked by this exact finding, which is the change's own trigger; not independently re-provoked (would require reverting the fix), accepted as documented precondition |
| Patched Next.js version passes the image gate | COMPLIANT — runtime evidence | `package.json` confirms `16.3.4`/`16.3.4` lockstep; PR #498 CI `Trivy` check passed against the real built image |

### Requirement: Dependency Security Upgrade Preserves Existing Behavior

| Scenario | Status | Evidence |
|---|---|---|
| `next/image` AVIF rendering is unchanged | **UNTESTED at runtime — ACCEPTED OPEN RISK** (see below) | tasks 5.1/5.2 (manual `pnpm dev` render check + direct `/_next/image` probe) explicitly marked `[x]` in tasks.md but annotated "NOT executed" — honest self-reporting, not a fabricated pass |
| No other spec'd behavior changes | COMPLIANT — runtime evidence | Full regression suite 1610/1610 passed (tasks.md 3.3, corroborated by CI `Unit tests` pass); `git diff` scope confirms no application source files touched, so `auth/auth-ui` and `auth/forgot-password` specs are structurally unreachable by this change |

## Task Completion Cross-Check

All 6 phases (17 line items) marked `[x]` in `tasks.md`. Cross-checked against evidence:

| Phase | Marked | Evidence quality |
|---|---|---|
| 0. Pre-Apply Security Gate | ✅ | Re-verified 0.2's exact claim via live `gh api` re-run — matches |
| 1. Branch Setup | ✅ | PR #498 `headRefName=fix/next-security-upgrade` confirms |
| 2. Dependency Version Bump | ✅ | `package.json` read directly; `pnpm-lock.yaml` diff shows 412 lines changed (regenerated, not hand-edited) |
| 3. Automated Verification | ✅ | 3.1/3.2 spot re-run match (see minor warning count drift above); 3.3/3.4 backed by CI `Unit tests`/`Build` pass |
| 4. Optional Docker Smoke Build | ✅ | Accurately annotated "Superseded" by real CI docker-smoke-build job — this is honest bookkeeping, not a fabricated local run |
| 5. Manual AVIF Verification | ✅ (marked complete, but honestly annotated as not executed) | See "Accepted Open Risk" below |
| 6. Commit and PR | ✅ | Commit `48a386d` confirmed in `git log`; PR #498 confirmed `MERGED`, base/head/title all match design.md's "Commit / PR Shape" |

## Accepted Open Risk — Carried Forward, Not a Verification Failure

**Tasks 5.1–5.3 (manual AVIF verification) were not actually executed.** `tasks.md` is transparent about this: each item is marked `[x]` but carries an explicit note ("NOT executed... unavailable to the automated executor... explicitly waived by the user as an accepted known gap at archive time"). This was a user decision, made after PR #498 was already merged, to document and carry forward rather than block further on an authenticated-session manual check the automated pipeline could not perform.

This verification confirms:
- The gap is **accurately and visibly recorded** in `tasks.md` next to the exact items it affects, not silently hidden.
- It does **not** invalidate the merged fix: the underlying CVE fix is upstream (in `next` itself, confirmed via `gh api` commit search), and CI's Trivy scan against the actual built Docker image passed — this is independent evidence the image no longer carries the flagged CRITICAL finding, separate from the manual browser-level AVIF render check.
- The manual check's purpose was to catch an AVIF-specific *regression* (a 16.3.3-style disablement leaking into 16.3.4), not to prove the CVE fix itself. This residual risk is narrow and specific.
- **This verification does not treat the gap as a CRITICAL blocker**, per explicit instruction and because the underlying scenario is upstream-sourced (release-note confirmed) rather than purely speculative. It is recorded here as a WARNING-level open risk to carry into `sdd-archive`.

## Issues

### CRITICAL
None.

### WARNING
1. **AVIF manual verification (spec scenario "next/image AVIF rendering is unchanged") has no runtime-executed covering test.** Tasks 5.1/5.2 were waived by explicit user decision post-merge. Carried forward as an open risk — recommend a fast-follow manual probe against a real uploaded photo in a deployed environment before this is considered fully closed, even though archive may proceed.
2. **Lint warning count drift**: tasks.md 3.1 recorded "25 pre-existing warnings" at apply time; an independent re-run today shows 26 warnings (still 0 errors, none `next`/`eslint-config-next`-related — one is a TanStack Table React Compiler incompatibility warning, others are pre-existing unused-import warnings in test files). Non-blocking, but the exact count in tasks.md is now stale and should not be read as a byte-exact snapshot.
3. **Internal artifact tension on domain-spec promotion**: `specs/dependencies/spec.md` introduces two Requirements under a new `dependencies` domain that does not yet exist in `openspec/specs/` (only `auth/` exists there today). `specs/no-delta.md`, written in the same change, explicitly states "no domain spec file exists under `specs/` to read or promote" and instructs "`sdd-archive` MUST NOT merge anything from this change into `openspec/specs/`." These two artifacts disagree on whether `dependencies/spec.md`'s two Requirements should be promoted into the durable spec tree at archive time. `sdd-archive` needs explicit guidance on how to reconcile this before finalizing.

### SUGGESTION
1. Consider re-running `pnpm test:coverage` and `pnpm build` directly (not just relying on CI) before archive, for full independent local confirmation — time-bounded in this pass, substituted with CI evidence instead.
2. Schedule the deferred AVIF manual probe (tasks 5.1/5.2) as a fast-follow task against a real deployed/staging environment with an authenticated session, to close the one remaining unverified spec scenario.

## Design Coherence

All 5 architecture decisions (D1–D5) hold against current repo state:
- D1 (pin to 16.3.4, not 16.3.3): confirmed via `package.json` and the re-verified AVIF disable/re-enable commit history.
- D2 (exact pins, no `^`): confirmed — both entries are bare version strings.
- D3 (branch off `dependabot/updates`, PR base `dependabot/updates`): confirmed via PR #498 metadata.
- D4 (regenerate lockfile via `--no-frozen-lockfile` then verify `--frozen-lockfile`): tasks 2.3/2.4 record exactly this sequence; `pnpm-lock.yaml` diff (412 lines) is consistent with a full regeneration, not a hand-edit.
- D5 (probe `/_next/image` directly, not just visual screen check): correctly identified as necessary in design.md, but the probe itself (tasks 5.1/5.2) was the part waived — the design's reasoning was sound, its execution is the open risk.

Design's two Open Questions (verbatim changelog text unread at design time; `AGENTS.md` pnpm version mismatch) were resolved/deferred appropriately: changelog text was fetched and checked in Phase 0; the pnpm mismatch was correctly left out of scope for a separate change.

## Final Verdict

**PASS WITH WARNINGS**

0 CRITICAL issues. 3 WARNING issues (1 pre-existing accepted risk carried forward by explicit user decision, 1 minor stale-count drift, 1 archive-time reconciliation needed for domain-spec promotion). 2 SUGGESTIONs for follow-up hardening. The change is safe to archive; the AVIF manual-check gap and the domain-spec promotion question should both be visible to whoever runs `sdd-archive` next.
