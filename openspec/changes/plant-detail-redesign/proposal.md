# Proposal: Plant Detail Redesign

## Intent

### Problem
The current plant detail screen (`src/core/plants/presentation/screens/plant-detail/plant-detail.screen.tsx`) is a flat vertical stack of placeholders: a header, the species name, three disabled buttons, a full-width image, an inline QR `div`, fake (non-functional) tab buttons, and four `PlantSectionPlaceholder` tiles that all read "Coming soon". It communicates nothing useful, looks unfinished, and does not reflect the product's visual identity (serif headlines, paper-grain texture, chip taxonomy, care-oriented information architecture).

It is also misleading: the fake tabs and disabled buttons imply functionality that does not exist, and the placeholders give no signal about what is genuinely planned versus what is simply missing.

### Why now
- The design direction is settled (target mockup approved) and the design system already ships the tokens this screen needs (`.chip`, `.card`, `.headline`, `.eyebrow`, `--font-serif`, `paper-grain`).
- The backend already returns enough real data (`name`, `species`, `imageUrl`, `qr`, timestamps) to make the header section genuinely functional today — not a placeholder.
- A sibling change (`sidebar-screen-header`) has already built and tested `Tabs` and `Chip`; we can consolidate them onto `main` here rather than duplicating effort later.
- Honest placeholders (`InDevelopment`) replace the dishonest "Coming soon" tiles, setting clear expectations until the backing domains land.

### Success looks like
A plant detail page where the header is fully real and functional from existing API data, the "Cuidados" tab shows structured care information, and every section that depends on not-yet-existing backend data is clearly and consistently marked as in development — all rendered in the product's visual language and covered by updated tests with full i18n parity.

## Scope

### In scope
- Full visual + structural redesign of `PlantDetailScreen`.
- A 3-column responsive header: plant image (left), identity + chips + action bar (center), QR card (right) — driven by real `plantFindById` data.
- Tab navigation (Cuidados, Calendario, Diario, Cosechas, Plagas, Asociaciones) using a real `Tabs` component.
- A functional "Cuidados" tab: 2x2 grid of `CareCard`s plus a `GrowthTimeline` ("Ciclo") bar.
- Consolidating `Tabs` and `Chip` onto `main` (sourced from the `sidebar-screen-header` worktree).
- Two new plant-module components: `CareCard` and `GrowthTimeline`.
- All non-functional / data-blocked sections rendered via the existing `InDevelopment` component.
- New i18n keys in BOTH `en.ts` and `es.ts` (parity-enforced).
- Rewriting the 8 existing tests to match the new DOM and adding coverage for the new structure.

### Out of scope
- Any backend / GraphQL schema changes. We work strictly with the fields `plantFindById` returns today.
- Implementing real Calendario, Diario, Cosechas, Plagas, or Asociaciones features (these depend on domains not yet on the roadmap).
- Real care-data persistence (watering frequency, sun exposure, growth stage as stored fields). Where the mockup shows such data and the backend lacks it, we use typed stubs or species-derived defaults, clearly scoped.
- The button ACTIONS ("Marcar regado", "Añadir foto", "Nueva nota") wiring to real mutations — the action bar renders but actions are stubbed/disabled until their domains exist.
- Changes to the route or the server/client component split (`app/[lang]/(protected)/plants/[id]/page.tsx` stays as-is).

## Approach

Delivered as three sequential PRs to keep each review small and independently shippable.

### PR1 — Header redesign (real data, no new dependencies)
Replace the flat top of the screen with the 3-column header layout using only existing API data and components already on `main`.
- **Left**: square plant image (~400px) using `imageUrl` with `placeholder-img` fallback.
- **Center**: eyebrow line, large serif title (`name`), italic Latin subtitle (`species.name`), a row of chips, and the action bar (`Marcar regado` primary, `Añadir foto` / `Nueva nota` outline — rendered, actions stubbed).
- **Right**: QR card built from the real `qr` object (`qr.image`, plant code, "Imprime y pega en la maceta", "Descargar PDF").
- Chips that need missing data (category, sun, watering, growth stage) are sourced from typed stubs/species defaults so the visual is honest about being indicative, not stored.
- Rationale: ships the highest-value, fully-real part first with zero new shared components.

