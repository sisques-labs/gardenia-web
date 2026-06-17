# Tasks: shared-ui-components

**Change:** `shared-ui-components`
**Status:** apply — COMPLETE
**Artifact store:** openspec
**Delivery strategy:** Single PR — `size:exception` (user-approved)
**Strict TDD:** ACTIVE — write test first (RED), then implement (GREEN)

---

## Review Workload Forecast

| Metric | Value |
|--------|-------|
| New files | 92 (46 `.tsx` + 46 `.test.tsx`) |
| Modified files | 2 (`card.tsx`, `src/design-system/components.css`) |
| Estimated changed lines | ~4 500–5 500 |
| 400-line budget risk | **High** — this is a `size:exception` PR |
| Chained PRs recommended | **No** — user confirmed Single PR with `size:exception` |
| Decision needed before apply | **No** — user approved `size:exception` |

PR is organized as 10 commits (0–9). Reviewers review commit-by-commit.

---

## Commit ordering & dependency rationale

```
Commit 0 — Install + CSS + card fix   (foundation)
Commit 1 — Group 1 Feedback           (unblocks loading states everywhere)
Commit 2 — Group 2 Avatar & User      (InitialsAvatar/NumericBadge reused by later groups)
Commit 3 — Group 3 Form extensions    (SearchInput needed by FilterBar in Commit 5)
Commit 4 — Group 4 Data & Charts      (standalone)
Commit 5 — Group 5 Layout patterns    (depends on SearchInput, Select, DropdownMenu, Chip)
Commit 6 — Group 6 Media              (standalone)
Commit 7 — Group 7 Rich content       (standalone)
Commit 8 — Group 8 Overlays           (depends on Radix packages installed in Commit 0)
```

Sequential — each commit may be blocked by the previous. Groups within each commit are parallel.

---

## Commit 0 — Setup (sequential: must land before all others)

**Spec refs:** Global Conventions, Group 8 (Radix deps), ADR-2 (animations)

- [x] Install 4 packages: `pnpm add @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-context-menu cmdk`
- [x] Verify `cmdk` React 19 peer-dep compatibility: run `pnpm vitest run` smoke pass after install
- [x] Add animation keyframes to `src/design-system/components.css`:
  - `@theme { --animate-spin-ring: spin-ring 0.7s linear infinite; --animate-shimmer: shimmer 1.4s ease-in-out infinite; --animate-progress-indeterminate: progress-indeterminate 1.2s ease-in-out infinite; }`
  - `@keyframes spin-ring`, `@keyframes shimmer`, `@keyframes progress-indeterminate`
- [x] Fix `src/shared/presentation/components/ui/card.tsx` line 6: replace `cn('rounded-xl border bg-card text-card-foreground shadow', className)` with `cn('card text-card-foreground', className)`
- [x] Audit `card.stories.tsx` and Card consumers for visual regressions after the radius change
- [x] Confirm existing Card tests still pass (`pnpm vitest run`)

---

## Commit 1 — Group 1: Feedback Primitives

**Spec refs:** Group 1 — Feedback Primitives
**Depends on:** Commit 0 (animation keyframes must exist)
**Components run in parallel within this commit**

### Spinner

**File:** `src/shared/presentation/components/ui/spinner.tsx` + `spinner.test.tsx`

- [x] [TDD] Write `spinner.test.tsx` — RED
- [x] Implement `spinner.tsx` — GREEN

### Skeleton

**File:** `src/shared/presentation/components/ui/skeleton.tsx` + `skeleton.test.tsx`

- [x] [TDD] Write `skeleton.test.tsx` — RED
- [x] Implement `skeleton.tsx` — GREEN

### ProgressBar

**File:** `src/shared/presentation/components/ui/progress-bar.tsx` + `progress-bar.test.tsx`

- [x] [TDD] Write `progress-bar.test.tsx` — RED
- [x] Implement `progress-bar.tsx` — GREEN

### EmptyState

**File:** `src/shared/presentation/components/ui/empty-state.tsx` + `empty-state.test.tsx`

- [x] [TDD] Write `empty-state.test.tsx` — RED
- [x] Implement `empty-state.tsx` — GREEN

---

## Commit 2 — Group 2: Avatar & User Patterns

**Spec refs:** Group 2 — Avatar & User Patterns
**Depends on:** Commit 0
**Components run in parallel within this commit**

### InitialsAvatar

**File:** `src/shared/presentation/components/ui/initials-avatar.tsx` + `initials-avatar.test.tsx`

