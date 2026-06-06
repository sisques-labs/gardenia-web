# Proposal: Calendar Tasks Screen

## Intent

The Calendar nav item exists in the sidebar but is disabled and has no route. We need to build the calendar screen so users can visualise their garden tasks month-by-month and inspect tasks for any selected day. No backend task API exists yet, so this change uses mock data to establish the full UI structure, ready to swap for real data in a future change.

## Scope

### In Scope

- New protected route `app/[lang]/(protected)/calendar/page.tsx`.
- `CalendarScreen` client component: two-column layout — month grid (left) + day tasks panel (right).
- `CalendarGrid` component: 7-column month grid, week rows, prev/next month navigation, today highlight, click-to-select day.
- `CalendarCell` component: day number + truncated task chips (max 2 visible + "+n más").
- `DayTasksPanel` component: right panel showing tasks for the selected day (eyebrow date, headline task count, task list rows).
- `CalendarViewSwitcher` component: Day | Semana | Mes | Año tabs — Mes active; others rendered but disabled (visual scaffold only).
- `CalendarTask` domain interface: typed contract for a task entry.
- Mock data (`calendar-tasks.mock.ts`) in presentation layer — static fixture, typed against `CalendarTask`.
- i18n: `en.ts` + `es.ts` + parity test; register `calendar` slice in `get-dictionary.ts`.
- Enable Calendar nav item: remove `disabled: true` from `NAV_ITEMS`.
- Strict TDD for all new components and the screen.

### Out of Scope

- Task CRUD (create / edit / delete / check-off) — future change once backend tasks API exists.
- Day view, Week view, Year view — tabs rendered but non-functional; full implementations deferred.
- Real data: no GraphQL queries, no repositories, no use-cases in this change.
- Recurring task patterns or calendar event sources.
- Drag-and-drop task scheduling.

## Capabilities

### New Capabilities

- `calendar-monthly-view`: interactive month grid with task chips and day selection.
- `calendar-day-panel`: right-panel summary of tasks for a selected day.
- `calendar-route`: `/[lang]/calendar` protected route, sidebar nav enabled.

### Modified Capabilities

- `sidebar-navigation`: Calendar nav item enabled (was `disabled: true`).
- `i18n-dictionary`: `calendar` slice added to `AppDict`.

## Approach

Presentation-only first pass. The `CalendarScreen` holds two pieces of local state: `currentMonth: { year: number; month: number }` (for grid navigation) and `selectedDate: Date` (defaults to today, updated on cell click). Both `CalendarGrid` and `DayTasksPanel` are pure components driven by props — no Zustand, no TanStack Query in this iteration. Mock tasks come from a static fixture file (`calendar-tasks.mock.ts`) keyed by ISO date string (`YYYY-MM-DD`). The season label is derived by a small pure utility. Styling uses existing design tokens (`--paper`, `--forest`, `--honey`, `--terracotta`, `--ink-*`, `.eyebrow`, `.headline`, `.chip`, `.cbox`, `.dashed-rule`).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/[lang]/(protected)/calendar/page.tsx` | New | Route — async SC resolving locale + dict |
| `src/core/calendar/domain/interfaces/calendar-task.interface.ts` | New | `CalendarTask` typed contract |
| `src/core/calendar/presentation/mocks/calendar-tasks.mock.ts` | New | Static fixture keyed by `YYYY-MM-DD` |
| `src/core/calendar/presentation/components/calendar-cell/` | New | Day cell: number + task chips |
| `src/core/calendar/presentation/components/calendar-grid/` | New | Month grid + navigation |
| `src/core/calendar/presentation/components/calendar-view-switcher/` | New | Día/Semana/Mes/Año tabs |
| `src/core/calendar/presentation/components/day-tasks-panel/` | New | Right panel: task list for selected day |
| `src/core/calendar/presentation/screens/calendar/` | New | `CalendarScreen` + test |
| `src/core/calendar/presentation/i18n/en.ts` + `es.ts` + parity test | New | Calendar dictionary |
| `src/shared/presentation/i18n/get-dictionary.ts` | Modified | Register `CalendarDict` + `calendar` slice |
| `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` | Modified | Remove `disabled: true` from Calendar entry |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Mock data keyed by fixed dates feels stale once real date arrives | Low | Mock dates are generated relative to `new Date()` in the fixture, not hard-coded calendar literals |
| Month grid logic (first-day offset, 4–6 week rows) has edge cases | Med | Full TDD: tests cover Jan (offset 3), Feb non-leap, months with 6 rows |
| Replacing mock with real API changes prop shape | Low | `CalendarTask` interface is already the typed contract; repo can implement same shape |
| PR size risk (many new files) | Med | Estimate ~350 lines of implementation; splits into Phase 1–5 but stays under 400 |

## Rollback Plan

Delete `app/[lang]/(protected)/calendar/`, `src/core/calendar/`, revert `get-dictionary.ts`, and restore `disabled: true` in `nav-items.ts`. No data migrations or store changes involved.

## Dependencies

- Design tokens and utility classes already present in `src/design-system/`.
- `ScreenHeader` component already exists in `src/shared/presentation/components/screen-header/`.
- Sidebar shell (`AppShell`, `Sidebar`) already wired into `(protected)/layout.tsx`.

## Success Criteria

- [ ] `/[lang]/calendar` renders `CalendarScreen` with grid and tasks panel.
- [ ] Clicking a day in the grid updates the tasks panel to show that day's tasks.
- [ ] Prev/next navigation changes the displayed month and updates the header.
- [ ] Today's cell has a distinct visual treatment.
- [ ] Calendar nav item in sidebar is active/clickable.
- [ ] Vitest suite passes (all new component tests included).
- [ ] `pnpm tsc --noEmit` passes with zero errors.
