# Design: shared-ui-components

**Change name:** `shared-ui-components`
**Status:** designed
**Artifact store:** openspec
**Depends on:** `proposal.md`
**Feeds:** `tasks.md`

---

## 0. Architectural stance

This is NOT a feature with business logic — it is a **presentation-layer primitive library**. The architecture is therefore deliberately flat: 46 self-contained, composable components living side-by-side in one directory, each obeying a single shared contract. There is no domain layer, no application layer, no data fetching. The "architecture" here is **consistency of construction** plus a small number of cross-cutting technical decisions (charts, animations, overlays, keyboard handling).

Guiding principles:

1. **Compose, never fork.** New components that overlap existing ones (SearchInput, PasswordInput) wrap the existing primitive rather than reimplementing it. This keeps the styling source-of-truth singular.
2. **Tokens over hardcoded values.** Every color/border/radius resolves through the Gardenia CSS variables already defined in `src/design-system/theme.css` and the `@theme inline` bridge. No raw `oklch()` or hex in component code.
3. **Radix for a11y-critical overlays only.** Where focus management, ARIA wiring, and keyboard navigation are hard to get right (Tooltip, Popover, ContextMenu, Dialog/Drawer), lean on Radix. Where it is trivial (Spinner, Divider, charts), use plain markup.
4. **Zero non-essential dependencies.** Charts = SVG. Dates = inline math. Only add packages where the a11y/keyboard cost of hand-rolling is genuinely high.
5. **Test the contract, not the pixels.** Tests assert behavior, props pass-through, conditional rendering, ARIA roles/attributes, and interactions — never exact class strings (except for the small set of semantic utility classes like `.chip`, `.dot-good` that ARE the contract, mirroring the existing `status-dot.test.tsx` pattern).

---

## 1. Package decisions

### 1.1 Confirmed already installed (from `package.json` v0.15.0)

Radix primitives present: `react-avatar`, `react-checkbox`, `react-dialog`, `react-dropdown-menu`, `react-label`, `react-radio-group`, `react-select`, `react-slot`, `react-switch`, `react-tabs`.
Supporting: `class-variance-authority ^0.7.1`, `clsx ^2.1.1`, `tailwind-merge ^3.6.0`, `lucide-react ^1.17.0`, `tailwindcss ^4`, `vitest ^4.1.8`, `@testing-library/{react,jest-dom,user-event}`.

### 1.2 Missing Radix primitives — ADD (required)

```bash
pnpm add @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-context-menu
```

| Package | Component | Why Radix and not hand-rolled |
|---------|-----------|-------------------------------|
| `@radix-ui/react-tooltip` | Tooltip | Hover/focus delay, collision-aware positioning, `aria-describedby` wiring, portal. Re-implementing positioning + a11y by hand is high-risk. |
| `@radix-ui/react-popover` | Popover | Anchored floating layer, arrow, focus return, outside-click + Escape dismissal, portal. |
| `@radix-ui/react-context-menu` | ContextMenu | Right-click trigger, roving tabindex, typeahead, submenus, keyboard nav. |

These three follow the EXACT wrapper pattern already used in `dialog.tsx` / `dropdown-menu.tsx`: re-export `Root`/`Trigger`/`Portal`, wrap `Content` with `forwardRef` + `cn()` + `.card` styling + token classes.

### 1.3 DECISION — Combobox / CommandPalette: **`cmdk`** (ADD)

```bash
pnpm add cmdk
```

**Decision: adopt `cmdk`.** The proposal flagged this for the design phase with a recommendation; this design ratifies it.

Tradeoffs evaluated:

| Option | Pros | Cons |
|--------|------|------|
| **`cmdk` (chosen)** | Battle-tested keyboard a11y (arrow/enter/escape, `aria-selected`, `role="listbox"/"option"`), built-in fuzzy filtering, controlled value, tiny (~5KB gz), the de-facto shadcn primitive so the API matches what the team already knows, dramatically smaller test surface (we test our wrapper, not the keyboard engine). | One new runtime dependency; React 19 peer must be verified at install. |
| Pure DOM (rejected) | Zero new deps. | We re-own all keyboard navigation, focus trapping, list virtualization of the active descendant, and ARIA `activedescendant` wiring — the highest-bug-density code in the whole change, and the most brittle to test. Estimated 2–3× the code and test volume of the `cmdk` wrapper for strictly worse a11y. |

