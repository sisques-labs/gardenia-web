# Design: Calendar Tasks Screen

## Technical Approach

Presentation-only. No backend API exists for tasks yet, so this change establishes the full UI structure with a static mock fixture. `CalendarScreen` owns two pieces of local state; all child components are pure (props-in, events-out). When a real tasks API lands, only `CalendarScreen` needs updating — the components below it remain unchanged.

Design tokens (`--paper`, `--paper-2`, `--ink`, `--ink-3`, `--forest`, `--honey`, `--terracotta`, `--rule`) and utility classes (`.eyebrow`, `.headline`, `.chip`, `.cbox`, `.dashed-rule`, `.paper-grain`) from `src/design-system/` are used throughout. No new CSS files.

## Architecture Decisions

### Decision: State ownership

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `useState` in `CalendarScreen` (local) | Simple, no store overhead; lost on navigation | **Chosen** |
| Zustand store for selectedDate + currentMonth | Survives navigation, but calendar state is ephemeral by nature | Rejected |
| URL search params (`?month=2026-05&day=18`) | Shareable URLs, but adds routing overhead not needed yet | Deferred |

**Rationale**: Calendar state (which month is visible, which day is selected) is ephemeral presentation state. It doesn't need to survive navigation or be shared across the app. Local `useState` is the right tool; a URL-param approach can be added when deep-linking becomes a requirement.

### Decision: Mock data strategy

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Hard-coded dates (e.g. "2026-05-18") | Simple but stale after the month passes | Rejected |
| Dates relative to `new Date()` at fixture load time | Always relevant, zero maintenance | **Chosen** |
| Server-side fixture via Next.js `page.tsx` | Adds unnecessary complexity for a stub | Rejected |

**Rationale**: The fixture generates keys relative to `today` (e.g. `today + 0 days`, `today + 2 days`, etc.) so the mock calendar always has tasks near the current month regardless of when the app is opened.

### Decision: Month grid day-of-week offset

**Choice**: Compute `firstDayOffset` as `(dayOfWeek(1st of month) + 6) % 7` to normalise Monday=0. Fill offset cells with `null` entries rendered as empty, greyed-out slots. No external date library; native `Date` API only.

**Rationale**: No date library needed for the limited operations required (first day of month, days in month, ISO string formatting). Avoids adding a dependency; pure functions are trivially testable.

### Decision: Task color mapping

**Choice**: `CalendarTask.color` is one of `'forest' | 'honey' | 'terracotta' | 'sage'` — maps directly to design-system chip/dot class names. No CSS-in-JS or dynamic colour computation.

**Rationale**: Mirrors the design reference where the right panel uses `oklch(0.42 0.07 145)` (forest) and `oklch(0.62 0.13 65)` (honey-2) as category colours. Keeping the type as a union of token names makes the mapping zero-overhead.

### Decision: CalendarCell chip truncation

**Choice**: Show a maximum of 2 task chips per cell; if more tasks exist, show a "+n más" chip using the `.chip` utility class. Chip text is truncated at 12 characters with CSS `truncate`.

**Rationale**: Matches the design reference (cells show "Regar A,B" / "Polinizar" — short labels). Prevents cell overflow in a fixed-height grid.

### Decision: DayTasksPanel empty state

**Choice**: When a selected day has no tasks, show an empty-state message using eyebrow + small paragraph ("Sin tareas · {date}"). No illustration needed for V1.

**Rationale**: Simple and consistent with the design system's text-first aesthetic.

## Component API

### `CalendarTask` (domain interface)

```ts
interface CalendarTask {
  id: string;
  title: string;
  description?: string;
  time?: string;          // "HH:MM"
  color: 'forest' | 'honey' | 'terracotta' | 'sage';
  done: boolean;
}
```

### `CalendarCell`

