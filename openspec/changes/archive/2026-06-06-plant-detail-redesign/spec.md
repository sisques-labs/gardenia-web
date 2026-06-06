# Plant Detail Redesign — Specification

## Purpose

Define the behavioral requirements for redesigning `PlantDetailScreen` from a flat placeholder stack into a 3-column header + tabbed care-oriented layout, delivered in three sequential PRs.

---

## PR1 — Header Redesign

### Requirement: R1.1 Three-Column Header Layout

The screen MUST render a 3-column header when plant data is loaded: left column (plant image), center column (identity block + chip row + action bar), right column (QR card).

#### Scenario: Header renders with full plant data

- GIVEN a plant with `name`, `species.name`, `imageUrl`, and `qr` fields
- WHEN `PlantDetailScreen` mounts
- THEN the header renders with `data-testid="plant-header"` containing all three columns

#### Scenario: Image column fallback when imageUrl is absent

- GIVEN a plant with no `imageUrl`
- WHEN `PlantDetailScreen` mounts
- THEN the image column renders `data-testid="plant-image-placeholder"` with the `dict.detail.noImage` text

### Requirement: R1.2 Identity Block (Center Column)

The center column MUST render an eyebrow line, a large serif plant name, an italic Latin species subtitle, and a chip row below it. If `species` is absent, MUST display `dict.detail.noSpecies` in the subtitle position.

#### Scenario: Full identity with species

- GIVEN a plant with `name = "Monstera"` and `species.name = "Monstera deliciosa"`
- WHEN the header renders
- THEN `data-testid="plant-name"` contains "Monstera" and `data-testid="plant-species"` contains "Monstera deliciosa"

#### Scenario: Missing species fallback

- GIVEN a plant with `species = undefined`
- WHEN the header renders
- THEN `data-testid="plant-species"` contains `dict.detail.noSpecies`

### Requirement: R1.3 Action Bar Buttons (Not Disabled)

The action bar MUST render "Marcar regado" (primary `Button`), "Añadir foto" (outline `Button`), "Nueva nota" (outline `Button`) using the shared `Button` component. Buttons MUST NOT be `disabled`. `onClick` handlers are no-op stubs.

#### Scenario: Action buttons are rendered and enabled

- GIVEN a loaded plant
- WHEN the action bar renders
- THEN `getByRole('button', { name: /marcar regado/i })` is in the document and NOT disabled
- AND `getByRole('button', { name: /añadir foto/i })` is NOT disabled
- AND `getByRole('button', { name: /nueva nota/i })` is NOT disabled

### Requirement: R1.4 QR Card (Right Column)

The QR card MUST use the shared `Card` component. It MUST render the QR image from `plant.qr.image` (base64), the plant code from `plant.qr.id`, the hint string, and a "Descargar PDF" button that is visually disabled (no PDF generation exists yet).

#### Scenario: QR card renders with real qr data

- GIVEN `plant.qr.image = "base64data"` and `plant.qr.id = "qr1"`
- WHEN the QR card renders
- THEN `getByAltText('QR')` has `src="data:image/png;base64,base64data"`
- AND `data-testid="plant-qr-code"` contains "qr1"
- AND `data-testid="qr-download-btn"` is disabled

#### Scenario: QR card absent when plant has no qr

- GIVEN `plant.qr = undefined`
- WHEN `PlantDetailScreen` mounts
- THEN `data-testid="plant-qr-card"` is NOT in the document

### Requirement: R1.5 Loading and Error States

The screen MUST display a skeleton (`animate-pulse`) while loading. On error it MUST call `router.replace("/{lang}/plants")` and render nothing.

#### Scenario: Loading skeleton

- GIVEN `isLoading = true`
- WHEN `PlantDetailScreen` mounts
- THEN the document contains an element with class `animate-pulse`

#### Scenario: Error redirect

- GIVEN `isError = true`
- WHEN `PlantDetailScreen` mounts
- THEN `router.replace` is called with `"/en/plants"`

### Requirement: R1.6 Breadcrumb Navigation

The screen MUST render a `ScreenHeader` breadcrumb with a link to the plants list (`/{lang}/plants`) using `dict.detail.breadcrumbList` as the label.

#### Scenario: Breadcrumb link present

- GIVEN a loaded plant with `lang = "en"`
- WHEN the screen renders
- THEN `getByRole('link', { name: dict.detail.breadcrumbList })` has `href="/en/plants"`

---

## PR2 — Tabs + Cuidados Tab

### Requirement: R2.1 Tab Bar with Six Tabs

The screen MUST render a `Tabs` (shared `line` variant) with six triggers: Cuidados, Calendario, Diario, Cosechas, Plagas, Asociaciones. Cuidados MUST be the default active tab.

#### Scenario: All six tab triggers present

- GIVEN a loaded plant
- WHEN `PlantDetailScreen` mounts
- THEN `data-testid="tab-cuidados"`, `data-testid="tab-calendario"`, `data-testid="tab-diario"`, `data-testid="tab-cosechas"`, `data-testid="tab-plagas"`, `data-testid="tab-asociaciones"` are all in the document

#### Scenario: Cuidados tab is active by default

- GIVEN a loaded plant
- WHEN `PlantDetailScreen` mounts
- THEN `data-testid="tab-cuidados"` has `data-state="active"`

