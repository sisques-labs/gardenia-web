# Spec: home-dashboard-live-data

## Capabilities

| Capability | Type | Spec file |
|------------|------|-----------|
| `home-dashboard` | Delta | `specs/home-dashboard/spec.md` |
| `care-schedule` (dueBefore filter) | Delta | covered inline in `specs/home-dashboard/spec.md` (Requirement: care-schedule dueBefore Filter) |

## Summary

Replaces three of the five `HomeScreen` placeholder sections with real, space-scoped data now that their backing domain use-cases exist:

1. **TodayTasksSection** — active care schedules due today or overdue, via a new `dueBefore` filter on `CareScheduleFilters`.
2. **GrowingNowSection** — active plants for the current space, as a capped card grid.
3. **PlantingSpotsSummarySection** (replaces `MiniMapSection`) — active/fallow counts + breakdown by spot type.

`HarvestPaceSection` and `JournalSection` remain "Coming soon", deferred to a follow-up iteration.

## Requirements Coverage

| ID | Domain | Name | Type |
|----|--------|------|------|
| REQ-HD-06 | home-dashboard | Today's Tasks Shows Real Due Care Schedules | Modified |
| REQ-HD-07 | home-dashboard | Growing Now Shows Real Active Plants | Modified |
| REQ-HD-08 | home-dashboard | Planting Spots Summary Replaces Garden Map | Modified |
| REQ-CS-01 | care-schedule | care-schedule dueBefore Filter | Added |
