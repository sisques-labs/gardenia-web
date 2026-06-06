# Tasks: Calendar Tasks Screen

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~340 (utils ~60, CalendarCell ~50, CalendarGrid ~80, ViewSwitcher ~30, DayTasksPanel ~60, CalendarScreen ~50, i18n+wiring ~40) |
| 400-line budget risk | Low |
| Chained PRs recommended | No — fits in a single PR |
| Delivery strategy | single-PR |

---

## Phase 1: Domain Interface + Utils + Mock Data + i18n

- [ ] 1.1 Create `src/core/calendar/domain/interfaces/calendar-task.interface.ts` — export `CalendarTask` interface: `{ id: string; title: string; description?: string; time?: string; color: 'forest' | 'honey' | 'terracotta' | 'sage'; done: boolean }`. No test required (pure interface).

- [ ] 1.2 **[RED]** Write failing tests for calendar utils. File: `src/core/calendar/presentation/utils/calendar.utils.test.ts`. Assert:
  - `getDaysInMonth(2026, 1)` → 28 (non-leap Feb)
  - `getDaysInMonth(2024, 1)` → 29 (leap Feb)
  - `getDaysInMonth(2026, 4)` → 31 (May)
  - `getFirstDayOffset(2026, 4)` → 4 (May 2026 starts on Friday = index 4, Mon=0)
  - `toISODate(new Date(2026, 4, 18))` → `'2026-05-18'`
  - `getSeason(11)` → `'invierno'`; `getSeason(2)` → `'primavera'`; `getSeason(5)` → `'verano'`; `getSeason(9)` → `'otoño'`

- [ ] 1.3 **[GREEN]** Create `src/core/calendar/presentation/utils/calendar.utils.ts` — implement `getDaysInMonth`, `getFirstDayOffset` (Monday-first normalisation via `(dayOfWeek + 6) % 7`), `toISODate`, `getSeason`. All pure functions, no imports beyond native `Date`.

- [ ] 1.4 Create `src/core/calendar/presentation/mocks/calendar-tasks.mock.ts` — export `MOCK_TASKS_BY_DATE: Record<string, CalendarTask[]>`. Generate 6–8 entries with keys relative to `new Date()` (today, today+2, today+4, today-1, etc.) so the fixture always falls in the current month. Include at least one entry with 3 tasks (to trigger overflow chip), one with `done: true`, and one without `time`. No test required (fixture).

- [ ] 1.5 Create `src/core/calendar/presentation/i18n/en.ts` with structure:
  ```ts
  const dict = {
    screenTitle: 'Calendar',
    addTask: 'New task',
    viewSwitcher: { day: 'Day', week: 'Week', month: 'Month', year: 'Year' },
    grid: {
      weekdays: { mon: 'M', tue: 'T', wed: 'W', thu: 'T', fri: 'F', sat: 'S', sun: 'S' },
      seasons: { spring: 'late spring', summer: 'summer', autumn: 'autumn', winter: 'winter' },
      overflow: 'more',
    },
    panel: {
      today: 'Today',
      taskCount_one: 'task scheduled',
      taskCount_other: 'tasks scheduled',
      noTasks: 'No tasks',
      noTasksHint: 'Nothing scheduled for this day.',
    },
  } as const;
  export default dict;
  export type CalendarDict = typeof dict;
  ```

- [ ] 1.6 Create `src/core/calendar/presentation/i18n/es.ts` — `satisfies WidenStringLiterals<CalendarDict>`. Keys: `screenTitle: 'Calendario'`, `addTask: 'Nueva tarea'`, `viewSwitcher: { day: 'Día', week: 'Semana', month: 'Mes', year: 'Año' }`, weekdays abbreviated (L/M/X/J/V/S/D), seasons (primavera tardía / verano / otoño / invierno), `overflow: 'más'`, panel keys in Spanish.

- [ ] 1.7 Create `src/core/calendar/presentation/i18n/i18n-parity.test.ts` — follows the same pattern as existing parity tests (deep-key equality between `enCalendar` and `esCalendar`). Satisfies CAP-5 i18n parity scenario.

- [ ] 1.8 Modify `src/shared/presentation/i18n/get-dictionary.ts` — add `CalendarDict` import + `calendar` slice to `AppDict` and both locale entries.

---

## Phase 2: CalendarCell Component

- [ ] 2.1 **[RED]** Write failing tests for `CalendarCell`. File: `src/core/calendar/presentation/components/calendar-cell/calendar-cell.test.tsx`. Assert:
  - Renders `null` / empty when `day` is `null`
  - Renders day number when `day` is provided
  - Has distinct class when `isToday` is `true`
  - Has `aria-selected="true"` when `isSelected` is `true`
  - Renders one chip for a single task
  - Renders 2 chips + "+1 más" chip when 3 tasks provided
  - Calls `onSelect(day)` on click
  - Does not call `onSelect` when `day` is `null`

- [ ] 2.2 **[GREEN]** Create `src/core/calendar/presentation/components/calendar-cell/calendar-cell.tsx` — `'use client'` component. Renders a `<button>` (or `<div>` for null slots). Day number in top-left. Task chips (`.chip`) below, truncated label, max 2 + overflow. Today class: `bg-[var(--paper-3)]`. Selected ring: `ring-2 ring-[var(--forest)]`. Satisfies CAP-1 chip and selection scenarios.

- [ ] 2.3 **[REFACTOR]** Confirm `aria-selected` is set only for the selected state; confirm null slot renders as a visual block with `aria-hidden="true"`.

---

## Phase 3: CalendarGrid + ViewSwitcher Components