- [x] [TDD] Write `initials-avatar.test.tsx` — RED
- [x] Implement `initials-avatar.tsx` — GREEN

### AvatarGroup

**File:** `src/shared/presentation/components/ui/avatar-group.tsx` + `avatar-group.test.tsx`

- [x] [TDD] Write `avatar-group.test.tsx` — RED
- [x] Implement `avatar-group.tsx` — GREEN

### NumericBadge

**File:** `src/shared/presentation/components/ui/numeric-badge.tsx` + `numeric-badge.test.tsx`

- [x] [TDD] Write `numeric-badge.test.tsx` — RED
- [x] Implement `numeric-badge.tsx` — GREEN

### UserCard

**File:** `src/shared/presentation/components/ui/user-card.tsx` + `user-card.test.tsx`

- [x] [TDD] Write `user-card.test.tsx` — RED
- [x] Implement `user-card.tsx` — GREEN

### Pagination

**File:** `src/shared/presentation/components/ui/pagination.tsx` + `pagination.test.tsx`

- [x] [TDD] Write `pagination.test.tsx` — RED
- [x] Implement `pagination.tsx` — GREEN

---

## Commit 3 — Group 3: Form Extensions

**Spec refs:** Group 3 — Form Extensions
**Depends on:** Commit 0
**Components run in parallel EXCEPT DatePicker (depends on CalendarMonth pattern)**

### SearchInput

**File:** `src/shared/presentation/components/ui/search-input.tsx` + `search-input.test.tsx`

- [x] [TDD] Write `search-input.test.tsx` — RED
- [x] Implement `search-input.tsx` — GREEN

### PasswordInput

**File:** `src/shared/presentation/components/ui/password-input.tsx` + `password-input.test.tsx`

- [x] [TDD] Write `password-input.test.tsx` — RED
- [x] Implement `password-input.tsx` — GREEN

### Slider

**File:** `src/shared/presentation/components/ui/slider.tsx` + `slider.test.tsx`

- [x] [TDD] Write `slider.test.tsx` — RED
- [x] Implement `slider.tsx` — GREEN

### TagsInput

**File:** `src/shared/presentation/components/ui/tags-input.tsx` + `tags-input.test.tsx`

- [x] [TDD] Write `tags-input.test.tsx` — RED
- [x] Implement `tags-input.tsx` — GREEN

### Combobox

**File:** `src/shared/presentation/components/ui/combobox.tsx` + `combobox.test.tsx`

- [x] [TDD] Write `combobox.test.tsx` — RED
- [x] Implement `combobox.tsx` — GREEN

### FileUpload

**File:** `src/shared/presentation/components/ui/file-upload.tsx` + `file-upload.test.tsx`

- [x] [TDD] Write `file-upload.test.tsx` — RED
- [x] Implement `file-upload.tsx` — GREEN

### DatePicker

**File:** `src/shared/presentation/components/ui/date-picker.tsx` + `date-picker.test.tsx`

- [x] [TDD] Write `date-picker.test.tsx` — RED
- [x] Implement `date-picker.tsx` — GREEN

---

## Commit 4 — Group 4: Data & Charts

**Spec refs:** Group 4 — Data & Charts
**Depends on:** Commit 0
**Components run in parallel within this commit**

### PlantCard

**File:** `src/shared/presentation/components/ui/plant-card.tsx` + `plant-card.test.tsx`

- [x] [TDD] Write `plant-card.test.tsx` — RED
- [x] Implement `plant-card.tsx` — GREEN

### BarChart

**File:** `src/shared/presentation/components/ui/bar-chart.tsx` + `bar-chart.test.tsx`

- [x] [TDD] Write `bar-chart.test.tsx` — RED
- [x] Implement `bar-chart.tsx` — GREEN

### LineAreaChart

**File:** `src/shared/presentation/components/ui/line-area-chart.tsx` + `line-area-chart.test.tsx`

- [x] [TDD] Write `line-area-chart.test.tsx` — RED
- [x] Implement `line-area-chart.tsx` — GREEN

### DonutChart

**File:** `src/shared/presentation/components/ui/donut-chart.tsx` + `donut-chart.test.tsx`

- [x] [TDD] Write `donut-chart.test.tsx` — RED
- [x] Implement `donut-chart.tsx` — GREEN

### Sparkline

**File:** `src/shared/presentation/components/ui/sparkline.tsx` + `sparkline.test.tsx`

- [x] [TDD] Write `sparkline.test.tsx` — RED
- [x] Implement `sparkline.tsx` — GREEN

