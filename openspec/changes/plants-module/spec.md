# Spec: plants-module

**Change**: plants-module
**Status**: ready
**Depends on**: proposal.md
**Unlocks**: design.md, tasks.md

---

## Overview

This spec defines what MUST be true after the `plants-module` change is applied. It does NOT describe how to implement — that is the design phase's responsibility.

Two capabilities are covered:

- **plants-list** — authenticated user views all plants for the active space in a grid.
- **plant-detail** — authenticated user views the full detail page for a single plant.

---

## Capability 1: plants-list

### Requirements

**R1.1 — Route**
The plants list page MUST render at `/[lang]/plants` under the `(protected)` layout. Unauthenticated requests MUST be redirected by the existing auth guard — no bespoke auth logic is added in this module.

**R1.2 — Plant card content**
Each plant card MUST display:
- Plant `name` (always present).
- Plant image: `imageUrl` if present; otherwise a letter avatar derived from the first character of `name`.
- Species name (`species.name`) if present; otherwise a "no species" placeholder.
- An "En desarrollo" badge in the position where `category` and `growth stage` would eventually appear, because those fields have no API backing in v1.

**R1.3 — Empty state**
When the API returns zero plants for the active space, the list page MUST render a dedicated empty-state component. The empty state MUST NOT be an error state or a loading skeleton.

**R1.4 — Loading skeleton**
While the plant list data is being fetched, the page MUST render shimmer skeleton cards in place of real plant cards. The skeleton layout MUST match the plant card shape.

**R1.5 — "Nueva planta" button**
A "Nueva planta" button MUST be rendered in the page header. It MUST be visually disabled (e.g., `disabled` attribute or `aria-disabled`) in v1, because the creation flow is out of scope. It MUST NOT be absent from the DOM — the disabled state communicates intent.

**R1.6 — Category filter tabs**
Category filter tabs MUST be rendered as visual placeholders. Only the "Todas" tab MUST appear active. All other category tabs MUST be rendered in a disabled state. No filtering logic is wired — the tabs are non-functional in v1.

**R1.7 — Sidebar nav entry**
The sidebar navigation MUST include an "Inventario" entry with a `Leaf` icon pointing to `/[lang]/plants`. This entry MUST appear in `nav-items.ts` and be consistent across all languages (the label comes from the shared i18n dictionary).

**R1.8 — i18n coverage and parity**
All visible UI text on the plants list page MUST originate from the `plants` key of the i18n dictionary. Both `en` and `es` dictionaries MUST define the same set of keys. A dedicated `i18n-parity.test.ts` MUST assert that the `en` and `es` `plants` dictionaries have identical key sets at every nesting level.

---

## Capability 2: plant-detail

### Requirements

**R2.1 — Route**
The plant detail page MUST render at `/[lang]/plants/[id]`. It MUST be nested under the `(protected)` layout. No additional auth guard is needed beyond what `(protected)` already provides.

**R2.2 — Header: name and QR code**
The page header MUST display the plant's `name`. A print/download action MUST be rendered next to the name that allows the user to view or save the QR code. The QR code MUST be rendered as a base64 PNG image (`<img src="data:image/png;base64,...">`) sourced from the `qr.image` field returned by the API. The QR image MUST only appear on the detail page — it MUST NOT be loaded on the list page.

**R2.3 — Breadcrumb**
A breadcrumb trail MUST be rendered showing: [list label (localised)] › [plant name]. Clicking the list label MUST navigate to `/[lang]/plants`.

**R2.4 — Plant image**
If `imageUrl` is present, the plant photo MUST be rendered. If `imageUrl` is absent or null, a visual placeholder MUST be rendered instead. No broken-image state is acceptable.

**R2.5 — Species name**
If `species.name` is present, it MUST be rendered in the detail view. If `species.name` is absent or null, a localised "no species" placeholder MUST be rendered.

**R2.6 — Care sections (Riego, Sol, Suelo, Poda)**
Each of the four care sections MUST be rendered as an "En desarrollo" placeholder card. No real data is shown because the API does not back these fields in v1.

**R2.7 — Growth cycle section**
The growth cycle section MUST be rendered as an "En desarrollo" placeholder. No real data is shown.

**R2.8 — Photo history section**
The photo history section MUST be rendered as an "En desarrollo" placeholder. No real data is shown.

**R2.9 — Pest tracking section**
The pest tracking section MUST be rendered as an "En desarrollo" placeholder. No real data is shown.

**R2.10 — Tab navigation**
A tab nav MUST be rendered with at minimum three tabs: Cuidados, Calendario, Asociaciones. Only the Cuidados tab MUST be active and show real (placeholder) content. The Calendario and Asociaciones tabs MUST each show an "En desarrollo" placeholder when selected, or be rendered in a visually disabled state — either is acceptable, but they MUST NOT be absent.

**R2.11 — 404 redirect**
If the API returns a 404 for the requested plant ID (plant does not exist or does not belong to the active space), the page MUST redirect the user to `/[lang]/plants`. An error page MUST NOT be shown for this case.

**R2.12 — Loading skeleton**
While the plant detail data is being fetched, the page MUST render shimmer skeletons for each major section: header, image area, species, care cards, and tab content area. No section MUST be blank or show a spinner in isolation.

---

## Cross-Cutting Requirements

**CC1 — DDD + Hexagonal module structure**
The plants module MUST be placed at `src/core/plants/` and MUST follow the four-layer structure established by the spaces module: `domain → application → infrastructure → presentation`. No layer may be skipped. Hexagonal boundaries (ports and adapters) MUST be respected: the application layer depends only on domain interfaces; the infrastructure layer implements the repository port.