### Requirement: R2.2 CareCard Grid (Cuidados Tab)

The Cuidados tab MUST render four `CareCard` components in a 2x2 grid for: Riego, Sol, Suelo, Poda. Each card MUST show an icon, a colored label, a title, and a description sourced from typed stubs / species defaults. No backend dependency.

#### Scenario: CareCard grid renders

- GIVEN the Cuidados tab is active
- WHEN the tab content renders
- THEN `data-testid="care-grid"` contains exactly four `data-testid="care-card"` elements

### Requirement: R2.3 GrowthTimeline (Cuidados Tab)

The Cuidados tab MUST render a `GrowthTimeline` component showing a horizontal stage bar (Semilla → Plántula → Vegetativa → Fructificación) with a "today" marker. Data comes from typed stubs.

#### Scenario: Growth timeline renders

- GIVEN the Cuidados tab is active
- WHEN the tab content renders
- THEN `data-testid="growth-timeline"` is in the document

### Requirement: R2.4 Chip and Tabs Promotion

`Chip` and `Tabs` MUST reside in `src/shared/presentation/components/ui/` on `main` before PR2 merges. No inline re-implementation is permitted.

---

## PR3 — Remaining Tabs as Honest Placeholders

### Requirement: R3.1 Non-Cuidados Tabs Render InDevelopment

Each of Calendario, Diario, Cosechas, Plagas, and Asociaciones tab content panels MUST render the shared `InDevelopment` component with a descriptive i18n label. No "Coming soon" string literals remain.

#### Scenario: Switching to Calendario tab shows InDevelopment

- GIVEN a loaded plant and the Calendario tab trigger is clicked
- WHEN the tab content renders
- THEN `data-testid="tab-content-calendario"` contains an `InDevelopment` instance

#### Scenario: No "Coming soon" text anywhere

- GIVEN a fully loaded screen
- WHEN querying `queryByText(/coming soon/i)`
- THEN the result is `null`

### Requirement: R3.2 PlantSectionPlaceholder Removed

The `PlantSectionPlaceholder` component MUST NOT appear anywhere in `PlantDetailScreen` after PR3 merges.

---

## Cross-Cutting Requirements

### Requirement: CC1 i18n Parity

Every new i18n key added to `en.ts` MUST have an equivalent key in `es.ts`. The CI check `i18n-parity.test.ts` MUST pass after each PR.

#### Scenario: Parity check passes after PR1

- GIVEN new keys are added to `en.ts` for PR1
- WHEN `i18n-parity.test.ts` runs
- THEN all keys in `en.ts` have a match in `es.ts` and the test passes

### Requirement: CC2 Shared Component Reuse

New UI elements MUST reuse shared components before creating new ones. The following shared components MUST be used where applicable: `Button`, `Card`/`CardHeader`/`CardContent`/`CardFooter`, `Badge`, `Chip`, `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`, `ScreenHeader`, `InDevelopment`.

### Requirement: CC3 Backend Gap — No Missing Fields Rendered as Data

Fields not returned by `plantFindById` (bancal, plantCount, sowingDate, category, sunExposure, wateringFrequency, growthStage, diary, harvests, pests, associations) MUST NOT be rendered as if they were real stored data. Sections requiring these fields MUST use `InDevelopment` or typed stubs clearly scoped as indicative.

### Requirement: CC4 Test Contract — DOM Testids

The rewritten `plant-detail.screen.test.tsx` MUST assert the following `data-testid` attributes:

| testid | Element | PR |
|---|---|---|
| `plant-header` | 3-col header wrapper | PR1 |
| `plant-image` | `<img>` / Next Image of plant | PR1 |
| `plant-image-placeholder` | fallback text span | PR1 |
| `plant-name` | heading with plant name | PR1 |
| `plant-species` | species / fallback text | PR1 |
| `plant-action-bar` | action button group | PR1 |
| `plant-qr-card` | QR Card wrapper | PR1 |
| `plant-qr-code` | plant code display | PR1 |
| `qr-download-btn` | disabled PDF button | PR1 |
| `plant-tabs` | Tabs root | PR2 |
| `tab-cuidados` | TabsTrigger Cuidados | PR2 |
| `tab-calendario` | TabsTrigger Calendario | PR2 |
| `tab-diario` | TabsTrigger Diario | PR2 |
| `tab-cosechas` | TabsTrigger Cosechas | PR2 |
| `tab-plagas` | TabsTrigger Plagas | PR2 |
| `tab-asociaciones` | TabsTrigger Asociaciones | PR2 |
| `care-grid` | CareCard 2x2 grid | PR2 |
| `care-card` | individual CareCard (×4) | PR2 |
| `growth-timeline` | GrowthTimeline bar | PR2 |
| `tab-content-calendario` | Calendario TabsContent | PR3 |
| `tab-content-diario` | Diario TabsContent | PR3 |
| `tab-content-cosechas` | Cosechas TabsContent | PR3 |
| `tab-content-plagas` | Plagas TabsContent | PR3 |
| `tab-content-asociaciones` | Asociaciones TabsContent | PR3 |

The 8 existing tests that assert disabled buttons, the old QR inline div, and `PlantSectionPlaceholder` presence MUST be rewritten or replaced. No test may rely on `disabled` state for action buttons after PR1.
