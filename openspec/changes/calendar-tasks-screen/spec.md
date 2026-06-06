# Spec: Calendar Tasks Screen

## Summary

| Capability | Requirements | Scenarios | Type |
|------------|-------------|-----------|------|
| CAP-1 Monthly Calendar Grid | 6 | 11 | New |
| CAP-2 Day Tasks Panel | 4 | 7 | New |
| CAP-3 View Switcher | 2 | 3 | New |
| CAP-4 Add Task CTA | 1 | 1 | New |
| CAP-5 Calendar Route + Nav | 2 | 3 | New |

---

## CAP-1: Monthly Calendar Grid

### Purpose

Display a navigable month grid where each cell represents a day. Cells show abbreviated task chips and support selection to load the day panel.

---

### Requirement: Grid renders current month on mount

`CalendarGrid` MUST display 7 column headers (L, M, X, J, V, S, D) and all days of the current month on initial render.

#### Scenario: Default month matches today

- GIVEN `CalendarGrid` mounts with `year` and `month` matching today's date
- WHEN rendered
- THEN column headers L M X J V S D are visible
- AND the day number matching today is present in the grid

#### Scenario: Empty slots before first day of month

- GIVEN a month whose first day is not Monday
- WHEN rendered
- THEN empty non-interactive cells fill the slots before the first day in the first row

---

### Requirement: Today's cell has a distinct visual treatment

The cell whose date equals today's date MUST render with a visually distinct background.

#### Scenario: Today cell has highlight

- GIVEN `CalendarGrid` is rendering the current month
- WHEN rendered
- THEN the cell for today has a CSS class or style that differs from regular cells
- AND the day number in that cell has a distinct color

---

### Requirement: Selected day has a selection indicator

The cell for `selectedDate` MUST render with a ring or border that distinguishes it from the today highlight.

#### Scenario: Selected cell has ring

- GIVEN `CalendarGrid` receives a `selectedDate` matching a specific day
- WHEN rendered
- THEN that cell has `aria-selected="true"` or equivalent selection indicator

#### Scenario: Clicking an unselected cell fires onSelectDate

- GIVEN `CalendarGrid` renders with `onSelectDate` callback
- WHEN the user clicks a day cell
- THEN `onSelectDate` is called with the corresponding `Date` object

---

### Requirement: Task chips render on days with tasks

Each cell with tasks MUST show abbreviated chip labels. At most 2 chips are shown; additional tasks are indicated by a "+n más" chip.

#### Scenario: Single task renders one chip

- GIVEN `tasksByDate` contains 1 task for a given day
- WHEN that cell renders
- THEN one task chip is visible with a truncated label

#### Scenario: More than 2 tasks renders overflow chip

- GIVEN `tasksByDate` contains 3 tasks for a given day
- WHEN that cell renders
- THEN exactly 2 task chips are visible plus a "+1 más" chip

#### Scenario: Day with no tasks renders no chips

- GIVEN `tasksByDate` has no entry for a given day
- WHEN that cell renders
- THEN no chip elements are rendered inside the cell

---

### Requirement: Month navigation changes displayed month

`CalendarGrid` MUST call `onPrevMonth` / `onNextMonth` when the respective navigation buttons are clicked. The parent updates `year`/`month` props; the grid re-renders with the new month.

#### Scenario: Previous month button fires callback

- GIVEN `CalendarGrid` renders with `onPrevMonth` callback
- WHEN the user clicks the previous-month button
- THEN `onPrevMonth` is called once

#### Scenario: Next month button fires callback

- GIVEN `CalendarGrid` renders with `onNextMonth` callback
- WHEN the user clicks the next-month button
- THEN `onNextMonth` is called once

---

### Requirement: Month header shows name, year and season

The grid header MUST display the current month name, year, and derived season label.

#### Scenario: Header content matches current month

- GIVEN `CalendarGrid` with `year=2026` and `month=4` (May, 0-indexed)
- WHEN rendered
- THEN the header contains "Mayo", "2026", and the season label for that month

---

## CAP-2: Day Tasks Panel

### Purpose