**CC2 — React Query hooks**
The presentation layer MUST expose exactly two React Query hooks: `use-plants` (list) and `use-plant` (detail). These hooks MUST wrap the corresponding use-cases (`GetPlants`, `GetPlant`) and MUST NOT call the HTTP repository directly.

**CC3 — Shared HTTP client**
The HTTP repository MUST reuse the shared axios client that injects JWT authentication headers and the `X-Space-ID` header. No bespoke auth or space-selection logic is permitted in the plants module.

**CC4 — Server Component pages**
Each Next.js page file (`plants/page.tsx`, `plants/[id]/page.tsx`) MUST be an async Server Component that calls `getDictionary(locale)` and passes the `plants` dict slice to the corresponding `'use client'` screen component via a `dict` prop.

**CC5 — Strict TDD**
All use-cases, React Query hooks, and screen components MUST have tests written BEFORE the implementation. No implementation file in the plants module MUST be added without a corresponding `.spec.ts` test file existing first.

---

## BDD Scenarios

### Scenario 1: List renders with plants

```
Given the user is authenticated with an active space
  And the active space contains at least one plant
When the user navigates to /[lang]/plants
Then the page renders a grid of plant cards
  And each card displays the plant name
  And each card displays the plant image (or letter avatar if imageUrl is absent)
  And each card displays species name (or no-species placeholder if species is absent)
  And each card displays an "En desarrollo" badge in the category/stage position
  And the "Nueva planta" button is visible and disabled
  And the "Todas" category tab is active
```

### Scenario 2: List renders empty

```
Given the user is authenticated with an active space
  And the active space contains zero plants
When the user navigates to /[lang]/plants
Then the page renders the empty-state component
  And no plant cards are shown
  And no loading skeleton is shown
  And the "Nueva planta" button is visible and disabled
```

### Scenario 3: List loading skeleton

```
Given the user is authenticated with an active space
When the user navigates to /[lang]/plants
  And the plant list data fetch is pending
Then the page renders shimmer skeleton cards
  And the skeleton cards match the plant card layout
  And no real plant data is shown
```

### Scenario 4: Detail renders with full data

```
Given the user is authenticated with an active space
  And a plant exists with imageUrl, species.name, and a QR code
When the user navigates to /[lang]/plants/[id]
Then the page renders the plant name in the header
  And the QR code is rendered as a base64 PNG image
  And the breadcrumb shows [list label] › [plant name]
  And the plant photo is rendered from imageUrl
  And the species name is rendered
  And the care sections (Riego, Sol, Suelo, Poda) render as "En desarrollo" placeholders
  And the growth cycle section renders as "En desarrollo" placeholder
  And the photo history section renders as "En desarrollo" placeholder
  And the pest tracking section renders as "En desarrollo" placeholder
  And the Cuidados tab is active and shows content
  And the Calendario and Asociaciones tabs are present but non-active
```

### Scenario 5: Detail renders with minimal data (no image, no species)

```
Given the user is authenticated with an active space
  And a plant exists with no imageUrl and no species
When the user navigates to /[lang]/plants/[id]
Then the page renders the plant name
  And a visual image placeholder is rendered instead of a photo
  And a localised "no species" placeholder is rendered
  And the QR code is still rendered if present
  And all "En desarrollo" placeholder sections render as expected
```

### Scenario 6: Detail 404 redirect

```
Given the user is authenticated with an active space
  And no plant exists with the requested id for that space (API returns 404)
When the user navigates to /[lang]/plants/[id]
Then the user is redirected to /[lang]/plants
  And no error page is shown
  And no unhandled exception is thrown
```

### Scenario 7: i18n parity (en and es keys match)

```
Given the en and es plants i18n dictionary files exist
When the i18n-parity test runs
Then the test passes with no missing or extra keys on either side
  And every nested key path present in en is also present in es
  And every nested key path present in es is also present in en
```

### Scenario 8: Sidebar nav entry

```
Given the user is authenticated
When the user views any protected page with the sidebar
Then an "Inventario" entry with a Leaf icon is visible in the sidebar
  And clicking it navigates to /[lang]/plants
```

### Scenario 9: QR code not loaded on list page

```
Given the user is authenticated with an active space
  And the active space contains plants with QR codes
When the user navigates to /[lang]/plants
Then no QR code images are fetched or rendered in the list view
  And the QR code data is only loaded when viewing a detail page
```

---

## Out-of-Scope Assertions (explicit exclusions)

The following MUST NOT be implemented in this change:

- Plant creation form or API mutation for creating plants.
- Functional category filtering (the filter tabs are visual placeholders only).
- Pagination controls for the plant list.
- Riego, Sol, Suelo, Poda care section content sourced from real API data.
- Photo upload or management.
- Pest tracking data.
- Calendario and Asociaciones tab content.

---

## Assumptions Made During Spec (from proposal ambiguities)

1. **"No species" placeholder on list cards**: The proposal specifies `species.name` on the card but does not say what to render when absent. This spec requires a placeholder rather than rendering nothing.
2. **404 from API vs. wrong space**: Treating any 404 as "plant not accessible" and redirecting to the list — no distinction is needed at the UI level in v1.
3. **Breadcrumb label**: Assumed to be the localised list page title from the `plants` i18n dictionary, not a hardcoded string.
4. **Calendario and Asociaciones tabs**: The proposal says "only Cuidados tab is active, others show En desarrollo" — this spec accepts either a disabled-tab state OR an active-but-placeholder content state, as both are consistent with the proposal's intent.
5. **Leaf icon**: Assumed to be from the existing icon library used by the spaces sidebar — no new icon dependency.