```ts
type Props = {
  day: number | null;          // null = empty pre-month slot
  isToday: boolean;
  isSelected: boolean;
  tasks: CalendarTask[];
  onSelect: (day: number) => void;
};
```

### `CalendarGrid`

```ts
type Props = {
  year: number;
  month: number;                     // 0-indexed (JS Date convention)
  tasksByDate: Record<string, CalendarTask[]>;  // key: "YYYY-MM-DD"
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
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
  onChangeView: (view: View) => void;  // no-op for day/week/year in V1
  dict: CalendarDict['viewSwitcher'];
};
```

### `DayTasksPanel`

```ts
type Props = {
  date: Date;
  tasks: CalendarTask[];
  dict: CalendarDict['panel'];
};
```

### `CalendarScreen`

```ts
type Props = {
  dict: AppDict['calendar'];
};
```

## Data Flow

```
CalendarScreen
  state: currentMonth { year, month }  ← prev/next buttons
  state: selectedDate: Date            ← cell click (default: today)
  data:  tasksByDate (from mock)
         │
         ├─ CalendarGrid
         │    ├─ CalendarViewSwitcher (activeView='month')
         │    └─ CalendarCell × N
         │         └─ task chips (≤2 + "+n más")
         │
         └─ DayTasksPanel
              └─ task rows (dot · time · cbox · title · description)
```

## Season Utility

```ts
function getSeason(month: number): string
// month: 0-indexed
// 11,0,1  → 'invierno'
// 2,3,4   → 'primavera'
// 5,6,7   → 'verano'
// 8,9,10  → 'otoño'
```

Returns a raw season name; the dict maps to the i18n label.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/[lang]/(protected)/calendar/page.tsx` | Create | Async SC: resolves locale + dict slice, renders `<CalendarScreen>` |
| `src/core/calendar/domain/interfaces/calendar-task.interface.ts` | Create | `CalendarTask` interface |
| `src/core/calendar/presentation/mocks/calendar-tasks.mock.ts` | Create | Static fixture relative to `new Date()` |
| `src/core/calendar/presentation/utils/calendar.utils.ts` | Create | `getDaysInMonth`, `getFirstDayOffset`, `toISODate`, `getSeason` |
| `src/core/calendar/presentation/utils/calendar.utils.test.ts` | Create | Pure function tests |
| `src/core/calendar/presentation/components/calendar-cell/calendar-cell.tsx` | Create | Day cell component |
| `src/core/calendar/presentation/components/calendar-cell/calendar-cell.test.tsx` | Create | Unit tests |
| `src/core/calendar/presentation/components/calendar-grid/calendar-grid.tsx` | Create | Month grid component |
| `src/core/calendar/presentation/components/calendar-grid/calendar-grid.test.tsx` | Create | Unit tests |
| `src/core/calendar/presentation/components/calendar-view-switcher/calendar-view-switcher.tsx` | Create | Tab switcher |
| `src/core/calendar/presentation/components/calendar-view-switcher/calendar-view-switcher.test.tsx` | Create | Unit tests |
| `src/core/calendar/presentation/components/day-tasks-panel/day-tasks-panel.tsx` | Create | Right panel |
| `src/core/calendar/presentation/components/day-tasks-panel/day-tasks-panel.test.tsx` | Create | Unit tests |
| `src/core/calendar/presentation/screens/calendar/calendar.screen.tsx` | Create | Main screen |
| `src/core/calendar/presentation/screens/calendar/calendar.screen.test.tsx` | Create | Screen tests |
| `src/core/calendar/presentation/i18n/en.ts` | Create | English dict |
| `src/core/calendar/presentation/i18n/es.ts` | Create | Spanish dict |
| `src/core/calendar/presentation/i18n/i18n-parity.test.ts` | Create | Key parity test |
| `src/shared/presentation/i18n/get-dictionary.ts` | Modify | Add `CalendarDict` import + `calendar` slice |
| `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` | Modify | Remove `disabled: true` from Calendar entry |
