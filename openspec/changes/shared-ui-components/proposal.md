# Proposal: shared-ui-components

**Change name:** `shared-ui-components`
**Status:** proposed
**Artifact store:** openspec
**Delivery strategy:** Single PR with `size:exception` (user-approved)

---

## 1. Intent

### What

Add **46 new shared UI components** to `src/shared/presentation/components/ui/`, derived from the Cloudé Design JSX reference files, plus a one-line **consistency fix** to `card.tsx`. The new components fill the gaps between the current 23-component baseline and the full Cloudé design system, covering feedback primitives, avatar/user patterns, form extensions, data visualization, layout patterns, media, rich editorial content, and accessible overlays.

### Why now

- The product is converging on the Cloudé design language. Screens are being built that repeatedly need patterns (EmptyState, Spinner, Skeleton, ProgressBar, charts, overlays) that don't exist yet, forcing one-off inline implementations.
- One-off implementations drift from the design tokens and break visual consistency. A shared, tested library is the single source of truth.
- The existing stack (Radix UI, Tailwind v4, CVA, lucide-react, pure SVG) already supports almost all of these. The marginal cost of formalizing them now is low and the compounding cost of NOT doing it grows with every new screen.

### Success looks like

- All 46 components live under `src/shared/presentation/components/ui/{name}.tsx`, each with a co-located `{name}.test.tsx` written test-first (Strict TDD).
- Every component follows the established conventions: `React.forwardRef`, explicit props interface, `cn()`, `cva()` for multi-variant, design tokens via CSS vars, lucide-react icons, pure SVG charts.
- `card.tsx` radius is aligned with the design system (`6px` via `.card`), removing the `rounded-xl` inconsistency.
- No regressions in the existing 23 components.
- `vitest run` is green; new components render, accept props, handle interactions, and expose correct accessibility attributes.

---

## 2. Scope

### In scope

- The **46 new components** listed in section 4, grouped into 8 logical groups.
- The **card.tsx radius fix** (`rounded-xl` → `.card` CSS class alignment).
- Co-located **test files** for all 46 components (Strict TDD — test first).
- Adding the **3 missing Radix packages** required for the overlay group (tooltip, popover, context-menu).
- A decision on Drawer (Radix Dialog + CSS) and CommandPalette/Combobox (pure DOM vs `cmdk`) — see Approach.

### Out of scope

- **Sidebar components** (`sidebar/`, `sidebar-nav-items/`, `sidebar-footer/`) — user is satisfied with the existing sidebar. EXCLUDED.
- **App-shell / page-header / screen-header / in-development** chrome — already exist, not touched.
- **Library-internal showcase components** from the design files (CodeBlock, CompSection, CompGroup, TokensSection, LibApp/LibHeader/LibSidebar) — these are documentation scaffolding, not product components.
- **Re-creating any of the existing 23 components** (button, badge, chip, card, avatar, checkbox, dialog, dropdown-menu, select, tabs, breadcrumb, alert, stat-card, status-dot, table/DataTable, toaster, form-field, input, label, radio-group, switch, textarea, confirm-dialog).
- **Storybook stories** — optional, not required for "done"; may be added incrementally later.
- **Wiring components into actual product screens** — that is consumption work for follow-up changes.
- **A new chart library** — charts stay pure SVG, no external dependency.

---

## 3. Approach

### 3.1 Build conventions (apply to all 46)

Each component follows the pattern already proven across the existing 23:

```tsx
import * as React from 'react';
import { cn } from '@/shared/lib/utils';
// cva + VariantProps only when the component has multiple visual variants

export interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  // explicit, typed props
}

const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('...', className)} {...props} />
  ),
);
Component.displayName = 'Component';

export { Component };
```

