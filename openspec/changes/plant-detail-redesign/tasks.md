# Tasks: Plant Detail Redesign

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~700–800 (PR1: ~280, PR2: ~320, PR3: ~150) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 → PR2 → PR3 (stacked to main) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | 3-column header: image / identity+chips+actions / QR card | PR1 | Base: main; tests fully rewritten for PR1 testids |
| 2 | CareCard + GrowthTimeline components + Cuidados tab wired | PR2 | Base: PR1 branch; new components TDD; screen updated |
| 3 | Remaining 5 tabs → InDevelopment; PlantSectionPlaceholder removed | PR3 | Base: PR2 branch; purely additive |

---

## PR1 — Header Redesign

### Phase 1.1 — i18n (en.ts + es.ts)

- [ ] 1.1 **[RED]** Add failing i18n-parity test assertion for new PR1 keys to confirm they are missing — `src/core/plants/presentation/i18n/i18n-parity.test.ts` (run existing test, confirm it would fail if keys are absent)
- [ ] 1.2 **[GREEN]** Expand `detail` namespace in `src/core/plants/presentation/i18n/en.ts`: add `tabs.diary`, `tabs.harvests`, `tabs.pests`, `tabs.associations`, `tabs.calendar` under `detail.tabs`; keep existing keys; add `detail.qr.code` for plant code label
- [ ] 1.3 Add parity keys to `src/core/plants/presentation/i18n/es.ts` (exact structural match)
- [ ] 1.4 Verify `i18n-parity.test.ts` passes (no new test file needed — existing parity test covers it)

### Phase 1.2 — Plant interface optional fields (stub foundation)

- [ ] 1.5 Add optional care/taxonomy fields to `src/core/plants/domain/interfaces/plant.interface.ts`: `category?: string`, `sunExposure?: string`, `wateringFrequency?: string`, `growthStage?: string` — documented as "not yet returned by backend"

### Phase 1.3 — Screen: 3-column header (TDD)

- [ ] 1.6 **[RED]** Rewrite `src/core/plants/presentation/screens/plant-detail/plant-detail.screen.test.tsx` — replace all 8 existing tests with PR1 contract tests:
  - `plant-header` 3-col wrapper present
  - `plant-image` renders with imageUrl
  - `plant-image-placeholder` renders when imageUrl absent (`dict.detail.noImage`)
  - `plant-name` contains plant name
  - `plant-species` contains species name / `dict.detail.noSpecies` fallback
  - `plant-action-bar` present; all 3 buttons NOT disabled (markWatered / addPhoto / newNote)
  - `plant-qr-card` renders with `qr.image` base64 src; `plant-qr-code` shows `qr.id`; `qr-download-btn` is disabled
  - `plant-qr-card` absent when `plant.qr` is undefined
  - loading: `.animate-pulse` present
  - error: `router.replace` called with `"/en/plants"`
  - breadcrumb link present with `href="/en/plants"`
- [ ] 1.7 **[GREEN]** Rewrite `src/core/plants/presentation/screens/plant-detail/plant-detail.screen.tsx`:
  - Replace flat layout with CSS grid 3-column header (`grid grid-cols-[auto_1fr_auto]`)
  - Left: `<img>` / Next Image with `data-testid="plant-image"` or `<span data-testid="plant-image-placeholder">`; apply `.placeholder-img .paper-grain` classes as fallback
  - Center: `.eyebrow` metadata line, `<h1 data-testid="plant-name" className="headline font-serif">`, `<p data-testid="plant-species" className="italic">`, `Chip` row (category/sunExposure/wateringFrequency — undefined-guarded), `<div data-testid="plant-action-bar">` with three `Button` components (onClick no-op stubs)
  - Right: `<Card data-testid="plant-qr-card">` wrapping QR `<img alt="QR">`, `<span data-testid="plant-qr-code">`, disabled `<button data-testid="qr-download-btn" disabled>` for PDF
  - Keep `ScreenHeader` breadcrumb unchanged
  - Remove inline disabled flags from action buttons; QR download stays `disabled`
- [ ] 1.8 **[REFACTOR]** Extract magic strings in screen to `dict.detail.*` calls; ensure no hardcoded copy remains

---

## PR2 — Cuidados Tab

### Phase 2.1 — CareCard component (TDD)

- [ ] 2.1 **[RED]** Create `src/core/plants/presentation/components/care-card/care-card.test.tsx` with failing tests:
  - renders `data-testid="care-card"` with icon, label (colored `.eyebrow`), title, description
  - `labelColor` is applied as inline style on the label element
- [ ] 2.2 **[GREEN]** Create `src/core/plants/presentation/components/care-card/care-card.tsx` — pure presentational; uses `Card > CardContent` from shared; props: `{ icon: React.ReactNode; label: string; labelColor: string; title: string; description: string }`
- [ ] 2.3 **[REFACTOR]** Verify `CareCard` has no i18n imports, no data fetching, no store access

