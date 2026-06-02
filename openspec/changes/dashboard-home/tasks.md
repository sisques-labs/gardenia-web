# Tasks: dashboard-home

## Review Workload Forecast

| Metric | Value |
|--------|-------|
| New files | 17 |
| Modified files | 5 |
| Estimated changed lines | ~520 |
| 400-line budget risk | **High** |
| Chained PRs recommended | **Yes** |

**Decision needed before apply.**
Suggested split:

- **PR-1 — Foundation**: Auth fix + i18n infrastructure (tasks 1.x + 2.x). ~120 lines.
- **PR-2 — Dashboard**: HomeTopBar + sections + screen + nav + route (tasks 3.x–6.x). ~400 lines.

---

## Phase 1 — Foundation: Auth Fix

> Satisfies: REQ-AU-01, SCN-AU-01 to SCN-AU-05
> Sequential within this phase.

### 1.1 — RED: Write failing test for LoginScreen locale-aware redirect
- **Files**: `src/core/auth/presentation/screens/login/login.screen.test.tsx`
- **Phase**: RED
- **Description**: Add a test case that asserts `router.replace` is called with `/${locale}/home` (not `/`) when no `returnUrl` is present. Test passes `locale="es"` as prop. Run: test MUST fail because `LoginScreen` does not yet accept `locale` prop.
- **Satisfies**: SCN-AU-02, SCN-AU-05
- **Depends on**: nothing

### 1.2 — GREEN: Add `locale` prop to LoginScreen + fix redirect target
- **Files**: `src/core/auth/presentation/screens/login/login.screen.tsx`
- **Phase**: GREEN
- **Description**: Accept `locale: string` prop. Change fallback `router.replace(...)` from `'/'` (or `/${locale}`) to `` `/${locale}/home` ``. Run tests: 1.1 must now pass.
- **Satisfies**: SCN-AU-01, SCN-AU-02
- **Depends on**: 1.1

### 1.3 — GREEN: Thread locale prop through login page
- **Files**: `app/[lang]/(auth)/login/page.tsx`
- **Phase**: GREEN
- **Description**: Extract `lang` from `params`, pass `locale={lang}` to `<LoginScreen />`.
- **Satisfies**: SCN-AU-04
- **Depends on**: 1.2

### 1.4 — GREEN: Fix middleware authenticated-user redirect
- **Files**: `middleware.ts`
- **Phase**: GREEN
- **Description**: Change authenticated-user redirect from `/${locale}` to `/${locale}/home` (line ~38 per design). No test — covered by manual smoke and SCN-AU-03.
- **Satisfies**: SCN-AU-03
- **Depends on**: nothing (can be done in parallel with 1.1–1.3 but logically grouped here)

---

## Phase 2 — Foundation: i18n

> Satisfies: REQ-HD-04, SCN-HD-08, SCN-HD-09
> 2.1 and 2.2 are parallel. 2.3 depends on both. 2.4 depends on 2.3.

### 2.1 — RED: Write i18n parity test
- **Files**: `src/core/home/presentation/i18n/i18n-parity.test.ts`
- **Phase**: RED
- **Description**: Import `en` and `es`, assert their top-level and nested key sets are identical. Test MUST fail — neither file exists yet.
- **Satisfies**: SCN-HD-08
- **Depends on**: nothing

### 2.2 — GREEN: Create `en.ts` home dictionary
- **Files**: `src/core/home/presentation/i18n/en.ts`
- **Phase**: GREEN
- **Description**: Define and export `HomeDict` type and `en` const with keys: `topbar.search`, `topbar.newEntry`, `greeting`, `sections.todayTasks`, `sections.growingNow`, `sections.miniMap`, `sections.harvestPace`, `sections.journal`, `inProgress`.
- **Satisfies**: REQ-HD-04
- **Depends on**: nothing (parallel with 2.1)

### 2.3 — GREEN: Create `es.ts` home dictionary
- **Files**: `src/core/home/presentation/i18n/es.ts`
- **Phase**: GREEN
- **Description**: Mirror all keys from `en.ts` with Spanish copy. Run parity test: 2.1 must now pass.
- **Satisfies**: SCN-HD-08
- **Depends on**: 2.1, 2.2

### 2.4 — GREEN: Register home dict in get-dictionary
- **Files**: `src/shared/presentation/i18n/get-dictionary.ts`
- **Phase**: GREEN
- **Description**: Import `en` and `es` from home i18n. Add `home` key to `AppDict` type and both locale maps. Run: SCN-HD-09 satisfied.
- **Satisfies**: SCN-HD-09
- **Depends on**: 2.2, 2.3

---

## Phase 3 — HomeTopBar

> Satisfies: REQ-HD-02, SCN-HD-03 to SCN-HD-05
> Sequential.