Right-hand panel displaying the tasks scheduled for the selected day, with date label, task count, and task rows.

---

### Requirement: Panel header shows date and task count

`DayTasksPanel` MUST render an eyebrow with the formatted date and a headline with the task count.

#### Scenario: Today shows "Hoy · DD mes" in eyebrow

- GIVEN `DayTasksPanel` receives a `date` equal to today
- WHEN rendered
- THEN the eyebrow contains "Hoy" followed by the formatted date

#### Scenario: Task count headline

- GIVEN `DayTasksPanel` receives an array of 3 tasks
- WHEN rendered
- THEN the headline contains "3 tareas programadas"

#### Scenario: Singular task count

- GIVEN `DayTasksPanel` receives an array of 1 task
- WHEN rendered
- THEN the headline contains "1 tarea programada"

---

### Requirement: Each task row shows dot, time, checkbox, title and description

`DayTasksPanel` MUST render each task as a row containing: a coloured dot, an optional time label, a checkbox, the task title, and an optional description line.

#### Scenario: Task row renders all fields

- GIVEN a task with `time: "07:30"`, `title: "Regar bancal A"`, `description: "tomates y albahaca"`, `color: "forest"`
- WHEN `DayTasksPanel` renders it
- THEN a dot with the forest colour class, time "07:30", a checkbox, "Regar bancal A", and "tomates y albahaca" are all present in the row

#### Scenario: Task without time renders no time element

- GIVEN a task with no `time` field
- WHEN rendered
- THEN no time element is present in the row

---

### Requirement: Empty state when no tasks

When `tasks` is an empty array, `DayTasksPanel` MUST render an empty-state message instead of a task list.

#### Scenario: Empty state message

- GIVEN `DayTasksPanel` receives `tasks: []`
- WHEN rendered
- THEN an empty-state message is visible (no task rows rendered)

---

### Requirement: Done tasks have a visual strikethrough or checked checkbox

A task with `done: true` MUST render its checkbox in the `.cbox.done` state.

#### Scenario: Done task has checked checkbox

- GIVEN a task with `done: true`
- WHEN rendered
- THEN the checkbox element has the `.cbox.done` class

---

## CAP-3: View Switcher

### Purpose

Tab row (Día | Semana | Mes | Año) enabling switching between calendar views. Only Mes is functional in this change.

---

### Requirement: Active view is visually highlighted

`CalendarViewSwitcher` MUST render the active view tab with a distinct active style.

#### Scenario: Mes tab is active on mount

- GIVEN `CalendarViewSwitcher` receives `activeView="month"`
- WHEN rendered
- THEN the "Mes" tab has the active visual treatment (distinct background/colour)
- AND the other tabs do not

---

### Requirement: Non-active tabs render but do not trigger navigation

Día, Semana, and Año tabs MUST render as visible buttons but are disabled in this iteration.

#### Scenario: Disabled tabs are present

- GIVEN `CalendarViewSwitcher` renders
- WHEN inspected
- THEN buttons for Día, Semana, and Año are present in the DOM
- AND they carry `aria-disabled="true"` or `disabled` attribute

---

## CAP-4: Add Task CTA

### Purpose

Primary action button ("+ Tarea") in the screen header. Visual scaffold only; no modal or navigation in this change.

---

### Requirement: Add task button renders

The screen header MUST include a button labelled consistently with the i18n key for "Nueva tarea".

#### Scenario: Button is visible

- GIVEN `CalendarScreen` renders
- WHEN inspected
- THEN a button with the "Nueva tarea" label (or icon + label) is visible in the header actions area

---

## CAP-5: Calendar Route + Nav

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

- GIVEN the sidebar renders for a protected route
- WHEN the Calendar nav item is inspected
- THEN `disabled` is absent from the entry and the link is navigable

---

### Requirement: i18n parity

`en.ts` and `es.ts` MUST define identical key trees.

#### Scenario: Parity test passes

- GIVEN the i18n parity test runs
- WHEN both locale files are loaded
- THEN every key present in `en.ts` is also present in `es.ts` with no extras
