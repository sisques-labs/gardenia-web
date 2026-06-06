# Design: Plant Detail Redesign

> Technical (architecture-level) design for the `plant-detail-redesign` change.
> Scope reference: `openspec/changes/plant-detail-redesign/proposal.md`.
> This document is the HOW at the architectural level. It does NOT enumerate task steps.

## 1. Architectural Approach

### Pattern & layering

The change is purely **presentational** and stays inside the existing Screaming/Hexagonal layering already in place for the plants module:

```
src/core/plants/
  domain/            ← Plant interface (read-only here; we ADD optional fields, no new entities)
  presentation/
    screens/         ← PlantDetailScreen (orchestration / composition root)
    components/       ← domain-specific presentational components (CareCard, GrowthTimeline)
    hooks/           ← usePlant (unchanged)
    i18n/            ← en.ts / es.ts (additive)
src/shared/presentation/components/ui/  ← generic UI primitives (Tabs, Chip, Card, Button, Badge)
```

We follow the **container / presentational** split that the screen already uses:

- `PlantDetailScreen` remains the **container**: it owns data fetching (`usePlant`), loading/error states, routing side-effects, and i18n dictionary wiring. It composes presentational pieces and feeds them plain props.
- New components (`CareCard`, `GrowthTimeline`) are **pure presentational**: no data fetching, no i18n lookups, no store access. They receive everything via props (label/title/description strings are resolved by the screen from the dictionary and passed down). This keeps them trivially testable and reusable.

### Composition boundary decisions

The screen is composed from four logical regions, each a self-contained subtree:

1. **Breadcrumb header** — `ScreenHeader` (unchanged contract).
2. **Identity header** — 3-column responsive grid (image / identity+chips+actions / QR card).
3. **Tab bar** — `Tabs` shell with six triggers.
4. **Tab panels** — `Cuidados` (real content) + five `InDevelopment` panels.

Regions 2-4 are inlined in the screen for PR1/PR3 and only extracted into module components where there is genuine reuse value or domain complexity (CareCard, GrowthTimeline). We deliberately do NOT over-decompose the header into `PlantImage` / `PlantIdentity` / `QrCard` sub-components: they are single-use, layout-only JSX with no logic, so extraction would add indirection without payoff. If a second screen ever needs the QR card, we promote it then (YAGNI).

## 2. Component Map

### Reused (already on this branch — verified)

| Component | Path | Use here |
|-----------|------|----------|
| `Button` | `src/shared/presentation/components/ui/button.tsx` | Action bar (Marcar regado = primary, Añadir foto / Nueva nota = outline) |
| `Badge` | `src/shared/presentation/components/ui/badge.tsx` | Pest status badge (PR3 InDevelopment context) |
| `Card` family | `src/shared/presentation/components/ui/card.tsx` | QR card wrapper + CareCard wrapper |
| `Tabs` family | `src/shared/presentation/components/ui/tabs.tsx` | Tab navigation (`line` variant) |
| `Chip` | `src/shared/presentation/components/ui/chip.tsx` | Header taxonomy chips |
| `ScreenHeader` | `src/shared/presentation/components/screen-header/screen-header.tsx` | Breadcrumb |
| `InDevelopment` | `src/shared/presentation/components/in-development/in-development.tsx` | All data-blocked panels/sections |

### New (plants module — domain-specific)

| Component | Path | Reason for module placement |
|-----------|------|-----------------------------|
| `CareCard` | `src/core/plants/presentation/components/care-card/care-card.tsx` | Models plant care taxonomy (Riego/Sol/Suelo/Poda); coupled to the plants care domain vocabulary |
| `GrowthTimeline` | `src/core/plants/presentation/components/growth-timeline/growth-timeline.tsx` | Growth stages (Semilla → Plántula → Vegetativa → Fructificación) are a plants domain concept |

### Removed

- `PlantSectionPlaceholder` usages (replaced by `InDevelopment`).
- Inline fake tab buttons and inline QR `<div>` (replaced by `Tabs` + QR `Card`).

> Note: `PlantSectionPlaceholder` component file removal is out of this change's necessary scope unless no other screen references it — verify references before deleting. The redesign only removes its USAGE in this screen.

## 3. Data Flow

```
plantFindById (GraphQL, unchanged)
        │
        ▼
usePlant(spaceId, plantId)  ── React Query hook (unchanged)
        │  { data: Plant, isLoading, isError }
        ▼
PlantDetailScreen (container)
        │   ├─ derives display model from Plant + typed stubs/species defaults
        │   ├─ resolves i18n strings from dict.detail.*
        │   ▼
   ┌────────────────────────────────────────────────────────┐
   │ Identity header                                          │
   │   image  ← plant.imageUrl ?? .placeholder-img            │
   │   name   ← plant.name (.headline serif)                  │
   │   species← plant.species?.name (italic)                  │
   │   chips  ← stub-derived (category/sun/watering/stage)    │
   │   QR     ← plant.qr.image (base64) + plant code          │
   └────────────────────────────────────────────────────────┘
        │
        ▼
   Tabs ── Cuidados panel
            ├─ CareCard × 4   ← stub care model (per field, undefined-guarded)
            └─ GrowthTimeline ← stub stages + currentDay/totalDays
        └─ Calendario/Diario/Cosechas/Plagas/Asociaciones → InDevelopment
```

