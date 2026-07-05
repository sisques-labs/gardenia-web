# home-dashboard Specification Delta (Iteration 1 — Live Data)

## Purpose

Supersedes the placeholder behavior of `TodayTasksSection`, `GrowingNowSection`, and (replacing `MiniMapSection`) `PlantingSpotsSummarySection` from the `dashboard-home` change. These three sections now render real, space-scoped domain data. `HarvestPaceSection` and `JournalSection` are unchanged and still show "Coming soon".

## Requirements

### Requirement: Today's Tasks Shows Real Due Care Schedules

The system MUST render `TodayTasksSection` using active care schedules whose `nextDueAt` is on or before the end of the current calendar day (overdue + due today), scoped to the current space. Each task row MUST show its activity type, resolved plant name (when the plant is found), an "overdue" indicator when applicable, and a working "Complete" action. When there are no matching schedules, an empty state MUST be shown instead.

#### Scenario: Space has overdue and due-today tasks

- GIVEN the current space has an active care schedule with `nextDueAt` yesterday and another with `nextDueAt` today
- WHEN `TodayTasksSection` renders
- THEN both rows are visible, the overdue one is marked as overdue

#### Scenario: No due tasks

- GIVEN the current space has no active care schedule due on or before today
- WHEN `TodayTasksSection` renders
- THEN the section's empty-state message is shown

#### Scenario: Completing a task

- GIVEN a due task row is rendered
- WHEN the user clicks its "Complete" action
- THEN the care schedule is completed via the existing `complete-care-schedule` mutation and the section's list refetches

---

### Requirement: Growing Now Shows Real Active Plants

The system MUST render `GrowingNowSection` using the current space's plants, displayed as a grid of plant cards (name + species) capped at 6 visible cards with an "and N more" hint when there are more. When there are no plants, an empty state MUST be shown instead.

#### Scenario: Space has plants

- GIVEN the current space has 8 plants
- WHEN `GrowingNowSection` renders
- THEN 6 plant cards are visible and a hint indicates 2 more

#### Scenario: No plants

- GIVEN the current space has no plants
- WHEN `GrowingNowSection` renders
- THEN the section's empty-state message is shown

---

### Requirement: Planting Spots Summary Replaces Garden Map

The system MUST render `PlantingSpotsSummarySection` (replacing `MiniMapSection`) showing counts of active vs. fallow planting spots and a breakdown by spot type, scoped to the current space. When there are no planting spots, an empty state MUST be shown instead. A literal geographic/garden map MUST NOT be implied, since `PlantingSpot` has no coordinates or layout data.

#### Scenario: Space has planting spots of mixed status and type

- GIVEN the current space has 2 active raised beds and 1 fallow pot
- WHEN `PlantingSpotsSummarySection` renders
- THEN the active count shows 2, the fallow count shows 1, and the type breakdown shows "Raised bed · 2" and "Pot · 1"

#### Scenario: No planting spots

- GIVEN the current space has no planting spots
- WHEN `PlantingSpotsSummarySection` renders
- THEN the section's empty-state message is shown

---

### Requirement: care-schedule dueBefore Filter

`CareScheduleFilters` MUST support an optional `dueBefore` field (a `'YYYY-MM-DD'` calendar day) that the GraphQL repository translates into a single `NEXT_DUE_AT LESS_THAN_OR_EQUAL <end of that day>` criteria filter.

#### Scenario: dueBefore is translated to a NEXT_DUE_AT upper bound

- GIVEN `findByCriteria({ active: true, dueBefore: '2026-07-05' })` is called
- WHEN the repository builds the GraphQL request
- THEN the filters include `ACTIVE EQUALS true` and `NEXT_DUE_AT LESS_THAN_OR_EQUAL '2026-07-05T23:59:59.999'`
