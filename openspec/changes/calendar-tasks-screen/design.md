# Design: Calendar Tasks Screen

## Technical Approach

The `CalendarScreen` is a thin orchestrator: it reads from `calendarStore` (Zustand) and dispatches actions on user interaction. All child components are pure (props-in, events-out) and contain no store imports — testable in isolation. The right panel (`DayTasksPanel`) establishes the two-column layout shape and renders the shared `InDevelopment` component as its body; real task content drops in later without touching the column structure or the store contract.

Styling uses existing design tokens (`--paper`, `--paper-2`, `--paper-3`, `--ink`, `--ink-3`, `--forest`, `--rule`) and utility classes (`.eyebrow`, `.headline`, `.dashed-rule`, `.paper-grain`) from `src/design-system/`. No new CSS files.

## Architecture Decisions

### Decision: State ownership — Zustand from day one

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `useState` in `CalendarScreen` | Simplest, zero setup, lost on navigation | Rejected |
| Zustand store (`calendarStore`) | Small overhead; any future component (mini-calendar, badge, task modal) connects without prop refactoring | **Chosen** |
| URL search params | Shareable URLs, but routing overhead not needed yet | Deferred |

**Rationale**: The calendar is a hub — future components (a "today's tasks" widget in Home, a quick-add modal, a notification dot) will need to read or write the selected date and current month. Wiring those via prop drilling or React context would require refactoring this screen. Starting with Zustand is the same amount of work as `useState` but leaves the right extension points open.

### Decision: Store date serialisation

**Choice**: `selectedDate` stored as an ISO date string (`"YYYY-MM-DD"`); `currentYear` and `currentMonth` (0-indexed, JS Date convention) as separate numbers. No `Date` objects in the store.

**Rationale**: `Date` objects do not survive Zustand `persist` serialisation (they round-trip as strings anyway). Keeping primitives avoids a custom serialiser and makes the store state trivially inspectable in devtools. Callers that need a `Date` object call `new Date(store.selectedDate)`.

### Decision: No persist for calendar store (this change)

**Choice**: `calendarStore` uses plain Zustand (no `persist` middleware) for now.

**Rationale**: Calendar UI state (which month is displayed, which day is selected) is ephemeral — resetting to today on refresh is the expected UX. Persistence can be added later if deep-linking or session restoration is requested.

### Decision: Month grid day-of-week offset

**Choice**: Monday-first normalisation via `(dayOfWeek + 6) % 7` where `dayOfWeek` is `new Date(year, month, 1).getDay()`.

**Rationale**: JS `Date.getDay()` returns Sunday=0; shifting by 6 mod 7 gives Monday=0, Sunday=6 — matching the design reference (L M X J V S D). Pure function, trivially testable.

### Decision: CalendarCell — day number only (no chips)

**Choice**: Cells show the day number and highlight states (today, selected) only. No task chips in this iteration.

**Rationale**: There is no task data yet. Adding placeholder chip UI with hard-coded content would be misleading and harder to remove than to add. The `DayTasksPanel` carries the "work in progress" signal; the grid stays clean.

### Decision: DayTasksPanel body — InDevelopment component

**Choice**: `DayTasksPanel` renders a header (selected date label) and the shared `InDevelopment` component as its body.

**Rationale**: The two-column layout is established, the panel header is functional (it reacts to `selectedDate`), and the `InDevelopment` component clearly communicates that task content is coming. This is strictly better than leaving the panel empty or adding fake task rows.

### Decision: InDevelopment as a shared component

**Choice**: `src/shared/presentation/components/in-development/in-development.tsx` — a small card using `.paper-grain` texture, `.eyebrow` label, and an optional `label` prop for what's coming.

**Rationale**: Several screens already show "En desarrollo" as inline text. A shared component ensures consistent visual treatment across all placeholder areas and is easy to find-and-replace when features are ready.

## Component API

### `calendarStore` (Zustand)

```ts
interface CalendarState {
  selectedDate: string;       // ISO "YYYY-MM-DD", default: today
  currentYear: number;        // default: today.getFullYear()
  currentMonth: number;       // 0-indexed, default: today.getMonth()
  setSelectedDate: (iso: string) => void;
  setCurrentMonth: (year: number, month: number) => void;
  prevMonth: () => void;
  nextMonth: () => void;
}
```

### `InDevelopment`

```ts
type Props = {
  label?: string;  // e.g. "Tareas del día" — names what's coming
};
```

### `CalendarCell`

```ts
type Props = {
  day: number | null;       // null = empty pre-month slot
  isToday: boolean;
  isSelected: boolean;
  onSelect: (day: number) => void;
};
```