**Mitigation for the dependency:** both Combobox and CommandPalette expose a Gardenia-native props API (`items`, `value`, `onChange`, `placeholder`, etc.). `cmdk` is an implementation detail behind that API — if we ever need to swap it, consumers do not change. Verify React 19 compatibility immediately after install (see Risks).

### 1.4 DECISION — Drawer: **Radix Dialog + CSS slide** (NO new dep)

**Decision: do NOT add `vaul`. Build Drawer on the already-installed `@radix-ui/react-dialog`.**

Tradeoffs evaluated:

| Option | Pros | Cons |
|--------|------|------|
| **Radix Dialog + CSS (chosen)** | Zero new deps. Radix Dialog already gives us focus trap, scroll lock (`react-remove-scroll` is bundled inside Radix Dialog), Escape/outside-click dismissal, portal, and `role="dialog"` + `aria-modal`. We only add a `translateX`/`translateY` slide via `data-[state]` CSS. Matches the existing `dialog.tsx` construction exactly. | No native snap-points or drag-to-dismiss gesture (acceptable — not in scope). |
| `vaul` (rejected) | Snap-points, drag gesture, mobile bottom-sheet polish. | New dep for polish we don't currently need; different mental model from our Dialog; the slide animation alone is one CSS rule. |

**Implementation:** Drawer wraps `DialogPrimitive` (same imports as `dialog.tsx`). A `side` prop (`left | right | top | bottom`) maps to a CVA variant that sets the off-screen start transform and the on-screen end transform, driven by `data-[state=open]` / `data-[state=closed]`. Scroll lock and focus trap come for free from Radix Dialog — no manual work.

### 1.5 Rejected (reaffirmed from proposal)

| Package | Why rejected |
|---------|--------------|
| `vaul` | See 1.4 — Dialog + CSS covers the in-scope need. |
| Any chart lib (recharts/visx/chart.js) | Design is pure SVG; a lib breaks visual fidelity and adds tens of KB. |
| Any date lib (date-fns/dayjs) | Month-grid math is ~30 lines of inline `Date` arithmetic; a runtime dep is unjustified. |

**Net new dependencies for this change: 4** — `@radix-ui/react-tooltip`, `@radix-ui/react-popover`, `@radix-ui/react-context-menu`, `cmdk`. Nothing else.

---

## 2. Cross-cutting technical decisions (ADR-style)

### ADR-1 — Charts are pure SVG, responsive via `viewBox`

**Decision.** BarChart, LineAreaChart, DonutChart, Sparkline render raw SVG. Each component:
- Computes geometry in a fixed coordinate space (e.g. `viewBox="0 0 300 150"`).
- Sets `width="100%"` and `height="auto"` (or a height prop) so the SVG scales fluidly while internal math stays integer-clean.
- Uses `preserveAspectRatio="none"` only where intentional stretch is desired (area fills), otherwise default.
- Colors come from token utilities via `fill`/`stroke` (`stroke-[var(--forest-2)]`, `fill-[var(--forest-bg)]`).

Per-chart geometry:
- **BarChart:** map each datum to a `<rect>`; `x = i * (barW + gap)`, `height = (v / max) * chartH`, `y = chartH - height`. Optional grid lines as `<line>`.
- **LineAreaChart:** build a points string `"x0,y0 x1,y1 …"` for a `<polyline>` (the line) and a closed `<polygon>`/`<path>` down to the baseline for the filled area. Y-scale = `(v - min) / (max - min)`.
- **DonutChart:** single (or stacked) `<circle>` with `strokeDasharray` = `[arcLen, circumference - arcLen]` and `strokeDashoffset` for start angle; `fill="none"`, `stroke-width` controls thickness. `circumference = 2 * π * r`. Center label via `<text>` or an absolutely-positioned overlay.
- **Sparkline:** a minimal `<polyline>`, no axes, no labels, fixed tiny viewBox, `width="100%"`.