### 3.1 — RED: Write HomeTopBar unit tests
- **Files**: `src/core/home/presentation/components/home-top-bar/home-top-bar.test.tsx` *(new)*
- **Phase**: RED
- **Description**: Mock `useAuthStore` (email `ana@example.com`) and `useSpacesStore` (space name `Mi Huerto`). Assert greeting text contains `"ana"`. Assert search input is present. Assert bell icon is present. Assert "Nueva entrada" button is present. Test MUST fail — component does not exist.
- **Satisfies**: SCN-HD-03, SCN-HD-04, SCN-HD-05
- **Depends on**: 2.2 (needs `HomeDict` type for props)

### 3.2 — GREEN: Implement HomeTopBar
- **Files**: `src/core/home/presentation/components/home-top-bar/home-top-bar.tsx`
- **Phase**: GREEN
- **Description**: Client Component. Read `useAuthStore().currentUser.email`, split at `@` to get prefix. Read `useSpacesStore().currentSpace().name` as fallback. Render greeting, search input (read-only/no handler), bell icon (lucide `Bell`), "Nueva entrada" button (no handler). Run: 3.1 must pass.
- **Satisfies**: REQ-HD-02
- **Depends on**: 3.1

---

## Phase 4 — Five Section Components + Skeletons

> Satisfies: REQ-HD-03, SCN-HD-06, SCN-HD-07
> All five section groups (4.1–4.5) are PARALLEL to each other.
> Within each group: `.skeleton.tsx` and `.tsx` can be written simultaneously; no internal ordering constraint.

### 4.1 — GREEN: TodayTasksSection + Skeleton
- **Files**:
  - `src/core/home/presentation/components/today-tasks-section/today-tasks-section.tsx`
  - `src/core/home/presentation/components/today-tasks-section/today-tasks-section.skeleton.tsx`
- **Phase**: GREEN (section renders text; skeleton tested via HomeScreen test in 5.x)
- **Description**: Section accepts `dict` prop slice, renders `.card` wrapper + `inProgress` text. Skeleton: title shimmer + 4 task-row pulse shimmers. No dedicated unit test — covered by `home.screen.test.tsx`.
- **Satisfies**: SCN-HD-06, SCN-HD-07
- **Depends on**: 2.2 (HomeDict type)

### 4.2 — GREEN: GrowingNowSection + Skeleton
- **Files**:
  - `src/core/home/presentation/components/growing-now-section/growing-now-section.tsx`
  - `src/core/home/presentation/components/growing-now-section/growing-now-section.skeleton.tsx`
- **Phase**: GREEN
- **Description**: Same pattern as 4.1. Skeleton: title shimmer + 3×2 card grid shimmers.
- **Satisfies**: SCN-HD-06, SCN-HD-07
- **Depends on**: 2.2

### 4.3 — GREEN: MiniMapSection + Skeleton
- **Files**:
  - `src/core/home/presentation/components/mini-map-section/mini-map-section.tsx`
  - `src/core/home/presentation/components/mini-map-section/mini-map-section.skeleton.tsx`
- **Phase**: GREEN
- **Description**: Same pattern. Skeleton: title shimmer + rectangular map area shimmer.
- **Satisfies**: SCN-HD-06, SCN-HD-07
- **Depends on**: 2.2

### 4.4 — GREEN: HarvestPaceSection + Skeleton
- **Files**:
  - `src/core/home/presentation/components/harvest-pace-section/harvest-pace-section.tsx`
  - `src/core/home/presentation/components/harvest-pace-section/harvest-pace-section.skeleton.tsx`
- **Phase**: GREEN
- **Description**: Same pattern. Skeleton: title shimmer + 5 sparkline-row shimmers.
- **Satisfies**: SCN-HD-06, SCN-HD-07
- **Depends on**: 2.2

### 4.5 — GREEN: JournalSection + Skeleton
- **Files**:
  - `src/core/home/presentation/components/journal-section/journal-section.tsx`
  - `src/core/home/presentation/components/journal-section/journal-section.skeleton.tsx`
- **Phase**: GREEN
- **Description**: Same pattern. Skeleton: title shimmer + 3 entry shimmers.
- **Satisfies**: SCN-HD-06, SCN-HD-07
- **Depends on**: 2.2

---

## Phase 5 — HomeScreen

> Satisfies: REQ-HD-01, REQ-HD-02, REQ-HD-03, SCN-HD-01, SCN-HD-02, SCN-HD-03, SCN-HD-06
> Sequential.

### 5.1 — RED: Write HomeScreen test
- **Files**: `src/core/home/presentation/screens/home/home.screen.test.tsx`
- **Phase**: RED
- **Description**: Mock `useAuthStore`/`useSpacesStore`. Render `<HomeScreen dict={mockDict} lang="es" />`. Assert greeting text is present. Assert each of the five `inProgress` strings is in the DOM (one per section). Test MUST fail — screen does not exist.
- **Satisfies**: SCN-HD-03, SCN-HD-06
- **Depends on**: 3.2, 4.1, 4.2, 4.3, 4.4, 4.5

