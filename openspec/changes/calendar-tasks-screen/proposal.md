# Proposal: Calendar Tasks Screen

## Intent

The Calendar nav item exists in the sidebar but is disabled and has no route. We need to build the calendar screen so users can visualise their garden tasks month-by-month. The right panel (day tasks) is part of the layout but its content is a placeholder — a reusable shared `InDevelopment` component — until the backend tasks API lands. Calendar state (selected day, current month) lives in a Zustand store from the start so future components can connect to it without prop refactoring.

## Scope

### In Scope

- New protected route `app/[lang]/(protected)/calendar/page.tsx`.
- `CalendarScreen` client component: two-column layout — month grid (left) + day panel (right).
- `CalendarGrid` component: 7-column month grid, week rows, prev/next month navigation, today highlight, click-to-select day.
- `CalendarCell` component: day number only (task chips deferred — no data yet).
- `CalendarViewSwitcher` component: Day | Semana | Mes | Año tabs — Mes active; others rendered but disabled.
- `DayTasksPanel` component: panel container with header (selected date) + `InDevelopment` placeholder body.
- **`calendar.store.ts`** (Zustand): `selectedDate: string` (ISO), `currentYear: number`, `currentMonth: number`; actions `setSelectedDate`, `setCurrentMonth`, `prevMonth`, `nextMonth`.
- **`InDevelopment`** shared component in `src/shared/presentation/components/in-development/`: reusable "en desarrollo" placeholder card; accepts optional `label` prop to name what's coming.
- i18n: `en.ts` + `es.ts` + parity test; register `calendar` slice in `get-dictionary.ts`.
- Enable Calendar nav item: remove `disabled: true` from `NAV_ITEMS`.
- Strict TDD for all new components, the store, and the screen.

### Out of Scope

- `CalendarTask` domain interface and any task data model — deferred until backend tasks API exists.
- Task chips on calendar cells — deferred (cells show day number only for now).
- Real task list in `DayTasksPanel` — replaced by `InDevelopment` placeholder.
- Task CRUD (create / edit / delete / check-off).
- Day view, Week view, Year view — tabs rendered but non-functional; full implementations deferred.
- GraphQL queries, repositories, use-cases — no backend wiring in this change.

## Capabilities

### New Capabilities

- `calendar-monthly-view`: navigable month grid with day selection backed by Zustand store.
- `calendar-day-panel`: right-panel container for the selected day (in-development placeholder body).
- `calendar-route`: `/[lang]/calendar` protected route, sidebar nav enabled.
- `in-development-placeholder`: shared reusable component to mark unimplemented areas consistently.

### Modified Capabilities

- `sidebar-navigation`: Calendar nav item enabled (was `disabled: true`).
- `i18n-dictionary`: `calendar` slice added to `AppDict`.

## Approach

The `CalendarScreen` reads from and writes to `calendarStore` (Zustand). This means any future component — a mini-calendar widget, a notification badge, a quick-task modal — can connect to the same state without refactoring prop chains. `CalendarScreen` itself becomes a thin orchestrator. Mock data and task chips are deferred; cells are clean day-number grids. The `DayTasksPanel` keeps its layout position and header (so the two-column shape is established) but its body is the shared `InDevelopment` component, labelled "Tareas del día". Styling uses existing design tokens throughout; no new CSS files.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/[lang]/(protected)/calendar/page.tsx` | New | Route — async SC resolving locale + dict, renders `<CalendarScreen>` |
| `src/core/calendar/infrastructure/store/calendar.store.ts` | New | Zustand store: selectedDate, currentYear, currentMonth, actions |
| `src/core/calendar/infrastructure/store/calendar.store.test.ts` | New | Store unit tests |
| `src/core/calendar/presentation/utils/calendar.utils.ts` | New | Pure utils: getDaysInMonth, getFirstDayOffset, toISODate, getSeason |
| `src/core/calendar/presentation/utils/calendar.utils.test.ts` | New | Pure function tests |
| `src/core/calendar/presentation/components/calendar-cell/` | New | Day cell: number + today/selected highlight |
| `src/core/calendar/presentation/components/calendar-grid/` | New | Month grid + navigation header |
| `src/core/calendar/presentation/components/calendar-view-switcher/` | New | Día/Semana/Mes/Año tabs |
| `src/core/calendar/presentation/components/day-tasks-panel/` | New | Right panel container + InDevelopment body |
| `src/core/calendar/presentation/screens/calendar/` | New | `CalendarScreen` + test |
| `src/core/calendar/presentation/i18n/en.ts` + `es.ts` + parity test | New | Calendar dictionary |
| `src/shared/presentation/components/in-development/in-development.tsx` | New | Shared "en desarrollo" placeholder |
| `src/shared/presentation/components/in-development/in-development.test.tsx` | New | Placeholder tests |
| `src/shared/presentation/i18n/get-dictionary.ts` | Modified | Register `CalendarDict` + `calendar` slice |
| `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` | Modified | Remove `disabled: true` from Calendar entry |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Month grid logic (first-day offset, 4–6 week rows) has edge cases | Med | Full TDD: tests cover Jan (offset 3), Feb non-leap, months starting on Sunday |
| Zustand store date serialisation (Date ↔ string) | Low | Store holds ISO string; callers convert via `new Date(isoString)` — no persist in this change |
| `InDevelopment` component too generic / name collides with future | Low | Explicit `label` prop identifies what's coming; component is a deliberate scaffold contract |
| PR size risk | Low | Estimate ~300 lines of implementation — comfortably under the 400-line limit |

## Rollback Plan

Delete `app/[lang]/(protected)/calendar/`, `src/core/calendar/`, `src/shared/presentation/components/in-development/`, revert `get-dictionary.ts`, and restore `disabled: true` in `nav-items.ts`. No data migrations or store persistence involved.

## Dependencies

- Design tokens and utility classes already present in `src/design-system/`.
- `ScreenHeader` already exists in `src/shared/presentation/components/screen-header/`.
- `AppShell` + `Sidebar` already wired into `(protected)/layout.tsx`.

## Success Criteria

- [ ] `/[lang]/calendar` renders `CalendarScreen` with grid and day panel.
- [ ] Clicking a day in the grid updates the Zustand store `selectedDate` and the panel header.
- [ ] Prev/next navigation updates `currentYear`/`currentMonth` in the store and re-renders the grid.
- [ ] Today's cell has a distinct visual treatment.
- [ ] `DayTasksPanel` body shows the `InDevelopment` placeholder.
- [ ] `InDevelopment` component is usable standalone in other screens.
- [ ] Calendar nav item in sidebar is active/clickable.
- [ ] Vitest suite passes (all new component + store tests included).
- [ ] `pnpm tsc --noEmit` passes with zero errors.
