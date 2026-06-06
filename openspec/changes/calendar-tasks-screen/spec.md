# Spec: Calendar Tasks Screen

## Summary

| Capability | Requirements | Scenarios | Type |
|------------|-------------|-----------|------|
| CAP-1 Monthly Calendar Grid | 5 | 10 | New |
| CAP-2 Calendar Store | 3 | 6 | New |
| CAP-3 Day Panel + InDevelopment | 3 | 5 | New |
| CAP-4 View Switcher | 2 | 3 | New |
| CAP-5 InDevelopment Component | 2 | 3 | New |
| CAP-6 Calendar Route + Nav | 2 | 3 | New |

---

## CAP-1: Monthly Calendar Grid

### Purpose

Display a navigable month grid. Each cell represents one day and supports selection. Today and the selected day have distinct visual treatments. No task chips in this iteration.

---

### Requirement: Grid renders all days of the given month

`CalendarGrid` MUST render a 7-column layout with column headers (L M X J V S D) and one cell for every day in the provided month.

#### Scenario: May 2026 renders 31 cells

- GIVEN `CalendarGrid` with `year=2026` and `month=4` (May)
- WHEN rendered
- THEN 31 day cells are present (days 1–31)
- AND 4 empty offset cells precede day 1 (May 2026 starts on Friday, offset = 4)

#### Scenario: Empty offset slots before first day of month

- GIVEN a month whose first day is not Monday
- WHEN rendered
- THEN `(getFirstDayOffset)` null cells fill the grid before day 1
- AND those slots are non-interactive (`aria-hidden="true"`)

#### Scenario: Column headers render

- GIVEN `CalendarGrid` renders
- WHEN inspected
- THEN 7 column headers matching the dict weekday labels are visible

---

### Requirement: Today's cell has a distinct visual treatment

The cell whose date matches today MUST use a visually distinct background and day-number colour.

#### Scenario: Today cell has highlight class

- GIVEN `CalendarGrid` is rendering the current month
- WHEN rendered
- THEN the cell for today has a CSS class that is absent from all other cells

---

### Requirement: Selected cell shows a selection indicator

The cell for the date in the store's `selectedDate` MUST render with `aria-selected="true"` and a visible ring or border.

#### Scenario: Selected cell has ring

- GIVEN `CalendarGrid` receives a `selectedDate` matching day 15
- WHEN rendered
- THEN the cell for day 15 has `aria-selected="true"` and a ring style

#### Scenario: Clicking a cell fires onSelectDate

- GIVEN `CalendarGrid` renders with an `onSelectDate` callback
- WHEN the user clicks day 10
- THEN `onSelectDate` is called with the ISO string for that day

---

### Requirement: Month navigation buttons fire callbacks

Prev and next buttons MUST call `onPrevMonth` / `onNextMonth`.

#### Scenario: Prev button fires callback

- GIVEN `CalendarGrid` renders with an `onPrevMonth` callback
- WHEN the user clicks the previous-month button
- THEN `onPrevMonth` is called once

#### Scenario: Next button fires callback

- GIVEN `CalendarGrid` renders with an `onNextMonth` callback
- WHEN the user clicks the next-month button
- THEN `onNextMonth` is called once

---

### Requirement: Header shows month name, year and season

#### Scenario: Header content matches props

- GIVEN `CalendarGrid` with `year=2026`, `month=4` (May)
- WHEN rendered
- THEN the header contains the May label, "2026", and a season label

---

## CAP-2: Calendar Store

### Purpose

Zustand store owning the calendar's ephemeral UI state: the selected day and the currently viewed month/year. Centralised so future components can connect without prop drilling.

---

### Requirement: Store initialises to today

On creation the store MUST initialise `selectedDate` to today's ISO string, `currentYear` to today's year, and `currentMonth` to today's month (0-indexed).

#### Scenario: Initial state matches today

- GIVEN `calendarStore` is accessed for the first time
- WHEN initial state is read
- THEN `selectedDate` equals `toISODate(new Date())`
- AND `currentYear` equals `new Date().getFullYear()`
- AND `currentMonth` equals `new Date().getMonth()`

---

### Requirement: setSelectedDate updates selectedDate

#### Scenario: setSelectedDate stores the ISO string

- GIVEN `calendarStore`
- WHEN `setSelectedDate("2026-07-04")` is called
- THEN `selectedDate` equals `"2026-07-04"`

---

### Requirement: prevMonth / nextMonth navigate between months correctly

`prevMonth` MUST decrement the month, wrapping from January to December of the previous year. `nextMonth` MUST increment, wrapping from December to January of the next year.

#### Scenario: prevMonth wraps across year boundary

- GIVEN `currentYear=2026`, `currentMonth=0` (January)
- WHEN `prevMonth()` is called
- THEN `currentYear=2025` and `currentMonth=11` (December)

#### Scenario: nextMonth wraps across year boundary

- GIVEN `currentYear=2025`, `currentMonth=11` (December)
- WHEN `nextMonth()` is called
- THEN `currentYear=2026` and `currentMonth=0` (January)

