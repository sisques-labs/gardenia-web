# Proposal: add-planting-spots

## Intent

### Problem

`gardenia-api` exposes a full `planting-spots` bounded context with CRUD via GraphQL
(`plantingSpotsFindByCriteria`, `plantingSpotFindById`, `plantingSpotCreate`,
`plantingSpotUpdate`, `plantingSpotDelete`), but `gardenia-web` has no UI for it at all.
A **planting spot** represents a physical container or area within a space where plants
grow (raised bed, pot, container, field section, or other). Without this screen users
cannot organise their space into named spots nor track which spot a plant belongs to.

### Why now

Planting spots are the missing structural layer between a *space* and a *plant*.
The infrastructure is ready on both sides: the API exposes GraphQL resolvers,
the web already uses Apollo Client + TanStack Query + the DDD/Hexagonal pattern
proven in `harvests` (full CRUD) and `plants` (read + create). There is no
architectural blocker — only the absence of the module itself.

### Success looks like

- A user lands on `/[lang]/planting-spots` and sees a list of their space's planting
  spots (name, type badge, optional description).
- A **"New planting spot"** button opens `/[lang]/planting-spots/new` with a form
  (`name`, `type` select, optional `description`).
- Clicking a spot card opens `/[lang]/planting-spots/[id]/edit` where the user can
  update the spot's fields or delete it with a confirmation.
- All screens follow the exact DDD + Hexagonal pattern of `src/core/harvests/`.
- Strict TDD: every use-case, repository, hook, screen, and i18n parity test is
  written test-first.

---

## Scope (v1 — this change)

### In scope

- **List page** (`/[lang]/planting-spots`): table/card list of spots. Each entry shows
  name, a type badge (raised bed, pot, container, field section, other), and description.
- **New page** (`/[lang]/planting-spots/new`): `PlantingSpotFormScreen` in create mode.
  Form fields: `name` (text), `type` (select), `description` (optional textarea).
- **Edit page** (`/[lang]/planting-spots/[id]/edit`): same form screen in edit mode,
  pre-filled. Delete button with inline confirmation.
- **Full DDD module** at `src/core/planting-spots/` across all four layers:
  `domain → application → infrastructure → presentation`.
- **Use-cases**: `GetPlantingSpots`, `GetPlantingSpot`, `CreatePlantingSpot`,
  `UpdatePlantingSpot`, `DeletePlantingSpot`.
- **GQL repository** (`planting-spots.gql.repository.ts`) using Apollo Client — matching
  the `harvests` pattern (the current standard, not HTTP).
- **React Query hooks** for all five use-cases.
- **Zod schema** for the create/edit form.
- **i18n**: `en.ts` + `es.ts` + `i18n-parity.test.ts` for the `planting-spots` key.
- **`get-dictionary.ts`** registration (add `plantingSpots` to `AppDict`).
- **Sidebar nav**: add a "Planting spots" item pointing to `/[lang]/planting-spots`.
- **Strict TDD**: every file has a co-located `.spec.ts` / `.test.tsx` written first.

### Out of scope (follow-up)

- Linking a `Plant` to a `PlantingSpot` (requires updating the plants module).
- Filtering the list by type.
- Detail-only view (edit page covers the detail need in v1).
- Pagination controls (API returns paginated; v1 fetches first page).

---

## Approach

### Option A — Full DDD layers mirroring `src/core/harvests/` (selected)

The only acceptable option given the project's conventions. `harvests` is the nearest
analogue: it has full CRUD (create, update, delete, list, detail) via GraphQL.

1. `domain/interfaces/planting-spot.interface.ts` — `PlantingSpot`, `PlantingSpotType`.
2. `application/interfaces/` — `CreatePlantingSpotInput`, `UpdatePlantingSpotInput`.
3. `application/ports/planting-spots.repository.port.ts` — `IPlantingSpotsRepository`.
4. `application/use-cases/` — five use-case classes (no store writes; TanStack Query owns cache).
5. `infrastructure/repositories/graphql/` — GQL documents + `PlantingSpotsGqlRepository`.
6. `presentation/hooks/` — TanStack Query wrappers.
7. `presentation/schemas/planting-spot.schema.ts` — Zod schema for the form.
8. `presentation/screens/` — list + form screens (`'use client'`, React Hook Form + Zod).
9. `presentation/components/` — `PlantingSpotCard`, `PlantingSpotTypeBadge`.
10. `presentation/i18n/en.ts` + `es.ts` + `i18n-parity.test.ts`.
11. Async Server Component pages + shared dictionary registration + sidebar nav entry.

**Rationale**: consistency, testability, no new architectural precedent.
The shared Apollo Client already injects `X-Space-ID` per request via the Zustand store
(same as `harvests`) — no bespoke wiring needed.

### Rejected alternatives

- **Skip use-cases (thin layer)**: breaks Hexagonal boundary and sets bad precedent.
- **REST repository**: `harvests` migrated to GQL; starting with REST would require an
  immediate migration. GQL is the current standard per `openspec/config.yaml`.

---

## Delivery

Two chained PRs, each under 400 lines:

- **PR1 — data layer**: domain, application (5 use-cases + specs), infrastructure (GQL
  repo + documents + specs), i18n dict + parity test, `get-dictionary.ts` registration.
- **PR2 — presentation layer**: Zod schema, components, hooks, list + form screens + tests,
  Next.js pages (list / new / edit), sidebar nav entry.

PR2 depends on PR1 (screens consume PR1 hooks/dict/types).

---

## Risks

1. **Paginated response shape** — `plantingSpotsFindByCriteria` returns
   `{ items: PlantingSpotResponseDto[] }` (confirmed from API DTO). `list()` maps
   `res.data.plantingSpotsFindByCriteria.items`. If the API ever sends no items the
   repository returns `[]`.
2. **PlantingSpotType as union literal** — the API uses a TypeScript enum internally but
   the GraphQL schema exposes the raw string values. The web uses a plain union type
   (`'raised_bed' | 'pot' | 'container' | 'field_section' | 'other'`) — no runtime enum.
3. **Strict TDD overhead** — tests-first adds ~30–40 % effort; accepted as non-negotiable.
4. **Line budget** — full CRUD with five use-cases + tests will exceed 400 lines; the
   chained-PR split is mandatory.

---

## Affected Areas

- `src/core/planting-spots/` — new module (all four layers).
- `src/shared/presentation/i18n/get-dictionary.ts` — add `plantingSpots` to `AppDict`.
- `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` — new nav item.
- `app/[lang]/(protected)/planting-spots/page.tsx` — list page.
- `app/[lang]/(protected)/planting-spots/new/page.tsx` — new form page.
- `app/[lang]/(protected)/planting-spots/[id]/edit/page.tsx` — edit form page.