- **Tokens**: CSS vars via Tailwind arbitrary values — `text-[var(--forest)]`, `bg-[var(--paper)]`, `border-[var(--rule)]`.
- **CSS utility classes**: reuse `.card`, `.chip`, `.eyebrow`, `.headline`, `.dashed-rule`, `.dot-*`, `.cbox` where the design calls for them.
- **Icons**: lucide-react only.
- **Charts**: pure SVG (`polyline`, `polygon`, `circle` + `strokeDasharray`), responsive via `viewBox` + `width="100%"`.
- **Radius rules**: buttons `rounded-full`, inputs `rounded-[6px]`, cards `.card` (6px).
- **Strict TDD**: write `{name}.test.tsx` FIRST with vitest + React Testing Library (render, props, interaction, a11y), then implement.

### 3.2 Group-by-group approach

| Group | Components | How |
|-------|-----------|-----|
| **1 — Feedback primitives** | Spinner, Skeleton, ProgressBar, EmptyState | Pure CSS/Tailwind, no deps. CVA for sizes/variants. Spinner = CSS border-spin; Skeleton = wave shimmer keyframe; ProgressBar = determinate/stepped/indeterminate via variant prop. |
| **2 — Avatar & User patterns** | InitialsAvatar, AvatarGroup, NumericBadge, UserCard, Pagination | New `InitialsAvatar` is a SEPARATE component from existing Radix `Avatar` (different concern — color-coded initials, no image). AvatarGroup composes InitialsAvatar. Pure layout + CVA. |
| **3 — Form extensions** | SearchInput, PasswordInput, Slider, TagsInput, Combobox, FileUpload, DatePicker | SearchInput/PasswordInput EXTEND existing `Input` (compose, don't fork). Slider = native range + accent token. TagsInput/FileUpload/DatePicker = controlled stateful. Combobox = typeahead overlay (see decision below). |
| **4 — Data & Charts** | PlantCard, BarChart, LineAreaChart, DonutChart, Sparkline | PlantCard reuses `.card`, Chip, StatusDot. Charts = pure SVG, no library. |
| **5 — Layout patterns** | Accordion, Timeline, Stepper, Divider, FilterBar, ActiveFilterChips, FacetPanel, SortPills, CalendarMonth, WeekStrip, EventCard | Mostly composition + state. FilterBar composes SearchInput + Select + DropdownMenu + view toggle. CalendarMonth/WeekStrip are date-grid logic (self-contained, no date lib). |
| **6 — Media** | PhotoGrid, MediaCard, PhotoPicker, Lightbox | CSS grid + hover overlays. Lightbox uses a fixed-position portal overlay. MediaCard = horizontal + vertical variants via CVA. |
| **7 — Rich content** | Callout, StarRating, HealthDots, KbdShortcut, Blockquote | Editorial/visual. Callout is editorial (distinct from functional `Alert`). StarRating interactive + read-only. Blockquote = pull-quote/diary-note/stat-highlight variants. |
| **8 — Overlays** | Tooltip, ContextMenu, Popover, Drawer, CommandPalette | Radix-backed for a11y (NEW packages — see audit). Drawer = Radix Dialog + CSS slide. CommandPalette = ⌘K overlay (see decision). |

### 3.3 Key technical decisions

- **InitialsAvatar is a new, separate component** — NOT a modification of the existing Radix `Avatar`. Rationale: different concern (color-coded text initials vs image+fallback). Avoids breaking existing consumers. The codebase will intentionally have two avatar concepts, documented in the spec.
- **SearchInput / PasswordInput compose the existing Input** — they wrap, not fork, so input styling stays DRY.
- **Drawer = Radix Dialog + CSS slide animation** — avoids adding `vaul`. Radix Dialog already installed; a CSS `translateX` transition gives the slide-in. Keeps dependency surface minimal. (If `vaul` is desired for polish/snap-points later, it can be swapped behind the same API.)
- **Combobox & CommandPalette** — RECOMMENDED: add `cmdk` (the de-facto shadcn primitive) for keyboard-accessible filtering and ⌘K behavior, rather than hand-rolling focus/keyboard logic. This trades one small dependency for correct a11y and far less custom code. Fallback if we want zero new deps: pure DOM implementation with manual keyboard handling (higher risk, more test surface). **The package decision is flagged for the design phase.**
- **Charts: pure SVG, zero chart library** — matches the design exactly and keeps the bundle lean.
- **No date library** — DatePicker / CalendarMonth / WeekStrip implement month-grid math inline; self-contained.

---

## 4. PR strategy — Single PR with `size:exception`

Per the user's directive, all 46 components + the card fix ship in **one PR** labeled `size:exception`. The 8 groups below define the internal commit structure (one commit per group keeps the PR reviewable even though it lands as a single PR).

**Group 1 — Feedback primitives (4)**
1. Spinner · 2. Skeleton · 3. ProgressBar · 4. EmptyState

**Group 2 — Avatar & User patterns (5)**
5. InitialsAvatar · 6. AvatarGroup · 7. NumericBadge · 8. UserCard · 9. Pagination

**Group 3 — Form extensions (7)**
10. SearchInput · 11. PasswordInput · 12. Slider · 13. TagsInput · 14. Combobox · 15. FileUpload · 16. DatePicker

**Group 4 — Data & Charts (5)**
17. PlantCard · 18. BarChart · 19. LineAreaChart · 20. DonutChart · 21. Sparkline

**Group 5 — Layout patterns (11)**
22. Accordion · 23. Timeline · 24. Stepper · 25. Divider · 26. FilterBar · 27. ActiveFilterChips · 28. FacetPanel · 29. SortPills · 30. CalendarMonth · 31. WeekStrip · 32. EventCard

**Group 6 — Media (4)**
33. PhotoGrid · 34. MediaCard · 35. PhotoPicker · 36. Lightbox

**Group 7 — Rich content (5)**
37. Callout · 38. StarRating · 39. HealthDots · 40. KbdShortcut · 41. Blockquote

**Group 8 — Overlays (5)**
42. Tooltip · 43. ContextMenu · 44. Popover · 45. Drawer · 46. CommandPalette

**Fix (not a component):** `card.tsx` — replace `rounded-xl border bg-card text-card-foreground shadow` with the `.card` CSS class for radius consistency (6px). Land in commit 1 (zero risk, non-breaking layout shift only).

---

## 5. Package audit

Verified against `package.json` (v0.15.0).

### Already installed (reuse)

| Package | Version | Used for |
|---------|---------|----------|
| `@radix-ui/react-avatar` | ^1.1.11 | existing Avatar (not InitialsAvatar) |
| `@radix-ui/react-checkbox` | ^1.3.3 | FacetPanel checkboxes |
| `@radix-ui/react-dialog` | ^1.1.15 | **Drawer** (Dialog + CSS slide) |
| `@radix-ui/react-dropdown-menu` | ^2.1.16 | FilterBar dropdown |
| `@radix-ui/react-label` | ^2.1.8 | form labels |
| `@radix-ui/react-select` | ^2.2.6 | FilterBar sort-by |
| `@radix-ui/react-slot` | ^1.2.4 | composition |
| `class-variance-authority` | ^0.7.1 | all multi-variant components |
| `clsx` + `tailwind-merge` | — | `cn()` |
| `lucide-react` | ^1.17.0 | all icons |
| `tailwindcss` | ^4 | styling |
| `vitest` + `@testing-library/*` | — | Strict TDD test suite |

### Needs to be added

| Package | Reason | Required? | Notes |
|---------|--------|-----------|-------|
| `@radix-ui/react-tooltip` | Tooltip (a11y, 4-position) | **Yes** | Standard Radix primitive |
| `@radix-ui/react-popover` | Popover (anchored + arrow) | **Yes** | Standard Radix primitive |
| `@radix-ui/react-context-menu` | ContextMenu (right-click) | **Yes** | Standard Radix primitive |
| `cmdk` | Combobox + CommandPalette | **Recommended** | Decided in design phase; alternative is pure DOM |

### Considered and rejected

| Package | Why rejected |
|---------|--------------|
| `vaul` | Drawer achievable with already-installed Radix Dialog + CSS slide. Avoids new dep. Revisit only if snap-points are needed. |
| Any chart library (recharts, visx, etc.) | Design is pure SVG; a library would add bundle weight and break visual fidelity. |
| Any date library (date-fns, dayjs) | Month-grid math is small and self-contained; no need for a runtime dep. |

---

## 6. Review Workload Forecast

- **Estimated changed lines:** ~6,000–9,000 (46 components × ~80–120 LOC implementation + 46 test files × ~40–80 LOC + card fix + package.json). **FAR exceeds the 400-line budget.**
- **400-line budget risk:** **High** (by ~15–22×).
- **Chained PRs recommended:** Normally **Yes** — this is exactly the kind of change the chained-PR guard exists for.
- **Decision needed before apply:** Resolved by user. **Single PR with `size:exception` is approved.** No further decision required at apply time.
- **Mitigation within the single PR:** one commit per group (8 commits + 1 fix commit) so reviewers can review group-by-group even though it merges as one PR. Strict TDD means each commit carries its own tests, making the diff self-verifying.

> Note for the apply phase: even under single-PR, batch implementation by group (Feedback → Avatar → Forms → Data → Layout → Media → Rich → Overlays) and keep `apply-progress` updated per group so a long run is resumable.

---

## 7. Risks (top 5 + mitigation)

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | **Massive scope (92+ files) in a single PR** is hard to review and easy to introduce inconsistencies across. | High | Single commit per group; Strict TDD so every file is test-covered; shared conventions section enforced uniformly; spec phase defines exact prop contracts before any code. |
| 2 | **card.tsx radius fix is a visual change for all current consumers** relying on `rounded-xl`. | Medium | It's a one-line alignment to the design token (6px). Audit current Card usages in spec phase; it's a non-breaking layout-only shift, lands in commit 1 for early visibility. |
| 3 | **Two avatar concepts** (Radix `Avatar` + new `InitialsAvatar`) may confuse consumers. | Medium | Keep them as clearly distinct named exports; document the difference in the spec (image+fallback vs color initials). Do NOT modify existing Avatar. |
| 4 | **cmdk vs pure DOM for Combobox/CommandPalette** — wrong call means either an extra dep or fragile hand-rolled keyboard a11y. | Medium | Defer the final call to the design phase. Recommendation stands: `cmdk` for correctness. API designed so the backing implementation is swappable. |
| 5 | **Strict TDD overhead on visual/layout components** — testing className output and structure rather than appearance can produce brittle or low-value tests. | Medium | Focus tests on behavior and contract (props applied, interactions, a11y roles/attrs, conditional rendering), not exact class strings. Define the test strategy per component in the spec. |

---

## 8. Success criteria

- [ ] All 46 components exist at `src/shared/presentation/components/ui/{name}.tsx`.
- [ ] All 46 have co-located `{name}.test.tsx` written test-first (Strict TDD).
- [ ] `vitest run` passes for the full suite.
- [ ] Every component uses `forwardRef`, explicit props interface, `cn()`, and `cva()` where multi-variant.
- [ ] Components use design tokens (CSS vars) and `.card`/`.chip`/etc. utility classes per the design.
- [ ] Charts are pure SVG (no chart library added).
- [ ] `card.tsx` uses the `.card` class (6px radius), no `rounded-xl`.
- [ ] 3 Radix packages (tooltip, popover, context-menu) added; `cmdk` decision recorded and implemented.
- [ ] No regressions in the existing 23 components.
- [ ] PR carries `size:exception` and is organized as one commit per group.
- [ ] No new dependency added beyond the audited list.
