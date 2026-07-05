# Design: Home Dashboard — Live Data (Iteration 1)

## Technical Approach

Each of the three sections becomes a small self-contained TanStack Query consumer, mirroring the pattern already used by `plants-list.screen.tsx` and `calendar.screen.tsx`: read space scope from `useSpacesStore`, call the relevant presentation hook, branch on `isLoading` to return the section's existing skeleton component directly (no real `Suspense` involved — the outer `<Suspense>` wrapper in `HomeScreen` stays for structural consistency with the two still-placeholder sections but does not activate), and render an `EmptyState` when the result set is empty.

## Architecture Decisions

| Decision | Choice | Rejected | Rationale |
|----------|--------|----------|-----------|
| Today's tasks row rendering | Reuse `care-schedule`'s `CareScheduleRow` | New home-local row component | Cross-context presentation reuse is an established pattern here (`calendar` already imports `CareScheduleRow`/`DayTasksPanel`); avoids duplicating activity-type icons/labels and due/overdue logic |
| "Due today" query | New `dueBefore` filter (`NEXT_DUE_AT <= end of today`) | Reuse `dueOnDay` (exact day only) | `dueOnDay` would hide overdue tasks from prior days — the highest-value signal for a home widget |
| Garden map replacement | `PlantingSpotsSummarySection`: 2 `StatCard`s (active/fallow) + `Chip` breakdown by type | Keep `MiniMapSection` placeholder | `PlantingSpot` has no coordinates/geometry; a real map needs a layout data model that doesn't exist. An honest counts summary is buildable today and still valuable |
| Planting spots page size for the summary | `usePlantingSpots(1, 100)` | Fetch all pages | A home widget doesn't need exact counts for very large spaces; 100 covers realistic usage without adding pagination-aggregation logic |
| Loading state | Manual `isLoading` check → return Skeleton component | Convert hooks to `useSuspenseQuery` | Matches the codebase's existing convention (no `useSuspenseQuery` usage anywhere yet); changing that pattern project-wide is out of scope |

## Data Flow

```
HomeScreen
  ├─ TodayTasksSection
  │    useSpacesStore(currentSpaceId)
  │    useCareSchedules({ active: true, dueBefore: today })  ──┐
  │    usePlants(spaceId)  (shared cache key w/ GrowingNowSection) ├─► CareScheduleRow[] (complete/delete via mutation hooks)
  │
  ├─ GrowingNowSection
  │    usePlants(spaceId)  ──► PlantCard[] (capped at 6, "+N more")
  │
  └─ PlantingSpotsSummarySection
       usePlantingSpots(1, 100)  ──► StatCard(active) + StatCard(fallow) + Chip[] by type
```

`usePlants(spaceId)` is called independently in both `TodayTasksSection` and `GrowingNowSection`; TanStack Query dedupes by the shared `['plants', spaceId]` cache key so this is a single network round trip in practice, not two.

## Interfaces / Contracts

```ts
// care-schedule-filters.interface.ts
export interface CareScheduleFilters {
  plantId?: string;
  activityType?: CareScheduleActivityType;
  active?: boolean;
  dueOnDay?: string;
  dueBefore?: string; // NEW — 'YYYY-MM-DD', maps to NEXT_DUE_AT <= end of that day
}

// home.screen.tsx
type Props = {
  dict: AppDict['home'];
  careScheduleDict: AppDict['careSchedule']; // NEW
  plantingSpotsDict: AppDict['plantingSpots']; // NEW
};
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|--------------|----------|
| Unit | `care-schedule.gql.repository.spec.ts`: `dueBefore` → `NEXT_DUE_AT LESS_THAN_OR_EQUAL` | RED (added failing case) → GREEN |
| Unit | `today-tasks-section.spec.tsx`: skeleton/empty/row-rendering/complete-action/query-args | Vitest + RTL, mock hooks |
| Unit | `growing-now-section.spec.tsx`: empty/card-rendering/overflow hint | Vitest + RTL, mock `usePlants` |
| Unit | `planting-spots-summary-section.spec.tsx`: empty/counts/type breakdown | Vitest + RTL, mock `usePlantingSpots` |
| Unit | `home.screen.spec.tsx`: rewritten to assert empty states for the 3 live sections + unchanged placeholders for the other 2 | Vitest + RTL |
| Unit | `i18n-parity.spec.ts` (home) | Unchanged test, new dict shape |
| Manual | `pnpm build` succeeds; `/[lang]/home` route compiles | Verified |

## Migration / Rollout

No data migration. Additive/renaming changes only. Rollback = revert the change's commits; `dashboard-home`'s scaffold is unaffected.