**Rationale.** Zero deps, exact design fidelity, trivially testable (assert path/points strings and element counts from given data). **Rejected:** chart libraries (bundle + fidelity), `<canvas>` (not declaratively testable, no DOM nodes to assert).

**Test strategy.** Pass a known dataset, assert the number of `<rect>`/`<circle>` nodes equals the data length, and assert at least one computed coordinate/dash value to lock the math.

### ADR-2 — SVG / shimmer animations via Tailwind v4 `@theme` keyframes

**Decision.** Animations that don't already exist (spinner spin, skeleton shimmer, indeterminate progress, drawer slide) are defined ONCE as `@keyframes` + animation utilities. In Tailwind v4 these live in CSS, registered through `@theme` so they generate `animate-*` utilities. Add a new block (recommended location: `src/design-system/components.css` inside an `@theme` / `@layer` as appropriate, or `app/globals.css`):

```css
@theme {
  --animate-spin-ring:   spin-ring 0.7s linear infinite;
  --animate-shimmer:     shimmer 1.4s ease-in-out infinite;
  --animate-progress-indeterminate: progress-indeterminate 1.2s ease-in-out infinite;
}

@keyframes spin-ring          { to   { transform: rotate(360deg); } }
@keyframes shimmer            { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes progress-indeterminate { 0% { left: -40%; } 100% { left: 100%; } }
```