- [ ] 3.1 **[RED]** Write failing tests for `CalendarViewSwitcher`. File: `src/core/calendar/presentation/components/calendar-view-switcher/calendar-view-switcher.test.tsx`. Assert:
  - Active tab has visual distinction (check for class or aria-current)
  - Día, Semana, Año tabs are present and have `disabled` or `aria-disabled`
  - Mes tab is not disabled

- [ ] 3.2 **[GREEN]** Create `src/core/calendar/presentation/components/calendar-view-switcher/calendar-view-switcher.tsx` — renders 4 `<button>` tabs. Active tab: `bg-[var(--paper)] text-[var(--ink)]`. Inactive: `text-[var(--ink-3)]`. Non-month tabs: `disabled` attribute + `opacity-50`. Satisfies CAP-3.

- [ ] 3.3 **[RED]** Write failing tests for `CalendarGrid`. File: `src/core/calendar/presentation/components/calendar-grid/calendar-grid.test.tsx`. Assert:
  - Renders 7 weekday column headers
  - Renders the correct number of day cells for May 2026 (31 days + 4 offset = 35 cells, last 4 empty)
  - Today cell has today-specific class
  - Clicking a day cell fires `onSelectDate` with the correct date
  - Prev-month button fires `onPrevMonth`
  - Next-month button fires `onNextMonth`
  - Header contains month name and year

- [ ] 3.4 **[GREEN]** Create `src/core/calendar/presentation/components/calendar-grid/calendar-grid.tsx` — `'use client'`. Builds a flat array of `null | number` cells using `getDaysInMonth` + `getFirstDayOffset`. Maps to `CalendarCell`. Renders `CalendarViewSwitcher` at top. Month header shows `{monthName} {year} · {season}`. Prev/next buttons with lucide-react `ChevronLeft` / `ChevronRight` icons. Satisfies CAP-1 requirements.

- [ ] 3.5 **[REFACTOR]** Confirm grid is keyboard-navigable (tab order through cells); confirm month header id/aria-label is provided for the grid.

---

## Phase 4: DayTasksPanel Component

- [ ] 4.1 **[RED]** Write failing tests for `DayTasksPanel`. File: `src/core/calendar/presentation/components/day-tasks-panel/day-tasks-panel.test.tsx`. Assert:
  - Eyebrow contains "Hoy" when date is today; contains formatted date when date is not today
  - Headline contains task count (plural and singular forms)
  - Each task row: dot present, time visible when provided, time absent when not provided, title present, description present when provided
  - Done task has `.cbox.done` class on its checkbox
  - Empty state message renders when `tasks` is empty

- [ ] 4.2 **[GREEN]** Create `src/core/calendar/presentation/components/day-tasks-panel/day-tasks-panel.tsx` — `'use client'`. Eyebrow: "Hoy · DD mes" if today, "DD mes" otherwise. Headline: "{n} {taskCount_one|other}". Task rows: coloured dot (`bg-[var(--{color})]` or design token class), optional time span, `.cbox` / `.cbox.done` checkbox, title + description. Empty state: eyebrow "Sin tareas" + hint paragraph. Satisfies CAP-2 requirements.

- [ ] 4.3 **[REFACTOR]** Confirm task rows have `role="listitem"` or are wrapped in `<ul><li>`; confirm dot colour uses design token vars (`--forest`, `--honey`, `--terracotta`, `--sage`).

---

## Phase 5: CalendarScreen + Route + Wiring

- [ ] 5.1 **[RED]** Write failing tests for `CalendarScreen`. File: `src/core/calendar/presentation/screens/calendar/calendar.screen.test.tsx`. Assert:
  - Renders `CalendarGrid` (mock it — check it receives `year`, `month`, `tasksByDate`)
  - Renders `DayTasksPanel` (mock it — check it receives `tasks` array)
  - Renders a "Nueva tarea" button
  - Clicking prev-month button decrements the displayed month
  - Clicking next-month button increments the displayed month
  - Clicking a calendar cell updates the tasks panel to show tasks for that date

- [ ] 5.2 **[GREEN]** Create `src/core/calendar/presentation/screens/calendar/calendar.screen.tsx` — `'use client'`. `useState` for `currentMonth` (init: `{ year: today.getFullYear(), month: today.getMonth() }`) and `selectedDate` (init: `today`). Computes `tasksForSelectedDate` via `MOCK_TASKS_BY_DATE[toISODate(selectedDate)] ?? []`. Renders `<ScreenHeader title={dict.screenTitle} actions={<button ...>{dict.addTask}</button>} />` + two-column layout: `<CalendarGrid>` (left, `flex-1`) + `<DayTasksPanel>` (right, fixed width `~280px`). Satisfies CAP-1 through CAP-4.

- [ ] 5.3 Create `app/[lang]/(protected)/calendar/page.tsx` — async SC, resolves `locale` + `dict` via `getDictionary`, renders `<CalendarScreen dict={dict.calendar} />`. Satisfies CAP-5 route scenario.

- [ ] 5.4 Modify `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` — remove `disabled: true` from the Calendar entry. Satisfies CAP-5 nav scenario.

---

## Definition of Done

- [ ] All new test files pass (`pnpm test`).
- [ ] `pnpm tsc --noEmit` passes with zero errors.
- [ ] `pnpm lint` passes with zero errors.
- [ ] `/[lang]/calendar` route is accessible from the sidebar.
- [ ] Clicking a calendar cell updates the right panel.
- [ ] Month navigation works in both directions.
- [ ] i18n parity test passes for the `calendar` module.