### PR2 — Tabs + Cuidados tab
Bring `Tabs` and `Chip` from the `sidebar-screen-header` worktree onto `main`, then build the active tab.
- Consolidate `tabs.tsx` (Radix-based, `line`/`pill` variants, tested) and `chip.tsx` into `src/shared/presentation/components/ui/`.
- Render the full tab bar; only **Cuidados** is active.
- New `CareCard` (plants module): icon + colored label + title + description, arranged in a 2x2 grid (Riego, Sol, Suelo, Poda).
- New `GrowthTimeline` (plants module): horizontal stage bar (Semilla → Plántula → Vegetativa → Fructificación) with a "today" marker.
- Care content and growth stage use typed stubs / species-derived defaults (no backend dependency).
- Rationale: consolidating the shared components here avoids duplication and unblocks all future tabbed screens.

### PR3 — Remaining tabs as honest placeholders
Wire the remaining tabs (Calendario, Diario, Cosechas, Plagas, Asociaciones) to render the existing `InDevelopment` component with a descriptive label each.
- Also covers the mockup's "Historial fotográfico" and "Plagas · Seguimiento" sub-sections — rendered as `InDevelopment` until their domains exist.
- Rationale: replaces the dishonest "Coming soon" placeholders with the product's standard, consistent in-development treatment, while keeping the navigation shell complete.

## Components

### Reused (on `main`)
- `Button`, `Card`/`CardHeader`/`CardContent`/`CardFooter`, `Badge`, `ScreenHeader`, `InDevelopment`.
- Design tokens: `.chip`, `.card`, `.headline`, `.eyebrow`, `.dot-*`, `.placeholder-img`, `.paper-grain`, `--font-serif`, `--font-sans`.

### Consolidated onto `main` (from `sidebar-screen-header` worktree)
- `tabs.tsx` — Radix Tabs, `line` + `pill` variants, CVA, already tested.
- `chip.tsx` — wraps `.chip` CSS with variants (forest, honey, terra, sage, outline).

### New (plants module — too domain-specific for shared)
- `CareCard` — icon + label + title + description.
- `GrowthTimeline` — horizontal stage bar with day/stage marker.

### Removed
- `PlantSectionPlaceholder` usages and the fake inline tab buttons / inline QR `div`.

## Constraints

- **Backend gap**: `plantFindById` does NOT return bancal, plantCount, sowingDate, category, sunExposure, wateringFrequency, growthStage, or any diary/harvest/pest/association data — and these are NOT on the roadmap yet. The header chips and Cuidados content for these MUST use typed stubs / species defaults, and data-blocked sections MUST use `InDevelopment`.
- **InDevelopment decision (confirmed)**: any section that requires missing backend data uses `src/shared/presentation/components/in-development/in-development.tsx`. No new placeholder component.
- **i18n parity**: `i18n-parity.test.ts` enforces that every key in `en.ts` has an equivalent in `es.ts`. Every new copy string MUST be added to BOTH files.
- **Tests**: the 8 existing tests in `plant-detail.screen.test.tsx` assert the current DOM and WILL break — they must be rewritten to match the redesigned structure, with new coverage for header, tabs, and the Cuidados tab.
- **No backend changes**: this change is purely presentational.

## Success Criteria

- Header renders the 3-column layout (image / identity+chips+actions / QR) entirely from real `plantFindById` data, with graceful fallbacks for missing `imageUrl`.
- Tab bar renders all six tabs; switching is functional; only Cuidados shows real content.
- Cuidados tab shows the 2x2 `CareCard` grid and the `GrowthTimeline` "Ciclo" bar.
- All data-blocked sections (Calendario, Diario, Cosechas, Plagas, Asociaciones, photo history, pest tracking) render `InDevelopment` — no "Coming soon" strings remain.
- `Tabs` and `Chip` live in `src/shared/presentation/components/ui/` on `main`.
- All new copy exists in both `en.ts` and `es.ts`; `i18n-parity.test.ts` passes.
- `plant-detail.screen.test.tsx` is rewritten and green; the full suite passes.
- Visual output matches the approved mockup using existing design-system tokens.