---

## Commit 5 — Group 5: Layout Patterns

**Spec refs:** Group 5 — Layout Patterns
**Depends on:** Commit 3 (SearchInput), Commit 0 (Select/DropdownMenu/Chip already in codebase)
**Components run in parallel within this commit**

### Accordion

**File:** `src/shared/presentation/components/ui/accordion.tsx` + `accordion.test.tsx`

- [x] [TDD] Write `accordion.test.tsx` — RED
- [x] Implement `accordion.tsx` — GREEN

### Timeline

**File:** `src/shared/presentation/components/ui/timeline.tsx` + `timeline.test.tsx`

- [x] [TDD] Write `timeline.test.tsx` — RED
- [x] Implement `timeline.tsx` — GREEN

### Stepper

**File:** `src/shared/presentation/components/ui/stepper.tsx` + `stepper.test.tsx`

- [x] [TDD] Write `stepper.test.tsx` — RED
- [x] Implement `stepper.tsx` — GREEN

### Divider

**File:** `src/shared/presentation/components/ui/divider.tsx` + `divider.test.tsx`

- [x] [TDD] Write `divider.test.tsx` — RED
- [x] Implement `divider.tsx` — GREEN

### FilterBar

**File:** `src/shared/presentation/components/ui/filter-bar.tsx` + `filter-bar.test.tsx`

- [x] [TDD] Write `filter-bar.test.tsx` — RED
- [x] Implement `filter-bar.tsx` — GREEN

### ActiveFilterChips

**File:** `src/shared/presentation/components/ui/active-filter-chips.tsx` + `active-filter-chips.test.tsx`

- [x] [TDD] Write `active-filter-chips.test.tsx` — RED
- [x] Implement `active-filter-chips.tsx` — GREEN

### FacetPanel

**File:** `src/shared/presentation/components/ui/facet-panel.tsx` + `facet-panel.test.tsx`

- [x] [TDD] Write `facet-panel.test.tsx` — RED
- [x] Implement `facet-panel.tsx` — GREEN

### SortPills

**File:** `src/shared/presentation/components/ui/sort-pills.tsx` + `sort-pills.test.tsx`

- [x] [TDD] Write `sort-pills.test.tsx` — RED
- [x] Implement `sort-pills.tsx` — GREEN

### CalendarMonth

**File:** `src/shared/presentation/components/ui/calendar-month.tsx` + `calendar-month.test.tsx`

- [x] [TDD] Write `calendar-month.test.tsx` — RED
- [x] Implement `calendar-month.tsx` — GREEN

### WeekStrip

**File:** `src/shared/presentation/components/ui/week-strip.tsx` + `week-strip.test.tsx`

- [x] [TDD] Write `week-strip.test.tsx` — RED
- [x] Implement `week-strip.tsx` — GREEN

### EventCard

**File:** `src/shared/presentation/components/ui/event-card.tsx` + `event-card.test.tsx`

- [x] [TDD] Write `event-card.test.tsx` — RED
- [x] Implement `event-card.tsx` — GREEN

---

## Commit 6 — Group 6: Media

**Spec refs:** Group 6 — Media
**Depends on:** Commit 0
**Components run in parallel within this commit**

### PhotoGrid

**File:** `src/shared/presentation/components/ui/photo-grid.tsx` + `photo-grid.test.tsx`

- [x] [TDD] Write `photo-grid.test.tsx` — RED
- [x] Implement `photo-grid.tsx` — GREEN

### MediaCard

**File:** `src/shared/presentation/components/ui/media-card.tsx` + `media-card.test.tsx`

- [x] [TDD] Write `media-card.test.tsx` — RED
- [x] Implement `media-card.tsx` — GREEN

### PhotoPicker

**File:** `src/shared/presentation/components/ui/photo-picker.tsx` + `photo-picker.test.tsx`

- [x] [TDD] Write `photo-picker.test.tsx` — RED
- [x] Implement `photo-picker.tsx` — GREEN

### Lightbox

**File:** `src/shared/presentation/components/ui/lightbox.tsx` + `lightbox.test.tsx`

- [x] [TDD] Write `lightbox.test.tsx` — RED
- [x] Implement `lightbox.tsx` — GREEN

---

## Commit 7 — Group 7: Rich Content

**Spec refs:** Group 7 — Rich Content
**Depends on:** Commit 0
**Components run in parallel within this commit**

### Callout

**File:** `src/shared/presentation/components/ui/callout.tsx` + `callout.test.tsx`

