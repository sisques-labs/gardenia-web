# Tasks: Calendar Tasks Screen

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~310 (store ~40, utils ~50, InDevelopment ~25, CalendarCell ~45, CalendarGrid ~70, ViewSwitcher ~25, DayTasksPanel ~30, CalendarScreen ~35, i18n + wiring ~30) |
| 400-line budget risk | Low — single PR |
| Chained PRs recommended | No |
| Delivery strategy | single-PR |

---

## Phase 1: Shared InDevelopment Component

- [x] 1.1 **[RED]** Write failing tests for `InDevelopment`. File: `src/shared/presentation/components/in-development/in-development.test.tsx`. Assert:
  - Renders without props (no crash, DOM is non-empty)
  - Renders the `label` value when provided
  - Renders without `label` (fallback content present)

- [x] 1.2 **[GREEN]** Create `src/shared/presentation/components/in-development/in-development.tsx` — stateless functional component. Uses `.paper-grain` texture, `.eyebrow` class for the "En desarrollo" badge, optional `label` paragraph below. No `'use client'` needed (pure markup). Satisfies CAP-5.

- [x] 1.3 **[REFACTOR]** Confirm no inline colours — token vars only. Add `data-testid="in-development"` for test targeting.

---

## Phase 2: Calendar Utils + Store

- [x] 2.1 **[RED]** Write failing tests for calendar utils. File: `src/core/calendar/presentation/utils/calendar.utils.test.ts`. Assert:
  - `getDaysInMonth(2026, 1)` → 28 (non-leap Feb)
  - `getDaysInMonth(2024, 1)` → 29 (leap Feb)
  - `getDaysInMonth(2026, 4)` → 31 (May)
  - `getFirstDayOffset(2026, 4)` → 4 (May 2026 starts on Friday, Mon=0 normalisation)
  - `getFirstDayOffset(2026, 0)` → 3 (Jan 2026 starts on Thursday)
  - `toISODate(new Date(2026, 4, 18))` → `'2026-05-18'`
  - `getSeason(11)` → `'invierno'`; `getSeason(2)` → `'primavera'`; `getSeason(5)` → `'verano'`; `getSeason(9)` → `'otoño'`

- [x] 2.2 **[GREEN]** Create `src/core/calendar/presentation/utils/calendar.utils.ts` — pure functions, no imports beyond native `Date`. `getFirstDayOffset`: `(new Date(year, month, 1).getDay() + 6) % 7`.

- [x] 2.3 **[RED]** Write failing tests for `calendarStore`. File: `src/core/calendar/infrastructure/store/calendar.store.test.ts`. Assert:
  - Initial `selectedDate` equals `toISODate(new Date())`
  - Initial `currentYear` / `currentMonth` match today
  - `setSelectedDate("2026-07-04")` → `selectedDate === "2026-07-04"`
  - `setCurrentMonth(2027, 3)` → `currentYear === 2027`, `currentMonth === 3`
  - `prevMonth()` from Jan 2026 → Dec 2025
  - `nextMonth()` from Dec 2025 → Jan 2026

- [x] 2.4 **[GREEN]** Create `src/core/calendar/infrastructure/store/calendar.store.ts` — Zustand store with interface `CalendarState`. No `persist` middleware. `prevMonth` / `nextMonth` handle year wrap. Export `useCalendarStore` hook and `calendarStore` singleton (`createStore` pattern consistent with other stores). Satisfies CAP-2.

---

## Phase 3: CalendarCell Component

- [x] 3.1 **[RED]** Write failing tests for `CalendarCell`. File: `src/core/calendar/presentation/components/calendar-cell/calendar-cell.test.tsx`. Assert:
  - Renders nothing interactive when `day` is `null` (aria-hidden slot)
  - Renders day number when `day` is a number
  - Today class is present when `isToday` is `true` and absent when `false`
  - `aria-selected="true"` when `isSelected` is `true`
  - Ring class present when `isSelected` is `true`
  - `onSelect(7)` called when user clicks day 7 cell
  - `onSelect` not called when null slot is clicked

- [x] 3.2 **[GREEN]** Create `src/core/calendar/presentation/components/calendar-cell/calendar-cell.tsx` — `'use client'`. Null slot: `<div aria-hidden="true" />` with `bg-[var(--paper-2)]`. Day cell: `<button>` with day number. Today: `bg-[var(--paper-3)] text-[var(--honey-2)]`. Selected: `ring-2 ring-[var(--forest)]`. No task chips. Satisfies CAP-1 selection and today scenarios.

- [x] 3.3 **[REFACTOR]** Confirm null slot has no click handler; confirm `aria-label` on day buttons includes the full date for screen readers.

---

## Phase 4: CalendarViewSwitcher + CalendarGrid

- [x] 4.1 **[RED]** Write failing tests for `CalendarViewSwitcher`. File: `src/core/calendar/presentation/components/calendar-view-switcher/calendar-view-switcher.test.tsx`. Assert:
  - Mes tab is present and NOT disabled
  - Día, Semana, Año tabs are present and have `disabled` attribute
  - Active tab (Mes) has a distinct class absent from inactive tabs

- [x] 4.2 **[GREEN]** Create `src/core/calendar/presentation/components/calendar-view-switcher/calendar-view-switcher.tsx` — 4 `<button>` tabs inside a `<div>` with `bg-[var(--paper-2)]` pill container. Active (`month`): `bg-[var(--paper)] text-[var(--ink)]`. Inactive: `text-[var(--ink-3)]`. Day/Week/Year: add `disabled` attribute + `opacity-50 cursor-not-allowed`. Satisfies CAP-4.