**Spinner** = a bordered circle (`border` + `border-t-transparent` token colors) with `animate-spin-ring` (or reuse Tailwind's built-in `animate-spin`). **Skeleton** = a `bg-[var(--paper-2)]` block with a moving gradient: `bg-gradient-to-r from-[var(--paper-2)] via-[var(--paper-3)] to-[var(--paper-2)] bg-[length:200%_100%] animate-shimmer`. **ProgressBar (indeterminate)** = a track with an absolutely-positioned moving fill using `animate-progress-indeterminate`.

**IMPORTANT verification note.** `dialog.tsx` currently uses `animate-in` / `fade-in-0` / `zoom-in-95` utilities. These are `tailwindcss-animate`-style utilities that are NOT registered in the inspected CSS and `tailwindcss-animate` is NOT in `package.json`. The Drawer slide MUST therefore be implemented with our OWN `data-[state=open]:` + transition/keyframe CSS, NOT by assuming `animate-in` exists. (See Risk R-6.)

**Rationale.** One source of truth for motion; tokenized timing; no JS animation runtime. **Rejected:** inline `<style>` per component (duplication), Framer Motion (heavy dep for CSS-doable motion).

**Test strategy.** Animations are not asserted via computed styles in jsdom (unreliable). Instead assert the presence of the documented animation utility class (e.g. `expect(el).toHaveClass('animate-shimmer')`) — that class IS the contract.

### ADR-3 — Skeleton implementation

Covered in ADR-2: gradient + `bg-[length:200%_100%]` + `animate-shimmer`. Skeleton exposes shape variants via CVA (`text | circle | rect`) controlling `border-radius` and default dimensions; consumers override size with `className`. `role` defaults to none (decorative); optional `aria-busy`/`aria-hidden` pass-through.

### ADR-4 — CommandPalette global ⌘K shortcut

**Decision.** CommandPalette registers a global `keydown` listener in a `useEffect` that toggles open state when `(e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'`, calling `e.preventDefault()`. The listener is added on mount and removed on unmount (cleanup return). The shortcut is **opt-in** via a prop (`shortcut?: boolean | string`, default enabled) so consumers that don't want a global hotkey can disable it.

```tsx
React.useEffect(() => {
  if (!shortcut) return;
  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setOpen((o) => !o);
    }
  };
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}, [shortcut]);
```

Open state is controllable (`open` / `onOpenChange`) with an internal-state fallback. The palette overlay reuses Dialog (portal + focus trap + scroll lock) wrapping `cmdk`'s `Command` for the list/filter/keyboard engine.

**Rationale.** Single listener, cleaned up, SSR-safe (effect runs client-only). **Rejected:** a global key-handling library (overkill for one shortcut).

**Test strategy.** Fire `keydown` with `metaKey:true, key:'k'` via `user-event`/`fireEvent`, assert the palette opens; assert listener removal does not throw on unmount; assert `shortcut={false}` does NOT open on ⌘K.

### ADR-5 — Drawer focus trap & scroll lock

**Decision.** Inherited from Radix Dialog — NOT hand-rolled. `@radix-ui/react-dialog` provides the focus trap (`FocusScope`), scroll lock (`react-remove-scroll`, bundled), Escape + outside-click dismissal, and `aria-modal`/`role="dialog"`. Drawer only adds the directional slide CSS (ADR-2 caveat: our own `data-[state]` transitions). This means Drawer's a11y is identical to Dialog's, already proven in the codebase.

**Rationale.** Don't reimplement solved a11y. **Rejected:** custom focus trap (bug-prone, redundant).

### ADR-6 — No date library; inline month-grid math

**Decision.** DatePicker, CalendarMonth, WeekStrip compute their grids with native `Date`:
- First-of-month weekday: `new Date(year, month, 1).getDay()`.
- Days in month: `new Date(year, month + 1, 0).getDate()`.
- Leading blanks before day 1 + trailing blanks to fill a 6×7 (or minimal) grid.
- WeekStrip: from an anchor date, derive the 7 days of its week via `getDay()` offset.
A small internal helper (e.g. `getMonthGrid(year, month)` returning `(Date | null)[]`) is shared; it can live inline per component or in a tiny local util — **decision: inline per component to keep each file self-contained** (consistent with the flat, dependency-free stance; duplication is ~10 lines and avoids creating a shared module the spec/tasks must track).

**Rationale.** Tiny, deterministic, fully testable. **Rejected:** date-fns/dayjs (runtime dep for trivial math).

**Test strategy.** Render a known month (e.g. Feb 2026), assert leading-blank count and that the correct number of day cells render; assert selection callback fires with the right `Date`.

### ADR-7 — InitialsAvatar is a NEW component, separate from Radix `Avatar`

**Decision (reaffirm proposal).** `InitialsAvatar` is a distinct file/export. It derives initials from a `name` prop, picks a deterministic color from a fixed token palette (hash of name → index into `[forest, honey, terra, sage, plum, sky]`), and renders a colored circle with centered initials. The existing image-based Radix `Avatar` is untouched. `AvatarGroup` composes `InitialsAvatar` (overlapping circles + optional `+N` overflow via `NumericBadge`).

**Rationale.** Different concern (text-color vs image-fallback); modifying the existing Avatar risks current consumers. **Rejected:** overloading the existing Avatar with an initials mode (breaks SRP, risks regressions).

### ADR-8 — Form extensions compose, never fork

`SearchInput` and `PasswordInput` import and render the existing `Input`, adding only their delta (leading search icon + clear button; trailing eye toggle that flips `type`). They forward `ref` to the underlying input and spread remaining props. This keeps input styling DRY and guarantees they inherit any future Input change.

---

## 3. Component data flow & integration points

```
                       ┌─────────────────────────────────────────┐
                       │  Gardenia tokens (theme.css @theme inline)│
                       │  + utility classes (components.css)       │
                       └───────────────────┬───────────────────────┘
                                           │ resolved via cn() + arbitrary values
        ┌──────────────────────────────────┼──────────────────────────────────┐
        │                                  │                                  │
   Pure markup                      Composition of                     Radix-backed
   (no deps)                        existing primitives                overlays + cmdk
   ───────────                      ───────────────────                ─────────────────
   Spinner, Skeleton,              SearchInput→Input                   Tooltip   (radix)
   ProgressBar, EmptyState,        PasswordInput→Input                 Popover   (radix)
   Divider, KbdShortcut,           FilterBar→SearchInput+Select        ContextMenu(radix)
   Status/Health dots,             +DropdownMenu                       Drawer    (radix dialog)
   StarRating, Blockquote,         PlantCard→.card+Chip+StatusDot      CommandPalette
   Callout, all Charts,            UserCard→InitialsAvatar             (dialog + cmdk)
   CalendarMonth/WeekStrip,        AvatarGroup→InitialsAvatar+         Combobox  (cmdk)
   Timeline, Stepper,                NumericBadge
   Accordion, Pagination,          EventCard→.card+Chip
   PhotoGrid, MediaCard,           FacetPanel→Checkbox
   Lightbox, TagsInput,            SortPills→Chip-like toggles
   FileUpload, Slider,
   InitialsAvatar, NumericBadge
```

**State ownership.** Stateful components (TagsInput, FileUpload, DatePicker, StarRating, Slider, Combobox, CommandPalette, Lightbox, Drawer) follow the controlled-with-uncontrolled-fallback pattern: accept `value`/`onChange` (or `open`/`onOpenChange`) but maintain internal state when those are omitted. This matches React 19 idioms and is testable both ways.

**No external integration.** Nothing fetches data, reads global stores (zustand), or hits Apollo/React Query. Components are pure inputs→render. Consumption wiring is explicitly out of scope.

---

## 4. File structure

All under `src/shared/presentation/components/ui/` — flat, mirroring the existing 23:

```
{name}.tsx        ← implementation (forwardRef, props interface, cn, cva when multi-variant)
{name}.test.tsx   ← co-located, written FIRST (Strict TDD)
```

- 46 new `.tsx` + 46 new `.test.tsx` = 92 new files.
- `card.tsx` edited (1 line) — no new test required, but existing `card.stories`/usages must not regress.
- `'use client'` directive at top of any component using hooks, Radix, or DOM listeners (overlays, stateful forms, CommandPalette, Lightbox, Drawer) — matching `dialog.tsx`. Pure presentational components (Spinner, Divider, charts that take data props) do not need it but adding it is harmless; **rule: add `'use client'` only when the component uses state/effects/Radix.**
- Animation keyframes added to `src/design-system/components.css` (or `app/globals.css`) — ONE CSS edit, see ADR-2.
- No barrel/index file change required (existing components are imported by direct path).

Naming: kebab-case files (`initials-avatar.tsx`), PascalCase exports (`InitialsAvatar`). `displayName` set on every component (matches existing convention).

---

## 5. The `card.tsx` fix

Replace line 6:
```diff
- className={cn('rounded-xl border bg-card text-card-foreground shadow', className)}
+ className={cn('card text-card-foreground', className)}
```
`.card` already supplies `background-color: var(--paper)`, `border: 1px solid var(--rule)`, `border-radius: 6px`, and a box-shadow (components.css lines 61–68). This drops `rounded-xl` (radius inconsistency) and the redundant `bg-card`/`border`/`shadow`. Land in commit 1. Layout-only shift; audit `card.stories.tsx` and any consumers during apply.

---

## 6. Per-group implementation strategy

| Group | Components | Strategy | Notable details |
|-------|-----------|----------|-----------------|
| **1 Feedback** | Spinner, Skeleton, ProgressBar, EmptyState | Pure CSS/Tailwind, CVA for size/variant. | Spinner: bordered circle + spin keyframe. Skeleton: shimmer gradient (ADR-2/3). ProgressBar: CVA `variant = determinate \| stepped \| indeterminate`; determinate width = `value%`; indeterminate = moving fill. EmptyState: icon slot + title + description + optional action (children). **Group 1 lands first — unblocks loading states everywhere.** |
| **2 Avatar/User** | InitialsAvatar, AvatarGroup, NumericBadge, UserCard, Pagination | Pure layout + CVA; InitialsAvatar deterministic color (ADR-7). | NumericBadge: small pill, token color variants, `99+` clamp. AvatarGroup: overlapping (`-ml`) circles + overflow `+N`. UserCard: InitialsAvatar + name/meta + optional action. Pagination: prev/next + page buttons, `aria-current="page"`, ellipsis for long ranges. |
| **3 Forms** | SearchInput, PasswordInput, Slider, TagsInput, Combobox, FileUpload, DatePicker | Compose Input (ADR-8); stateful controlled-fallback; Combobox=cmdk; DatePicker=inline date math (ADR-6). | Slider: native `<input type=range>` + accent token + value label. TagsInput: chips + input, Enter adds, Backspace removes last, `onChange(string[])`. FileUpload: hidden `<input type=file>` + dropzone (`onDragOver/onDrop`), file list. Combobox: cmdk listbox in a Popover-style anchored layer. DatePicker: CalendarMonth in a Popover-style layer. |
| **4 Data/Charts** | PlantCard, BarChart, LineAreaChart, DonutChart, Sparkline | PlantCard composes `.card`+Chip+StatusDot; charts pure SVG (ADR-1). | Charts accept `data` arrays + optional `width/height/color`. Deterministic geometry → assertable in tests. |
| **5 Layout** | Accordion, Timeline, Stepper, Divider, FilterBar, ActiveFilterChips, FacetPanel, SortPills, CalendarMonth, WeekStrip, EventCard | Composition + local state; date components inline math. | Accordion: single/multi expand, `aria-expanded`, region. Stepper: steps with current/done/upcoming. Divider: `<hr>`/`.dashed-rule`, h/v + optional label. FilterBar: composes SearchInput+Select+DropdownMenu+view toggle. ActiveFilterChips: removable chips → `onRemove`. FacetPanel: grouped Checkboxes. SortPills: toggle chips, single active. CalendarMonth/WeekStrip: ADR-6. EventCard: `.card`+Chip+time. |
| **6 Media** | PhotoGrid, MediaCard, PhotoPicker, Lightbox | CSS grid + hover overlays; Lightbox = fixed portal. | PhotoGrid: responsive `grid` + aspect, hover overlay. MediaCard: CVA `orientation = horizontal \| vertical`. PhotoPicker: thumbnails + add tile (FileUpload-like). Lightbox: fixed portal overlay, Escape/arrow nav, backdrop click closes (own keydown + portal; or reuse Dialog — decide in spec, prefer Dialog for focus trap). |
| **7 Rich content** | Callout, StarRating, HealthDots, KbdShortcut, Blockquote | Editorial/visual; StarRating interactive+readonly. | Callout: CVA tone variants (info/success/warn/note) — editorial, distinct from functional Alert. StarRating: hover preview + click select; `readOnly` shows static; keyboard arrows adjust. HealthDots: N dots filled by score (like dot-good/warn/bad). KbdShortcut: `<kbd>` styling, splits `⌘K` into keys. Blockquote: CVA `variant = pull-quote \| diary-note \| stat-highlight` (uses `--font-hand`/`--font-serif`). |
| **8 Overlays** | Tooltip, ContextMenu, Popover, Drawer, CommandPalette | Radix wrappers (tooltip/popover/context-menu) + Dialog-based Drawer + Dialog+cmdk palette. | Wrapper pattern from dialog.tsx. Drawer: ADR-5 + directional CVA slide. CommandPalette: ADR-4 global shortcut + cmdk engine. |

---

## 7. Testing approach (Strict TDD)

Mirror `status-dot.test.tsx`: render → assert structure/role → assert semantic class contract → assert prop merge → assert interaction/a11y. Per category:

- **Visual/markup** (Spinner, Divider, dots, charts): assert element type, node counts from data, presence of documented animation/semantic class, `className` merge, no spurious `role`.
- **Composition** (SearchInput, FilterBar, PlantCard): assert the composed child renders, props forward to the inner primitive, ref forwards.
- **Stateful** (TagsInput, FileUpload, DatePicker, StarRating, Slider, Combobox): assert controlled mode (value prop reflected, onChange fired with correct payload) AND uncontrolled fallback; assert key interactions (Enter/Backspace/arrows) via `user-event`.
- **Overlays** (Tooltip, Popover, ContextMenu, Drawer, CommandPalette): assert open/close on trigger, ARIA role/`aria-*`, Escape closes, content portal renders; CommandPalette ⌘K (ADR-4). Use Radix-friendly queries; avoid asserting exact transition styles.

Tests assert **behavior and the semantic-class contract**, never decorative class strings. Each `.test.tsx` is committed in the SAME group commit as its `.tsx`, so every commit is self-verifying.

---

## 8. PR structure (single PR, `size:exception`)

One PR, organized as **9 commits** (1 install + 8 groups), each group commit carrying impl + tests so it is independently green.

| Commit | Content | Rationale |
|--------|---------|-----------|
| **0** | `pnpm add` the 4 packages + animation keyframes CSS + **card.tsx fix** | Foundation: deps + motion utilities + zero-risk card alignment available before any component needs them. |
| **1** | Group 1 — Feedback (Spinner, Skeleton, ProgressBar, EmptyState) + tests | **First** — unblocks loading/empty states used by later groups and product screens. |
| **2** | Group 2 — Avatar/User + tests | InitialsAvatar/NumericBadge are reused by later groups. |
| **3** | Group 3 — Forms + tests | SearchInput needed by FilterBar (Group 5). |
| **4** | Group 4 — Data/Charts + tests | |
| **5** | Group 5 — Layout + tests | Depends on SearchInput/Select/DropdownMenu/Chip. |
| **6** | Group 6 — Media + tests | |
| **7** | Group 7 — Rich content + tests | |
| **8** | Group 8 — Overlays + tests | Last — heaviest a11y, depends on new Radix packages from commit 0. |

Dependency-aware ordering: Feedback → Avatar → Forms → Data → Layout → Media → Rich → Overlays. `apply-progress` updated per group so a long run is resumable. PR labeled `size:exception` (user-approved); reviewers review commit-by-commit.

---

## 9. Risks & mitigations

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| **R-1** | 92 files in one PR — inconsistency drift across components. | High | Single shared contract (§0), one commit per group, Strict TDD per file, spec defines exact prop contracts before code. Reviewer reviews per-commit. |
| **R-2** | `cmdk` React 19 peer-dependency incompatibility. | Medium | Verify IMMEDIATELY after `pnpm add cmdk` (commit 0): run `vitest` smoke + a trivial render. If it breaks under React 19, fall back to the pure-DOM Combobox/CommandPalette behind the SAME props API (API designed to be implementation-agnostic — see 1.3). |
| **R-3** | `card.tsx` radius change is a visual shift for ALL current Card consumers. | Medium | One-line token alignment (6px), non-breaking layout-only. Audit `card.stories.tsx` + consumers during apply; land in commit 0 for early visibility. |
| **R-4** | Two avatar concepts (Radix Avatar + InitialsAvatar) confuse consumers. | Medium | Distinct named exports, documented difference in spec, existing Avatar untouched (ADR-7). |
| **R-5** | Strict-TDD on visual components → brittle class-string tests. | Medium | Test behavior/contract/a11y, not decorative classes (§7), mirroring `status-dot.test.tsx`. |
| **R-6** | `dialog.tsx` relies on `animate-in`/`fade-in`/`zoom-in` utilities that are NOT in package.json and NOT in the inspected CSS — Drawer must not assume they exist. | Medium | Implement Drawer slide with OUR OWN `data-[state=open/closed]` + transition/keyframe CSS (ADR-2). During apply, ALSO confirm whether Dialog's animations actually render (possible latent bug in existing Dialog) and flag if broken — do NOT silently depend on it. |
| **R-7** | jsdom can't reliably assert CSS animations/transitions or Radix portals' positioning. | Low | Assert the animation utility CLASS (the contract) not computed style; for overlays assert open/close state + ARIA, not pixel position. |
| **R-8** | Inline date math edge cases (month rollover, leap years, week boundaries). | Low | Unit-test known months incl. a leap February (Feb 2024) and a month starting on Sunday/Saturday. |

---

## 10. Definition of done (design-level)

- 4 packages added; nothing else. `cmdk` React-19-verified.
- Animation keyframes defined once in CSS; `animate-*` utilities available.
- All 46 components follow §0 contract (forwardRef, props interface, cn, cva-when-multivariant, tokens, lucide, pure-SVG charts, inline date math).
- Overlays use Radix; Drawer uses Dialog+own-CSS slide; Combobox/CommandPalette use cmdk behind a swappable API.
- `card.tsx` uses `.card`.
- Every `.tsx` has a behavior/contract test committed in the same group commit.
- Single PR, 9 commits, `size:exception`.