**Real data**: `name`, `species.name`, `imageUrl`, `qr.image`, `qr.targetUrl` (plant code), timestamps. Everything in the header that maps to these is genuinely functional.

**Stub-derived data**: category, sun exposure, watering frequency, growth stage, care descriptions, timeline stages. These are NOT returned by the backend and are NOT on the roadmap (see Constraints in proposal).

## 4. Integration Points

- **GraphQL**: none. No new queries or mutations. `PlantFindById` is sufficient for PR1 and PR2. (ADR-5)
- **Routing**: unchanged. `app/[lang]/(protected)/plants/[id]/page.tsx` and the server/client split stay as-is.
- **i18n**: additive keys in `src/core/plants/presentation/i18n/en.ts` and `es.ts`. Both files MUST stay key-parity-aligned (`i18n-parity.test.ts` enforces it via recursive `flatKeys` comparison — nested objects allowed, arrays treated as leaves).
- **Design system**: consumes existing CSS classes (`.chip` + variants, `.card`, `.headline`, `.eyebrow`, `.paper-grain`, `.placeholder-img`) and tokens (`--forest`, `--honey`, `--terracotta`, `--sage`, `--font-serif`, `--font-sans`). No design-system file changes required.
- **Store**: `useSpacesStore` for `currentSpaceId` fallback — unchanged.

## 5. Stub Data Strategy (ADR-4 detail)

**Chosen: typed optional fields on a presentation-layer view model + undefined guards + `InDevelopment` / `Chip` fallback.**

We do NOT hardcode species-keyed lookup tables. Instead:

1. The `Plant` domain interface gains **optional** care/taxonomy fields (all `?`), documented as "not yet persisted by backend":
   - `category?`, `sunExposure?`, `wateringFrequency?`, `growthStage?`
   - These remain `undefined` from the live API today.
2. The screen builds a small **display model** that maps each optional field to a chip/care entry. When a field is `undefined`, the UI either omits the chip or renders the honest placeholder — it never fabricates a value as if it were real.
3. `CareCard` and `GrowthTimeline` receive only resolved props; the screen decides stub-vs-real upstream.