### `CalendarGrid`

```ts
type Props = {
  year: number;
  month: number;              // 0-indexed
  selectedDate: string;       // ISO
  onSelectDate: (iso: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  dict: CalendarDict['grid'];
};
```

### `CalendarViewSwitcher`

```ts
type View = 'day' | 'week' | 'month' | 'year';
type Props = {
  activeView: View;
  dict: CalendarDict['viewSwitcher'];
};
// onChangeView intentionally omitted — other views are disabled in V1
```

### `DayTasksPanel`

```ts
type Props = {
  selectedDate: string;   // ISO — drives the header label
  dict: CalendarDict['panel'];
};
// Body: renders <InDevelopment label={dict.panel.inDevLabel} />
```

### `CalendarScreen`

```ts
type Props = {
  dict: AppDict['calendar'];
};
// Reads calendarStore; dispatches prevMonth/nextMonth/setSelectedDate
```

## Data Flow

```
calendarStore (Zustand)
  selectedDate: string   ←─ setSelectedDate (cell click)
  currentYear: number    ←─ prevMonth / nextMonth (nav buttons)
  currentMonth: number   ←┘
         │
         ▼
CalendarScreen (reads store via useCalendarStore())
  ├─ CalendarGrid
  │    ├─ CalendarViewSwitcher  (activeView="month", others disabled)
  │    └─ CalendarCell × N      (day number, today + selected highlights)
  │
  └─ DayTasksPanel
       ├─ header: selected date label (eyebrow + date string)
       └─ body: <InDevelopment label="Tareas del día" />
```

## Season Utility

```ts
function getSeason(month: number): 'primavera' | 'verano' | 'otoño' | 'invierno'
// 11, 0, 1  → 'invierno'
// 2, 3, 4   → 'primavera'
// 5, 6, 7   → 'verano'
// 8, 9, 10  → 'otoño'
```

Returns a key; the dict maps it to the locale-specific display label.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/[lang]/(protected)/calendar/page.tsx` | Create | Async SC: resolves locale + dict, renders `<CalendarScreen>` |
| `src/core/calendar/infrastructure/store/calendar.store.ts` | Create | Zustand store: selectedDate ISO, currentYear, currentMonth, actions |
| `src/core/calendar/infrastructure/store/calendar.store.test.ts` | Create | Store unit tests |
| `src/core/calendar/presentation/utils/calendar.utils.ts` | Create | getDaysInMonth, getFirstDayOffset, toISODate, getSeason |
| `src/core/calendar/presentation/utils/calendar.utils.test.ts` | Create | Pure function tests |
| `src/core/calendar/presentation/components/calendar-cell/calendar-cell.tsx` | Create | Day cell: number + today/selected highlight |
| `src/core/calendar/presentation/components/calendar-cell/calendar-cell.test.tsx` | Create | Unit tests |
| `src/core/calendar/presentation/components/calendar-grid/calendar-grid.tsx` | Create | Month grid + navigation header |
| `src/core/calendar/presentation/components/calendar-grid/calendar-grid.test.tsx` | Create | Unit tests |
| `src/core/calendar/presentation/components/calendar-view-switcher/calendar-view-switcher.tsx` | Create | Día/Semana/Mes/Año tab row |
| `src/core/calendar/presentation/components/calendar-view-switcher/calendar-view-switcher.test.tsx` | Create | Unit tests |
| `src/core/calendar/presentation/components/day-tasks-panel/day-tasks-panel.tsx` | Create | Right panel: date header + InDevelopment body |
| `src/core/calendar/presentation/components/day-tasks-panel/day-tasks-panel.test.tsx` | Create | Unit tests |
| `src/core/calendar/presentation/screens/calendar/calendar.screen.tsx` | Create | Thin orchestrator: reads store, renders grid + panel |
| `src/core/calendar/presentation/screens/calendar/calendar.screen.test.tsx` | Create | Screen integration tests |
| `src/core/calendar/presentation/i18n/en.ts` | Create | English dictionary |
| `src/core/calendar/presentation/i18n/es.ts` | Create | Spanish dictionary |
| `src/core/calendar/presentation/i18n/i18n-parity.test.ts` | Create | Key parity test |
| `src/shared/presentation/components/in-development/in-development.tsx` | Create | Shared placeholder card |
| `src/shared/presentation/components/in-development/in-development.test.tsx` | Create | Placeholder tests |
| `src/shared/presentation/i18n/get-dictionary.ts` | Modify | Add CalendarDict + calendar slice |
| `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` | Modify | Remove disabled: true from Calendar entry |
