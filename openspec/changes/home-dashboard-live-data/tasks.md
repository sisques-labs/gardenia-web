# Tasks: home-dashboard-live-data

## Review Workload Forecast

| Metric | Value |
|--------|-------|
| New files | 9 |
| Modified files | 10 |
| Deleted files | 2 (`mini-map-section` + skeleton) |
| Chained PRs recommended | No (single cohesive PR, well under 400 lines net of test/story scaffolding parity with `dashboard-home`) |

## Phase 1 — care-schedule: dueBefore filter

### 1.1 — RED: failing repository test for `dueBefore`
- **Files**: `src/core/care-schedule/infrastructure/repositories/graphql/care-schedule.gql.repository.spec.ts`
- **Status**: Done

### 1.2 — GREEN: implement `dueBefore` mapping
- **Files**: `care-schedule-filters.interface.ts`, `care-schedule.gql.repository.ts`
- **Status**: Done

## Phase 2 — Home i18n restructure

### 2.1 — Rename `sections.miniMap` → `sections.plantingSpotsSummary`, add empty-state copy, drop unused top-level `inProgress`
- **Files**: `src/core/home/presentation/i18n/{en,es}.ts`, `home-top-bar.spec.tsx`
- **Status**: Done

## Phase 3 — TodayTasksSection

### 3.1 — Wire real data + tests + story
- **Files**: `today-tasks-section.tsx`, `today-tasks-section.spec.tsx` (new), `today-tasks-section.stories.tsx`
- **Status**: Done

## Phase 4 — GrowingNowSection

### 4.1 — Wire real data + tests + story
- **Files**: `growing-now-section.tsx`, `growing-now-section.spec.tsx` (new), `growing-now-section.stories.tsx`
- **Status**: Done

## Phase 5 — PlantingSpotsSummarySection

### 5.1 — New component + skeleton + tests + story; delete `mini-map-section(-skeleton)`
- **Files**: `planting-spots-summary-section(-skeleton)/*`
- **Status**: Done

## Phase 6 — HomeScreen + route wiring

### 6.1 — Update `home.screen.tsx` props/imports, `page.tsx`, rewrite `home.screen.spec.tsx` + `.stories.tsx`
- **Status**: Done

## Phase 7 — Verification

### 7.1 — `pnpm test`, `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build`
- **Status**: Done — 275 test files / 1363 tests passing, 0 type errors, 0 lint errors, build succeeds

## Dependency Graph (summary)

```
1.1 -> 1.2 -> 3.1
2.1 -> 3.1, 4.1, 5.1
3.1 + 4.1 + 5.1 -> 6.1 -> 7.1
```