### Phase 2.2 — GrowthTimeline component (TDD)

- [ ] 2.4 **[RED]** Create `src/core/plants/presentation/components/growth-timeline/growth-timeline.test.tsx` with failing tests:
  - renders `data-testid="growth-timeline"`
  - renders one segment per stage with correct proportional width (`(daysEnd-daysStart)/totalDays`)
  - renders "today" marker at `currentDay/totalDays` position
  - defends `totalDays === 0` (renders empty/indicative bar, no div-by-zero crash)
- [ ] 2.5 **[GREEN]** Create `src/core/plants/presentation/components/growth-timeline/growth-timeline.tsx` — horizontal `flex` bar; segment widths via inline style; Stage names below segments; "today" marker as absolute positioned div; pure presentational
- [ ] 2.6 **[REFACTOR]** Ensure no magic numbers; stage color applied from `stage.color` prop (CSS token string)

### Phase 2.3 — i18n additions for PR2

- [ ] 2.7 Add to `src/core/plants/presentation/i18n/en.ts`: `detail.tabs` entries for `diary`, `harvests`, `pests`, `associations` (if not done in PR1); add `detail.care` namespace with label strings for Riego/Sol/Suelo/Poda cards and GrowthTimeline stage names
- [ ] 2.8 Mirror all new keys in `src/core/plants/presentation/i18n/es.ts` (parity)

### Phase 2.4 — Screen: integrate Tabs + Cuidados tab content (TDD)

- [ ] 2.9 **[RED]** Extend `plant-detail.screen.test.tsx` with PR2 tests:
  - `plant-tabs` root present
  - All 6 `tab-{name}` triggers present
  - `tab-cuidados` has `data-state="active"` by default
  - `care-grid` contains exactly 4 `care-card` elements
  - `growth-timeline` present in Cuidados tab content
- [ ] 2.10 **[GREEN]** Update `plant-detail.screen.tsx`:
  - Wrap tab area in `<Tabs defaultValue="cuidados" data-testid="plant-tabs">`
  - Add 6 `TabsTrigger` with `data-testid="tab-{name}"` for cuidados/calendario/diario/cosechas/plagas/asociaciones
  - Cuidados `TabsContent`: `<div data-testid="care-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4">` with 4 `CareCard` instances (Riego/Sol/Suelo/Poda); stub data derived from `plant` optional fields (undefined-guarded); `GrowthTimeline` below grid with indicative stub stages
  - Other 5 `TabsContent`: each renders `<InDevelopment>` (label from dict)
- [ ] 2.11 **[REFACTOR]** Extract care stub data builder into a pure helper function inline the screen file (no separate file needed at this size)

---

## PR3 — Remaining Tabs + Cleanup

### Phase 3.1 — i18n for InDevelopment labels

- [ ] 3.1 Add `detail.tabs.inDevelopment` label keys per tab (or reuse existing `inProgress` key) in `en.ts` and `es.ts` if not already covered; verify parity

### Phase 3.2 — Replace PlantSectionPlaceholder (TDD)

- [ ] 3.2 **[RED]** Extend `plant-detail.screen.test.tsx` with PR3 tests:
  - Clicking Calendario tab trigger shows `data-testid="tab-content-calendario"` with `InDevelopment` instance
  - Repeat for diario/cosechas/plagas/asociaciones
  - `queryByText(/coming soon/i)` returns `null`
  - `PlantSectionPlaceholder` is not rendered anywhere in the screen
- [ ] 3.3 **[GREEN]** Ensure all 5 non-Cuidados `TabsContent` panels use `<InDevelopment>` with i18n label (no string literals); add `data-testid="tab-content-{name}"` to each `TabsContent` element
- [ ] 3.4 Remove all `PlantSectionPlaceholder` import and JSX usages from `plant-detail.screen.tsx`
- [ ] 3.5 Verify `PlantSectionPlaceholder` has no remaining consumers via grep — if zero, delete `src/core/plants/presentation/components/plant-section-placeholder/` (component file + test)
- [ ] 3.6 **[REFACTOR]** Final pass: remove any remaining "Coming soon" string literals; ensure all copy routes through `dict.*`

---

## Cross-Cutting Checks (each PR)

- [ ] X.1 `i18n-parity.test.ts` passes (run after every PR's i18n changes)
- [ ] X.2 No `disabled` attribute on action buttons (markWatered/addPhoto/newNote) — enforced by PR1 test
- [ ] X.3 `qr-download-btn` remains `disabled` — enforced by PR1 test
- [ ] X.4 No new GraphQL queries/mutations introduced
- [ ] X.5 No files under `src/shared/presentation/components/ui/` modified (Tabs/Chip/Button/Card/Badge are consumed, not changed)
