# Proposal: plants-module

## Intent

### Problem
Gardenia's backend (`gardenia-api`) fully exposes a plants domain — `GET /api/plants`,
`GET /api/plants/:id`, plant species, and per-plant QR codes — but `gardenia-web` has **no
plants UI at all**. Users can authenticate and manage spaces, yet they cannot see the plants
that live inside those spaces. The product's core promise ("Catálogo de la huerta" / garden
inventory) is currently unreachable from the web app.

### Why now
The data layer is ready on the API side, the spaces module already establishes the exact DDD +
Hexagonal pattern to mirror, and the shared infrastructure (axios client with JWT + `X-Space-ID`
interceptors, `AppShell`, i18n dictionaries, shared `Card`/`Badge`/`Button`/`ScreenHeader`) is in
place. There is no architectural blocker — only the absence of the module itself. Shipping a
read-only inventory now unlocks the next wave of features (care tracking, growth stages, photos)
without re-plumbing.

### Success looks like
- A user lands on `/[lang]/plants` and sees a grid of their space's plants (name, image or letter
  avatar, species name).
- Clicking a plant opens `/[lang]/plants/[id]` showing the plant header, image, species, and its
  QR code.
- Sections with no API backing render as clear **"En desarrollo"** placeholders — honest, not broken.
- The whole module follows the spaces pattern exactly, is fully tested under Strict TDD, and ships
  as two PRs each under 400 lines.

---

## Scope (v1 — this change)

### In scope
- **List page** (`/[lang]/plants`): responsive grid of plant cards. Each card shows name,
  `imageUrl` (or a letter avatar fallback), `species.name`, and an **"En desarrollo"** badge where
  category/growth-stage would go.
- **Detail page** (`/[lang]/plants/[id]`): plant name, `imageUrl`, `species.name`, the QR code
  image (base64 PNG), and every care/cycle/photo/pest section rendered as **"En desarrollo"**
  placeholders.
- **Full DDD module** at `src/core/plants/` across all four layers:
  `domain → application → infrastructure → presentation`.
- **Two use-cases**: `GetPlants` (list) and `GetPlant` (detail), each with a repository port.
- **React Query hooks** wrapping both use-cases (`use-plants`, `use-plant`).
- **i18n**: new `plants` key in both `en` and `es` dictionaries, plus an `i18n-parity.test.ts`
  enforcing key parity.
- **Sidebar nav**: add an **"Inventario"** entry with the `Leaf` icon pointing to `/[lang]/plants`.
- **Strict TDD**: tests written first for all use-cases, hooks, and screen components.

### Out of scope (follow-up changes)
- "Nueva planta" creation form/flow (rendered disabled with tooltip in v1).
- Category filter tabs as functional filters — no API backing (rendered as visual placeholders).
- Pagination controls (fetch defaults for now).
- Watering / Sol / Suelo / Poda care sections (API fields missing).
- Photo upload and photo history.
- Pest tracking.
- Calendar and Associations detail tabs.

---

## Approach

### Option A — Full DDD layers mirroring the spaces module (selected)

This is the **only acceptable option** given the project's architectural conventions. The plants
module mirrors `src/core/spaces/` exactly:

1. `domain/interfaces/plant.interface.ts` — plain TS interfaces (`Plant`, `PlantSpecies`, `PlantQr`).
2. `application/ports/plants.repository.port.ts` — repository interface.
3. `application/use-cases/get-plants/` and `get-plant/` — use-case classes + `.spec.ts`.
4. `infrastructure/repositories/plants-http.repository.ts` — axios client reusing the shared JWT +
   `X-Space-ID` interceptors.
5. `presentation/hooks/use-plants/` + `use-plant/` — React Query wrappers.
6. `presentation/screens/` — `'use client'` screens receiving a `dict` prop, with `<Suspense>` +
   shimmer skeletons.
7. `presentation/i18n/en.ts` + `es.ts` + `i18n-parity.test.ts`.
8. Async Server Component pages calling `getDictionary(locale)` and passing the `plants` dict slice.

**Rationale**: consistency, testability, and zero new architectural precedent. The shared axios
infrastructure already injects auth + space headers, so plants get the right `X-Space-ID` at request
time without bespoke wiring.

### Rejected alternatives
- **Option B — Thin (skip use-cases)**: fewer files, but breaks the Hexagonal boundary and sets a
  bad precedent. Rejected.
- **Option C — Server Components with direct fetch**: simpler, but plants require `X-Space-ID` from
  the client auth context at request time — impossible from a pure Server Component. Rejected.

---

## Delivery

Two **chained PRs** toward `main`, each kept under 400 lines (delivery strategy: `ask-on-risk`; the
full module with tests exceeds the budget, so chaining is mandatory).

- **PR1 — data layer**: domain interfaces, repository port, `GetPlants` + `GetPlant` use-cases with
  tests, HTTP repository, React Query hooks, i18n `plants` dict in `en`/`es`, and the parity test.
- **PR2 — presentation layer**: list + detail screens with skeletons and tests, the two Next.js
  pages, and the "Inventario" sidebar nav item.

PR2 depends on PR1 (presentation consumes the hooks/use-cases shipped in PR1).

---

## Risks

1. **Sparse detail page** — most detail content is "En desarrollo". Mitigated with clear, intentional
   placeholder UI so the page reads as "coming soon", not broken.
2. **Strict TDD overhead** — tests-first adds roughly 30–40% effort. Accepted; it is non-negotiable
   for this project and keeps the module regression-safe.
3. **`qr.image` is base64 PNG** — render it only on the detail page via
   `<img src="data:image/png;base64,..." />`; never load QR images in list cards (bandwidth).
4. **Line budget** — the full module with tests lands at 300–450+ lines, forcing the chained-PR split.
5. **Category filter tabs have no API backing** — rendered disabled/visual-only in v1; revisit when
   the API exposes category data.

---

## Affected Areas

- `src/core/plants/` — new module (all four layers).
- `src/shared/presentation/i18n/get-dictionary.ts` — add `plants` to `AppDict`.
- `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` — add "Inventario" item.
- `app/[lang]/(protected)/plants/page.tsx` — new (list).
- `app/[lang]/(protected)/plants/[id]/page.tsx` — new (detail).

---

## Next Phases

- `sdd-spec` — formal capability spec (requirements, scenarios) for list + detail.
- `sdd-design` — technical design (file tree, interfaces, data flow, test plan).

These two can run in parallel against this proposal.
