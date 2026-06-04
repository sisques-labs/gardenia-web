# Archive Report: User Profile Page

**Date**: 2026-06-04
**Change**: `user-profile-page`
**Status**: COMPLETE — PR delivered, review comments addressed, CI green

---

## Executive Summary

A user profile page was added to `gardenia-web`. Authenticated users can view and edit their profile (`username`, `firstName`, `lastName`, `avatarUrl`, `bio`, `locale`, `timezone`) via a form at `/[lang]/profile`. No API changes were required — `userFindById` and `userUpdate` were already implemented in `gardenia-api`. All 26 tasks complete: 0 TypeScript errors, 0 new lint warnings, i18n parity test passing.

---

## PRs Delivered

| PR | Branch | Scope | Status |
|----|--------|-------|--------|
| #104 | `claude/user-profile-page-H84Ok` | Full users module + route + shared UI + CI fixes | ✅ Merged to main |

---

## Review Notes

Five review comments were addressed on PR #104:

| # | Comment | Resolution |
|---|---------|------------|
| 1 | Remove `UpdateUserInput` re-export from port | Import directly from interface file in all consumers |
| 2 | Do fields match the API view model? | Confirmed — matches `UserResponseDto`; dates as `string` due to GQL serialisation |
| 3 | Extract initials logic to hook | Created `useUserInitials` hook |
| 4 | Generalise repeated label+input+error pattern | Created shared `FormField` component |
| 5 | Use shadcn Avatar component | Created `Avatar/AvatarImage/AvatarFallback` via `@radix-ui/react-avatar` |

---

## Artifact Traceability

| Artifact | Path |
|----------|------|
| Proposal | `openspec/archive/2026-06-04-user-profile-page/proposal.md` |
| Spec | `openspec/archive/2026-06-04-user-profile-page/spec.md` |
| Design | `openspec/archive/2026-06-04-user-profile-page/design.md` |
| Tasks | `openspec/archive/2026-06-04-user-profile-page/tasks.md` |
| Archive report | `openspec/archive/2026-06-04-user-profile-page/archive-report.md` (this file) |

---

## Final Verification

### TypeScript
- `pnpm exec tsc --noEmit`: 0 errors

### Lint
- `pnpm lint`: 0 new errors or warnings introduced by this change

### Tests
- `i18n-parity.test.ts`: PASS — en/es key symmetry verified

### CI
- Build gardenia-web: ✅ PASS (after fixing `@radix-ui/react-avatar` missing dep + direct `UpdateUserInput` import)

---

## Key Design Decisions

- **`fetchPolicy: 'network-only'`** — Apollo cache-first would return stale data after `userUpdate`; network-only ensures every React Query refetch hits the server.
- **`useEffect([user])` → `form.reset()`** — correct react-hook-form pattern for populating a form with asynchronously loaded data.
- **`useUserInitials` hook** — screen components must have minimal/no logic per project convention.
- **`FormField` composition** — single wrapper for all field types (Input + textarea) without duplication.
- **shadcn `Avatar`** — consistent with the component set; Radix handles image-load-failure natively.
- **`UpdateUserInput` direct import** — ports must not re-export types from other modules.

---

## SDD Cycle Complete

- ✅ Proposed
- ✅ Specified
- ✅ Designed
- ✅ Tasked
- ✅ Applied (PR #104 merged)
- ✅ Verified (TypeScript + lint + tests green)
- ✅ Archived