Rationale: this is honest (no fake data masquerading as stored), cleanly typed, and **wires to the backend with a one-line change** when those fields ship (remove the stub default, the optional field starts arriving populated). A species-keyed hardcoded table would be dishonest (implies per-species knowledge we don't have) and harder to retire.

For purely indicative visuals where the mockup needs *something* shown (e.g. the growth timeline shape), the screen passes neutral indicative defaults and the surrounding section is labelled as indicative — but anything requiring real per-plant data that we cannot derive renders `InDevelopment`.

## 6. New Component Contracts

### `CareCard`

```ts
// src/core/plants/presentation/components/care-card/care-card.tsx
type CareCardProps = {
  icon: React.ReactNode;     // lucide icon, sized by caller
  label: string;             // e.g. "Riego" — colored .eyebrow
  labelColor: string;        // CSS var or token, e.g. "var(--forest)"
  title: string;             // e.g. "Cada 3 días"
  description: string;       // muted helper copy
};
```

Structure: `Card > CardContent` → colored `.eyebrow` label row (icon + label), `font-medium` title, `text-sm` muted description. Pure, no i18n, no data access. Rendered 4× in a `grid grid-cols-1 sm:grid-cols-2 gap-4` (the 2×2 grid).

### `GrowthTimeline`

```ts
// src/core/plants/presentation/components/growth-timeline/growth-timeline.tsx
type Stage = {
  name: string;       // "Semilla" | "Plántula" | "Vegetativa" | "Fructificación"
  daysStart: number;
  daysEnd: number;
  color: string;      // token, e.g. "var(--sage)"
};
type GrowthTimelineProps = {
  stages: Stage[];
  currentDay: number;   // for the "today" marker position
  totalDays: number;    // denominator for proportional widths
};
```

Structure: horizontal `flex` bar; each stage segment width = `(daysEnd - daysStart) / totalDays`. A vertical marker line is positioned at `currentDay / totalDays`. Stage names sit under/over their segment. Pure presentational; defends against `totalDays === 0` (avoid divide-by-zero → render an empty/indicative bar). Stage names come pre-translated from the screen.

## 7. Delivery Sequencing (3 PRs)

| PR | Delivers | New shared deps | New module components |
|----|----------|-----------------|------------------------|
| PR1 | 3-column header (image / identity+chips+actions / QR card) from real data | none (Tabs/Chip/Card all present) | none |
| PR2 | Cuidados tab: 2×2 CareCard grid + GrowthTimeline; tab bar fully rendered | none | CareCard, GrowthTimeline |
| PR3 | Remaining 5 tabs → InDevelopment; photo-history & pest sections → InDevelopment | none | none |

Each PR is independently shippable and review-small. PR1 carries the highest real-value (fully functional header) with zero new components.

## 8. Architecture Decision Records

### ADR-1 — `CareCard` lives in the plants module, not shared

- **Decision**: place `CareCard` in `src/core/plants/presentation/components/`.
- **Rationale**: the care taxonomy (Riego/Sol/Suelo/Poda) and its data model are plants-domain concepts. A "card with icon+label+title+description" is generic *in shape*, but its meaning here is domain-bound. Premature promotion to shared would invent a generic abstraction with no second consumer.
- **Rejected**: shared `StatCard`/generic InfoCard — `StatCard` already exists for numeric stats and has a different contract; reusing it would distort its purpose. Promote later only if a real second consumer appears (YAGNI).

### ADR-2 — `GrowthTimeline` lives in the plants module

- **Decision**: place `GrowthTimeline` in the plants module.
- **Rationale**: growth stages are a plants domain concept; the component encodes domain vocabulary and a domain-specific visual metaphor. No cross-module reuse is foreseeable.
- **Rejected**: a generic shared "Timeline/ProgressStages" primitive — speculative generality; we have exactly one use case.

### ADR-3 — `Tabs` and `Chip` are shared UI primitives (already on this branch)

- **Decision**: `Tabs` and `Chip` live in `src/shared/presentation/components/ui/`.
- **IMPORTANT correction to the proposal**: the proposal/brief describe "promoting Tabs and Chip from the `sidebar-screen-header` worktree onto main in PR2". On the current working branch **both files already exist** at `src/shared/presentation/components/ui/tabs.tsx` and `chip.tsx`, and the existing screen already imports `Tabs`. The "promotion" step is therefore a **no-op here** — there is nothing to consolidate. PR2 simply *consumes* them. If a future rebase onto a branch lacking these files occurs, the promotion becomes a real prerequisite again; otherwise skip it.
- **Rationale**: both are generic primitives (Radix Tabs with `line`/`pill` CVA variants; Chip wrapping `.chip` CSS variants) with no domain coupling — correct home is shared.

### ADR-4 — Stub strategy: typed optional fields + guards + InDevelopment fallback

- **Decision**: model missing care/taxonomy data as **optional fields on the presentation view model / `Plant` interface**, undefined-guarded, with `InDevelopment` (or chip omission) as the honest fallback. See §5.
- **Rejected**: hardcoded species-keyed default tables — dishonest (implies per-species knowledge we lack), harder to retire, and couples presentation to a fake data source. Optional-fields approach wires to the real backend with a near-zero-diff change when fields ship.

### ADR-5 — No new GraphQL operations in this change

- **Decision**: rely solely on the existing `PlantFindById` query for PR1 and PR2.
- **Rationale**: the change is presentational; the header's real content is fully covered by current fields (`name`, `species`, `imageUrl`, `qr`, timestamps). Adding queries for not-yet-existing domains would be speculative and is explicitly out of scope.
- **Rejected**: introducing placeholder queries for Calendario/Diario/etc. — those domains don't exist; `InDevelopment` is the honest treatment.

## 9. Risks & Assumptions

- **R1 — Stub honesty drift**: optional-field stubs could be mistaken for real data over time. Mitigation: keep stub-derived chips visually/semantically distinct or section-labelled as indicative; never present a fabricated value with the same affordance as stored data.
- **R2 — Test rewrite breadth**: the 8 existing tests assert the OLD DOM and WILL break. They must be rewritten alongside the implementation (handled in the tasks phase, not here). Risk if treated as optional.
- **R3 — i18n parity regression**: every new copy string must land in BOTH `en.ts` and `es.ts` or `i18n-parity.test.ts` fails. Additive-only, nested-object structure.
- **R4 — Proposal/branch divergence on Tabs/Chip**: see ADR-3. Assumption validated on the current branch (files present). Re-verify if rebasing.
- **A1 — Domain interface change is acceptable**: adding optional fields to `Plant` is presentation-safe (no backend contract change, fields stay `undefined`). Assumes no schema-codegen guard rejects optional-but-unqueried fields — verify the GraphQL typing source isn't auto-generated/locked before adding fields; if it is, hold the view model in the presentation layer instead.