- [x] 4.3 **[RED]** Write failing tests for `CalendarGrid`. File: `src/core/calendar/presentation/components/calendar-grid/calendar-grid.test.tsx`. Assert:
  - Renders 7 weekday column headers
  - May 2026: 31 day cells + 4 null slots rendered
  - Today cell has the today-specific class
  - Clicking a day fires `onSelectDate` with the correct ISO string
  - Prev-month button fires `onPrevMonth`
  - Next-month button fires `onNextMonth`
  - Header contains the month name, year, and season label

- [x] 4.4 **[GREEN]** Create `src/core/calendar/presentation/components/calendar-grid/calendar-grid.tsx` — `'use client'`. Builds `Array<number | null>` from `getDaysInMonth` + `getFirstDayOffset`. Renders `<CalendarViewSwitcher>` + month header + 7-col grid of `<CalendarCell>`. Month header: `{monthName} {year} · {seasonLabel}`. Prev/Next: lucide-react `ChevronLeft` / `ChevronRight` buttons. `onSelectDate` receives ISO string built with `toISODate`. Satisfies CAP-1.

- [x] 4.5 **[REFACTOR]** Confirm grid root has `role="grid"` and column headers have `role="columnheader"`; confirm prev/next buttons have accessible `aria-label`.

---

## Phase 5: DayTasksPanel + CalendarScreen + Route + Wiring

- [x] 5.1 **[RED]** Write failing tests for `DayTasksPanel`. File: `src/core/calendar/presentation/components/day-tasks-panel/day-tasks-panel.test.tsx`. Assert:
  - "Hoy" appears in the header when `selectedDate` is today's ISO string
  - "Hoy" does NOT appear when `selectedDate` is a different date
  - Formatted day/month appears in the header for any date
  - `InDevelopment` component is rendered in the panel body (mock `InDevelopment`, check it was called)

- [x] 5.2 **[GREEN]** Create `src/core/calendar/presentation/components/day-tasks-panel/day-tasks-panel.tsx` — `'use client'`. Header: `.eyebrow` with "Hoy · DD mes" or "DD mes". Body: `<InDevelopment label={dict.panel.inDevLabel} />`. Panel container: `bg-[var(--paper)] border-l border-[var(--rule)]`. Satisfies CAP-3 panel requirements.

- [x] 5.3 **[RED]** Write failing tests for `CalendarScreen`. File: `src/core/calendar/presentation/screens/calendar/calendar.screen.test.tsx`. Mock `useCalendarStore`, `CalendarGrid`, `DayTasksPanel`. Assert:
  - `CalendarGrid` is rendered with `year`, `month`, `selectedDate` from the store
  - `DayTasksPanel` is rendered with `selectedDate` from the store
  - `onPrevMonth` callback passed to `CalendarGrid` calls `calendarStore.prevMonth`
  - `onNextMonth` callback passed to `CalendarGrid` calls `calendarStore.nextMonth`
  - `onSelectDate` callback passed to `CalendarGrid` calls `calendarStore.setSelectedDate`
  - `ScreenHeader` is rendered with the calendar title

- [x] 5.4 **[GREEN]** Create `src/core/calendar/presentation/screens/calendar/calendar.screen.tsx` — `'use client'`. Calls `useCalendarStore()`. Renders `<ScreenHeader title={dict.screenTitle} />` + `<div className="flex flex-1 overflow-hidden">` wrapping `<CalendarGrid>` (left, `flex-1`) + `<DayTasksPanel>` (right, fixed width `w-72`). All store interactions are callback props — no store imports inside child components. Satisfies CAP-1 through CAP-4.

- [x] 5.5 Create `app/[lang]/(protected)/calendar/page.tsx` — async SC resolving `locale` + `dict`, renders `<CalendarScreen dict={dict.calendar} />`. Satisfies CAP-6 route scenario.

- [x] 5.6 Create i18n files:
  - `src/core/calendar/presentation/i18n/en.ts` — `CalendarDict` with keys: `screenTitle`, `viewSwitcher.{day,week,month,year}`, `grid.{weekdays,seasons,overflow}`, `panel.{todayPrefix,inDevLabel}`.
  - `src/core/calendar/presentation/i18n/es.ts` — `satisfies WidenStringLiterals<CalendarDict>`. Weekdays: L/M/X/J/V/S/D. Seasons: primavera/verano/otoño/invierno. `panel.todayPrefix: 'Hoy'`, `panel.inDevLabel: 'Tareas del día'`.
  - `src/core/calendar/presentation/i18n/i18n-parity.test.ts` — deep-key equality between `enCalendar` and `esCalendar`.

- [x] 5.7 Modify `src/shared/presentation/i18n/get-dictionary.ts` — add `import type { CalendarDict }`, import en/es dicts, add `calendar` key to `AppDict` and both locale entries. Satisfies CAP-6 i18n scenario.

- [x] 5.8 Modify `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` — remove `disabled: true` from the Calendar entry. Satisfies CAP-6 nav scenario.

---

## Definition of Done

- [x] All new test files pass (`pnpm test`).
- [x] `pnpm tsc --noEmit` passes with zero errors.
- [x] `pnpm lint` passes with zero errors.
- [x] `/[lang]/calendar` is accessible from the sidebar and renders the two-column layout.
- [x] Clicking a day cell updates the store and the panel header changes.
- [x] Month navigation updates the grid and the store.
- [x] `DayTasksPanel` body shows `InDevelopment` labelled "Tareas del día".
- [x] `InDevelopment` component is usable standalone from `src/shared/`.
- [x] i18n parity test passes for the `calendar` module.