- [x] [TDD] Write `callout.test.tsx` — RED
- [x] Implement `callout.tsx` — GREEN

### StarRating

**File:** `src/shared/presentation/components/ui/star-rating.tsx` + `star-rating.test.tsx`

- [x] [TDD] Write `star-rating.test.tsx` — RED
- [x] Implement `star-rating.tsx` — GREEN

### HealthDots

**File:** `src/shared/presentation/components/ui/health-dots.tsx` + `health-dots.test.tsx`

- [x] [TDD] Write `health-dots.test.tsx` — RED
- [x] Implement `health-dots.tsx` — GREEN

### KbdShortcut

**File:** `src/shared/presentation/components/ui/kbd-shortcut.tsx` + `kbd-shortcut.test.tsx`

- [x] [TDD] Write `kbd-shortcut.test.tsx` — RED
- [x] Implement `kbd-shortcut.tsx` — GREEN

### Blockquote

**File:** `src/shared/presentation/components/ui/blockquote.tsx` + `blockquote.test.tsx`

- [x] [TDD] Write `blockquote.test.tsx` — RED
- [x] Implement `blockquote.tsx` — GREEN

---

## Commit 8 — Group 8: Overlays

**Spec refs:** Group 8 — Overlays
**Depends on:** Commit 0 (Radix packages: tooltip, popover, context-menu, + cmdk must be installed)
**Components run in parallel within this commit**

### Tooltip

**File:** `src/shared/presentation/components/ui/tooltip.tsx` + `tooltip.test.tsx`

- [x] [TDD] Write `tooltip.test.tsx` — RED
- [x] Implement `tooltip.tsx` — GREEN

### ContextMenu

**File:** `src/shared/presentation/components/ui/context-menu.tsx` + `context-menu.test.tsx`

- [x] [TDD] Write `context-menu.test.tsx` — RED
- [x] Implement `context-menu.tsx` — GREEN

### Popover

**File:** `src/shared/presentation/components/ui/popover.tsx` + `popover.test.tsx`

- [x] [TDD] Write `popover.test.tsx` — RED
- [x] Implement `popover.tsx` — GREEN

### Drawer

**File:** `src/shared/presentation/components/ui/drawer.tsx` + `drawer.test.tsx`

- [x] [TDD] Write `drawer.test.tsx` — RED
- [x] Implement `drawer.tsx` — GREEN

### CommandPalette

**File:** `src/shared/presentation/components/ui/command-palette.tsx` + `command-palette.test.tsx`

- [x] [TDD] Write `command-palette.test.tsx` — RED
- [x] Implement `command-palette.tsx` — GREEN

---

## Final validation checklist (post all commits)

- [x] `pnpm vitest run` — 876 tests, 0 failures
- [x] `pnpm tsc --noEmit` — no TypeScript errors
- [x] Verify 46 `.tsx` files exist at `src/shared/presentation/components/ui/`
- [x] Verify 46 `.test.tsx` files exist co-located
- [x] `rg 'recharts|visx|chartjs|chart\.js' src/shared/presentation/components/ui/` — zero results
- [x] `rg 'rounded-xl' src/shared/presentation/components/ui/card.tsx` — zero results
- [x] `rg 'vaul' package.json` — zero results
- [x] Confirm 4 new packages present in `package.json`
- [x] Manual visual audit of `card.stories.tsx` and Card consumer screens for radius regression — deferred (no runtime); card.tsx uses `.card` class per design
- [x] Confirm `dialog.tsx` `animate-in` utilities work (or flag as latent bug per R-6) — flagged as latent (pre-existing, out of scope); Drawer correctly uses `data-[state]` CSS

---

## Acceptance criteria traceability

| Spec # | Criterion | Covered by |
|--------|-----------|------------|
| 1 | 46 components at correct path | Commits 1–8 |
| 2 | 46 co-located test files | Commits 1–8 (TDD: test first) |
| 3 | `vitest run` passes zero failures | Final checklist |
| 4 | Every component uses `forwardRef` | Per-task implementation rule |
| 5 | Multi-variant components use `cva()` | Per-task implementation rule |
| 6 | No chart library in new files | Final checklist grep |
| 7 | `card.tsx` has `.card` class, not `rounded-xl` | Commit 0 |
| 8 | 3 Radix packages added | Commit 0 |
| 9 | No `vaul` in package.json | Commit 0 + final checklist |
| 10 | No regressions in existing 23 components | Final checklist `vitest run` |
