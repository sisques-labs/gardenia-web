# Proposal: Home Dashboard — Live Data (Iteration 1)

## Intent

`dashboard-home` shipped the `HomeScreen` structural scaffold — top bar with real auth/space data plus five `<Suspense>`-wrapped sections all showing "Coming soon" — because the domain use-cases they'd need didn't exist yet. They now do (`plants`, `care-schedule`, `planting-spots`), each with TanStack Query hooks already wired. This change replaces three of the five placeholders with real data so the Home screen becomes an actionable daily entry point instead of a static shell.

## Scope

### In Scope
- `TodayTasksSection`: due-today-or-overdue active care schedules for the current space, reusing `CareScheduleRow` (care-schedule module) with complete/delete actions.
- `GrowingNowSection`: active plants for the current space, rendered as a capped grid of shared `PlantCard`s with an "and N more" overflow hint.
- `PlantingSpotsSummarySection` (replaces `MiniMapSection`): active/fallow counts plus a breakdown by spot type. `PlantingSpot` has no coordinates/geometry, so a literal garden map is not feasible — this section gives an honest, data-backed summary instead.
- New `dueBefore` filter on `CareScheduleFilters` (`NEXT_DUE_AT <= end of day`), needed to include overdue tasks alongside today's.
- i18n: `home` dict's `sections.miniMap` renamed to `sections.plantingSpotsSummary`; new copy for empty states; unused top-level `inProgress` key removed.

### Out of Scope (Iteration 2)
- `HarvestPaceSection` (trend chart) and `JournalSection` (recent care-log entries) stay "Coming soon" — deferred to a follow-up change that also evaluates backend aggregation needs (no `findByCriteria` grouping/aggregation exists yet for harvests).
- Any garden-layout / geolocation data model for planting spots.
- Making the top bar search/bell/CTA functional (untouched, still non-functional per `dashboard-home`).

## Capabilities

### Modified Capabilities
- `home-dashboard`: three of the five sections now render real, space-scoped data instead of static placeholder text.
- `care-schedule` (delta): adds a `dueBefore` filter to `CareScheduleFilters` / `CareScheduleGqlRepository`.

## Approach

Compose existing presentation hooks (`useCareSchedules`, `usePlants`, `usePlantingSpots`) directly inside each section component — no new use-cases, repositories, or GraphQL operations needed beyond the `dueBefore` filter addition. Each section follows the codebase's established manual-loading pattern (`if (isLoading) return <Skeleton />`) rather than relying on the (currently inert) `<Suspense>` boundary, matching `plants-list.screen.tsx` / `plant-detail.screen.tsx`. `TodayTasksSection` reuses `care-schedule`'s `CareScheduleRow` component directly — cross-context presentation imports are an established pattern in this codebase (`calendar` already imports `care-schedule`'s `DayTasksPanel`/`CareScheduleRow`).

## Affected Areas

| Area | Impact | Description |
|------|--------|--------------|
| `src/core/care-schedule/application/interfaces/care-schedule-filters.interface.ts` | Modified | Add `dueBefore?: string` |
| `src/core/care-schedule/infrastructure/repositories/graphql/care-schedule.gql.repository.ts` | Modified | Map `dueBefore` to `NEXT_DUE_AT <=` filter |
| `src/core/home/presentation/components/today-tasks-section/` | Modified | Real data via `useCareSchedules` + `usePlants` |
| `src/core/home/presentation/components/growing-now-section/` | Modified | Real data via `usePlants` |
| `src/core/home/presentation/components/planting-spots-summary-section(-skeleton)/` | New | Replaces `mini-map-section(-skeleton)` |
| `src/core/home/presentation/screens/home/home.screen.tsx` | Modified | New props (`careScheduleDict`, `plantingSpotsDict`), swap section |
| `app/[lang]/(protected)/home/page.tsx` | Modified | Pass the two new dict slices |
| `src/core/home/presentation/i18n/{en,es}.ts` | Modified | Rename/restructure `sections` keys |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `usePlantingSpots` has no `spaceId` in its query key | Low | Pre-existing behavior (scoping happens via `X-Space-ID` header interceptor); out of scope to change here |
| Large spaces (>100 planting spots) undercount in the summary | Low | `perPage=100` covers realistic space sizes for a home widget; not a paginated list view |
| Renaming `sections.miniMap` breaks other consumers | Low | Verified via repo-wide grep — only `home` module referenced it |

## Rollback Plan

Revert this change's commits. `dashboard-home`'s scaffold (top bar, Harvest Pace, Journal, route, nav) is untouched and keeps working with its existing placeholders.

## Dependencies

None. No new npm packages; reuses existing hooks, `CareScheduleRow`, and shared `StatCard`/`PlantCard`/`EmptyState`/`Chip` components.

## Success Criteria

- [x] `TodayTasksSection` shows active care schedules due today or overdue, with working complete/delete actions.
- [x] `GrowingNowSection` shows active plants as a card grid with an overflow hint.
- [x] `PlantingSpotsSummarySection` shows active/fallow counts and a per-type breakdown.
- [x] `dueBefore` filter covered by a repository unit test.
- [x] i18n parity (en/es) passes for `home`.
- [x] `pnpm test`, `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build` all pass.