### 5.2 — GREEN: Implement HomeScreen
- **Files**: `src/core/home/presentation/screens/home/home.screen.tsx`
- **Phase**: GREEN
- **Description**: `'use client'`. Props: `{ dict: AppDict['home']; lang: string }`. Flex column layout: `<HomeTopBar dict={dict.topbar} />` + scrollable div with Tailwind `grid grid-cols-[1.3fr_1fr]`. Each of the 5 sections wrapped in `<Suspense fallback={<{Section}Skeleton />}>`. Run: 5.1 must pass.
- **Satisfies**: REQ-HD-01, REQ-HD-02, REQ-HD-03
- **Depends on**: 5.1

### 5.3 — REFACTOR: Review pulse/shimmer consistency across skeletons
- **Files**: skeletons from 4.1–4.5
- **Phase**: REFACTOR
- **Description**: Verify all skeletons use the same Tailwind `animate-pulse` pattern. Extract shared Tailwind class strings to a local constant if there is repetition. No behaviour change — tests must stay green.
- **Satisfies**: design quality (no direct requirement)
- **Depends on**: 5.2

---

## Phase 6 — Route + Nav

> Satisfies: REQ-HD-01, REQ-HD-05, SCN-HD-01, SCN-HD-02, SCN-HD-10
> 6.1 and 6.2 are PARALLEL. Both depend on 5.2.

### 6.1 — GREEN: Create home page route
- **Files**: `app/[lang]/(protected)/home/page.tsx`
- **Phase**: GREEN
- **Description**: Async Server Component. Resolve `locale` from `params.lang`. Call `getDictionary(locale)` and pass `dict.home` + `lang` to `<HomeScreen />`. Protected by existing `(protected)` group middleware — no extra auth logic needed.
- **Satisfies**: REQ-HD-01, SCN-HD-01, SCN-HD-02
- **Depends on**: 5.2, 2.4

### 6.2 — GREEN: Add Home nav item to sidebar
- **Files**: `src/shared/presentation/components/sidebar-nav-items/nav-items.ts`
- **Phase**: GREEN
- **Description**: Prepend `{ label: 'Home', href: '/[lang]/home', icon: Home }` (lucide-react `Home`). Label key should use the i18n dict if nav items support it; otherwise hardcode and note for future i18n pass.
- **Satisfies**: REQ-HD-05, SCN-HD-10
- **Depends on**: 5.2

---

## Dependency Graph (summary)

```
1.1 -> 1.2 -> 1.3
1.4 (independent)

2.1 ─┐
2.2 ─┴─> 2.3 -> 2.4

2.2 -> 3.1 -> 3.2
2.2 -> 4.1..4.5 (parallel)

3.2 + 4.1..4.5 -> 5.1 -> 5.2 -> 5.3

5.2 + 2.4 -> 6.1
5.2       -> 6.2
```

## Task Summary

| ID | Phase | Parallel? | File count | TDD |
|----|-------|-----------|------------|-----|
| 1.1 | Auth fix | — | 1 (modify) | RED |
| 1.2 | Auth fix | after 1.1 | 1 (modify) | GREEN |
| 1.3 | Auth fix | after 1.2 | 1 (modify) | GREEN |
| 1.4 | Auth fix | independent | 1 (modify) | GREEN |
| 2.1 | i18n | parallel w/ 2.2 | 1 (new) | RED |
| 2.2 | i18n | parallel w/ 2.1 | 1 (new) | GREEN |
| 2.3 | i18n | after 2.1+2.2 | 1 (new) | GREEN |
| 2.4 | i18n | after 2.3 | 1 (modify) | GREEN |
| 3.1 | TopBar | after 2.2 | 1 (new) | RED |
| 3.2 | TopBar | after 3.1 | 1 (new) | GREEN |
| 4.1 | Sections | parallel | 2 (new) | GREEN |
| 4.2 | Sections | parallel | 2 (new) | GREEN |
| 4.3 | Sections | parallel | 2 (new) | GREEN |
| 4.4 | Sections | parallel | 2 (new) | GREEN |
| 4.5 | Sections | parallel | 2 (new) | GREEN |
| 5.1 | Screen | after 3.2+4.x | 1 (new) | RED |
| 5.2 | Screen | after 5.1 | 1 (new) | GREEN |
| 5.3 | Screen | after 5.2 | skeletons | REFACTOR |
| 6.1 | Route | parallel w/ 6.2 | 1 (new) | GREEN |
| 6.2 | Nav | parallel w/ 6.1 | 1 (modify) | GREEN |

**Total tasks: 20 | New files: 17 | Modified files: 5 | Estimated lines: ~520**