#### Scenario: setCurrentMonth updates both year and month

- GIVEN `calendarStore`
- WHEN `setCurrentMonth(2027, 3)` is called
- THEN `currentYear=2027` and `currentMonth=3`

---

## CAP-3: Day Panel + InDevelopment

### Purpose

Right-hand panel that displays the selected date label in its header and shows the `InDevelopment` placeholder component as its body. Establishes the two-column layout; real task content replaces the placeholder in a future change.

---

### Requirement: Panel header shows the selected date

`DayTasksPanel` MUST render an eyebrow with "Hoy" prefix when the date is today, or just the formatted date otherwise.

#### Scenario: Today date shows "Hoy" prefix

- GIVEN `DayTasksPanel` receives `selectedDate` equal to today's ISO string
- WHEN rendered
- THEN the header contains "Hoy"

#### Scenario: Non-today date shows formatted date only

- GIVEN `DayTasksPanel` receives `selectedDate` for a date other than today
- WHEN rendered
- THEN the header contains the formatted day/month string and does NOT contain "Hoy"

---

### Requirement: Panel body renders InDevelopment component

The body of `DayTasksPanel` MUST render `<InDevelopment>` with the i18n label for "Tareas del día".

#### Scenario: InDevelopment is rendered

- GIVEN `DayTasksPanel` renders
- WHEN inspected
- THEN the `InDevelopment` component (or its rendered output) is present inside the panel body

---

### Requirement: CalendarScreen connects store to panel

`CalendarScreen` MUST pass `calendarStore.selectedDate` to `DayTasksPanel` as its `selectedDate` prop.

#### Scenario: Clicking a cell updates the panel header

- GIVEN `CalendarScreen` renders
- WHEN the user clicks a day cell
- THEN `calendarStore.setSelectedDate` is called
- AND `DayTasksPanel` receives the updated `selectedDate`

---

## CAP-4: View Switcher

### Purpose

Tab row (Día | Semana | Mes | Año) above the calendar grid. Only Mes is active in this change.

---

### Requirement: Active view tab is visually highlighted

`CalendarViewSwitcher` MUST render the active tab with a distinct background/colour.

#### Scenario: Mes tab is active

- GIVEN `CalendarViewSwitcher` renders with `activeView="month"`
- WHEN rendered
- THEN the "Mes" tab has the active visual treatment
- AND the other 3 tabs do not

---

### Requirement: Non-month tabs are present but disabled

Día, Semana, and Año tabs MUST render and carry `disabled` or `aria-disabled="true"`.

#### Scenario: Disabled tabs render

- GIVEN `CalendarViewSwitcher` renders
- WHEN inspected
- THEN buttons for Día, Semana, and Año are in the DOM with `disabled` or `aria-disabled="true"`

#### Scenario: Mes tab is not disabled

- GIVEN `CalendarViewSwitcher` renders
- WHEN inspected
- THEN the Mes tab does NOT have `disabled` or `aria-disabled`

---

## CAP-5: InDevelopment Shared Component

### Purpose

A reusable placeholder card used wherever a feature area is not yet implemented. Provides a consistent visual signal across all in-progress screens.

---

### Requirement: Renders with default content

`InDevelopment` MUST render without any required props and display a visible placeholder message.

#### Scenario: Default render

- GIVEN `<InDevelopment />` renders with no props
- WHEN inspected
- THEN a visible placeholder element is present (no crash, no empty DOM)

---

### Requirement: label prop customises the display

When `label` is provided, `InDevelopment` MUST display it to communicate what feature is coming.

#### Scenario: Label renders when provided

- GIVEN `<InDevelopment label="Tareas del día" />` renders
- WHEN inspected
- THEN "Tareas del día" is present in the rendered output

#### Scenario: Component renders without label

- GIVEN `<InDevelopment />` renders without `label`
- WHEN inspected
- THEN the component renders successfully with fallback content

---

## CAP-6: Calendar Route + Nav

### Purpose

Make the calendar accessible: create the protected route and enable the sidebar nav item.

---

### Requirement: `/[lang]/calendar` route renders CalendarScreen

The Next.js page at `app/[lang]/(protected)/calendar/page.tsx` MUST render `<CalendarScreen>` with the resolved i18n dict slice.

#### Scenario: Route renders screen

- GIVEN a user navigates to `/es/calendar`
- WHEN the page loads
- THEN `CalendarScreen` is mounted and the calendar grid is visible

---

### Requirement: Calendar nav item is enabled in the sidebar

The Calendar entry in `NAV_ITEMS` MUST NOT have `disabled: true`.

#### Scenario: Nav item is clickable

- GIVEN the sidebar renders
- WHEN the Calendar nav item is inspected
- THEN the `disabled` property is absent and the link is navigable

---

### Requirement: i18n parity

`en.ts` and `es.ts` MUST define identical key trees.

#### Scenario: Parity test passes

- GIVEN the i18n parity test runs
- WHEN both locale files are loaded
- THEN every key in `en.ts` exists in `es.ts` with no missing or extra keys
