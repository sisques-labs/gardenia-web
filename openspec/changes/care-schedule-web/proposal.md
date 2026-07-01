# Proposal: Care Schedule Web Integration

## Intent

The API grew a `care-schedule` bounded context (recurring/one-time care plans
per plant: watering, fertilizing, pruning, etc.) with full REST/GraphQL/MCP
support, but nothing in web consumes it yet. Two places already have a
reserved slot waiting for exactly this data:

- The Calendar screen's `DayTasksPanel` renders the shared `InDevelopment`
  placeholder for the selected day, added in `calendar-tasks-screen` on
  purpose "until the backend tasks API lands" — it has now landed.
- The plant detail screen's "calendar" tab (`TabsContent value="calendar"`)
  is also an `InDevelopment` placeholder.

This change wires both to the real `care-schedule` GraphQL API with full CRUD
(create, edit, complete, delete), following the same layered module pattern
already used by `harvests` (full CRUD reference) and `care-log` (read
integration into plant detail reference).

## Scope

### In Scope

- New `src/core/care-schedule/` module: domain types, application ports/
  use-cases, GraphQL repository (queries + mutations), presentation hooks,
  i18n (`en`/`es` + parity test), and presentation components.
- `DayTasksPanel` body lists care schedules due on/before the selected day
  (`active: true`, `dueBefore: selectedDate`) across all plants in the
  space, each row showing plant name, activity icon, and due state.
  Actions: complete, delete. The existing (currently inert) "+ Añadir tarea"
  button in the Calendar screen's `PageHeader` opens the create modal.
- Plant detail "calendar" tab lists that plant's care schedules (all, not
  just due-soon) with create/edit/complete/delete, mirroring the
  `harvests-list` screen's row + modal pattern.
- Shared `CareScheduleModal` (create/edit form) and `CareScheduleRow`
  components reused by both integration points via props (no context/route
  coupling between calendar and plant-detail).
- Activity type + unit dropdowns backed by the same enum values as the API
  (`CareScheduleActivityTypeEnum`, `CareScheduleUnitEnum`); icon set mirrors
  `care-log`'s `ACTIVITY_ICONS` map (same 9 activity types already used by
  care-log-summary).

### Out of Scope

- Task chips rendered directly on calendar grid cells (still deferred per
  `calendar-tasks-screen`; this change only fills the day panel).
- Day/Week/Year calendar views (still disabled tabs).
- Push/local notifications for due tasks.
- Bulk operations (bulk-complete, bulk-delete).
- Any change to the `files` bounded context (separate concern, not part of
  this change).

## Capabilities

### New Capabilities

- `care-schedule-day-panel`: Calendar day panel lists due care schedules for
  the selected day with complete/delete actions.
- `care-schedule-create`: modal form to create a care schedule (recurring or
  one-time) for a plant, launchable from the Calendar screen and from a
  plant's detail page.
- `care-schedule-plant-tab`: plant detail "calendar" tab lists and manages
  that plant's care schedules end to end.

### Modified Capabilities

- `calendar-day-panel` (from `calendar-tasks-screen`): placeholder body
  replaced with real data.
- `plant-detail-calendar-tab`: placeholder replaced with real data.
- `i18n-dictionary`: `careSchedule` slice added to `AppDict`.

## Approach

Mirror `harvests` (full CRUD, GQL repo + use-cases + hooks + modal/row
components) rather than `care-log` (read-only), since this change needs
create/update/complete/delete. Both integration points (calendar panel,
plant-detail tab) share the same `CareScheduleModal` and `CareScheduleRow`
components — the calendar panel passes no fixed `plantId` (shows a plant
picker) while the plant-detail tab pre-fills and locks `plantId`. A single
`useCareSchedules(filters)` hook wraps `careSchedulesFindByCriteria` and
accepts `{ plantId?, activityType?, active?, dueBefore? }`, translated to the
API's snake_case filter fields (`plant_id`, `activity_type`, `active`,
`due_before`) inside the GQL repository — presentation code never sees
snake_case.

## Affected Areas

| Area | Impact | Description |
|------|--------|--------------|
| `src/core/care-schedule/domain/` | New | `CareSchedule` interface, activity type + unit const arrays |
| `src/core/care-schedule/application/` | New | Ports, input interfaces, use-cases (create/update/complete/delete/list/get) |
| `src/core/care-schedule/infrastructure/repositories/graphql/` | New | Queries, mutations, responses, `CareScheduleGqlRepository` |
| `src/core/care-schedule/presentation/hooks/` | New | `useCareSchedules`, `useCreateCareSchedule`, `useUpdateCareSchedule`, `useCompleteCareSchedule`, `useDeleteCareSchedule`, `useCareScheduleForm` |
| `src/core/care-schedule/presentation/components/` | New | `CareScheduleRow`, `CareScheduleModal` |
| `src/core/care-schedule/presentation/i18n/` | New | `en.ts`, `es.ts`, parity test |
| `src/core/calendar/presentation/components/day-tasks-panel/day-tasks-panel.tsx` | Modified | Real list instead of `InDevelopment` |
| `src/core/calendar/presentation/screens/calendar/calendar.screen.tsx` | Modified | Wire "+ Añadir tarea" button to open `CareScheduleModal` |
| `src/core/plants/presentation/screens/plant-detail/plant-detail.screen.tsx` | Modified | Real list in "calendar" tab instead of `InDevelopment` |
| `src/shared/presentation/i18n/get-dictionary.ts` | Modified | Register `careSchedule` dict slice |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `careScheduleDelete` mutation takes a bare `id` GraphQL arg, not an `input` wrapper (unlike `harvestDelete`) | Med | Call out explicitly in design; write the mutation doc with `($id: String!)`, not `($input: ...)` |
| Calendar day panel needs cross-plant plant names, requiring a join with `usePlants` | Low | Reuse existing `usePlants(spaceId)` hook, map `plantId` → name client-side |
| One-time vs recurring schedule form complexity (`intervalDays` nullable) | Med | Follow API semantics exactly: a "recurring" toggle controls whether `intervalDays` is sent or omitted/null |
| PR size (new module + 3 integration points) | Med | Deliver as 2 chained PRs: (1) module + calendar panel, (2) plant-detail tab + create-from-calendar wiring |

## Rollback Plan

Delete `src/core/care-schedule/`, revert `day-tasks-panel.tsx`,
`calendar.screen.tsx`, and `plant-detail.screen.tsx` to their `InDevelopment`
bodies, revert `get-dictionary.ts`. No data migrations involved.

## Dependencies

- API `care-schedule` context already shipped (`gardenia-api`, GraphQL
  queries/mutations listed in design.md).
- `usePlants` hook (`src/core/plants/presentation/hooks/use-plants/`) for the
  plant picker.
- Shared `Dialog`, `Select`, `Input`, `Button` UI primitives already in
  `src/shared/presentation/components/ui/`.

## Success Criteria

- [ ] Calendar day panel shows due/overdue care schedules for the selected
      day across the space, not the `InDevelopment` placeholder.
- [ ] Completing a schedule from the day panel advances `nextDueAt`
      (recurring) or deactivates it (one-time) and disappears from that
      day's list on refetch.
- [ ] Deleting a schedule from either integration point removes it after
      confirmation.
- [ ] "+ Añadir tarea" in the Calendar screen opens a working create form.
- [ ] Plant detail "calendar" tab lists, creates, edits, completes, and
      deletes schedules for that plant.
- [ ] `pnpm test`, `pnpm tsc --noEmit`, `pnpm lint` all pass.
- [ ] i18n parity test passes for the `careSchedule` module.
