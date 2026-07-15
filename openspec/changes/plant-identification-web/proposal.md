# Proposal: plant-identification-web

## Intent

### Problem

`gardenia-api` gains a new `plant-identification` bounded context (paired
change in `gardenia-api`'s `openspec/changes/plant-identification/`): a user
can submit one or more photos of a plant they don't recognize, get back a
PlantNet-powered species guess resolved against the existing GBIF catalog,
and — if confident — turn that guess straight into a tracked `Plant`. Today
`gardenia-web` has no way to reach any of this: the only species-aware UI is
`SpeciesCombobox` inside `CreatePlantModal`/`EditPlantModal`, which requires
the user to already know (and type) the plant's name.

### Why now

The api's paired change is proposed alongside this one and exposes:
`POST /api/plant-identifications` (multipart), `plantIdentifications`/
`plantIdentification` GraphQL queries, and a `createPlantFromIdentification`
GraphQL mutation returning `{ id }` (`CreatedEntity` shape — matches this
repo's existing "don't re-fetch, use the ack" convention, already used by
`plants`' own `createPlant`).

### Success looks like

- From the plants list, a user can open "Identificar planta" and submit
  1..N photos, each tagged with which part of the plant it shows (hoja,
  flor, fruto, corteza, planta entera, otro).
- After submitting, they see the identification result: either a resolved
  species (name + confidence) with a "Crear planta con esta especie" CTA, or
  a "no reconocida con confianza" state that still shows whatever candidates
  PlantNet found, without a create CTA.
- Confirming the CTA asks only for a name (species, and the first submitted
  photo as the initial image, are already known) and creates a real,
  tracked `Plant` — landing the user on its detail page.
- A short "identificaciones recientes" list on the same screen shows past
  attempts for the active space (thumbnail, resolved species or "no
  reconocida", date, and a link to the resulting plant if one was created).

---

## Scope (v1 — this change)

### In scope

- **Domain**: interfaces `PlantIdentification`, `PlantIdentificationPhoto`
  (`fileId, url, organ`), `PlantIdentificationCandidate` (`scientificName,
  commonNames, score`), organ union type
  (`'leaf' | 'flower' | 'fruit' | 'bark' | 'habit' | 'other'`).
- **Application**: `IdentifyPlantUseCase` (multipart upload, thin wrapper),
  `GetPlantIdentificationsUseCase` (paginated history), `CreatePlantFrom
  IdentificationUseCase`.
- **Infrastructure**:
  - `PlantIdentificationsHttpRepository` (axios, multipart) for the
    `identify` call only — mirrors `plant-photos`' own REST-only upload
    precedent, since the api doesn't expose binary upload over GraphQL.
  - `PlantIdentificationsGqlRepository` (Apollo) for history queries and the
    `createPlantFromIdentification` mutation.
  - Two repositories behind one port each (`IPlantIdentificationsRepository`
    split isn't needed — see design.md ADR-002 for why one port with mixed
    transports underneath is acceptable here, same reasoning `plant-photos`
    would have used had it needed a non-upload operation).
- **Presentation**:
  - `useIdentifyPlant()`, `usePlantIdentifications(spaceId)`,
    `useCreatePlantFromIdentification()` (TanStack Query hooks).
  - `identify-plant.screen.tsx` — photo picker (multi-file, per-photo organ
    select), submit, result panel (resolved species + confidence bars over
    all candidates, or no-match state), "Crear planta con esta especie" CTA
    opening `create-plant-from-identification-modal.tsx` (name only — RHF +
    Zod), recent-identifications list section.
  - New route `app/[lang]/(protected)/plants/identify/page.tsx`.
  - Entry point: "Identificar planta" button on `plants-list.screen.tsx`,
    next to the existing "Crear planta" action.
  - i18n module `plant-identification` (`en.ts`/`es.ts` +
    `i18n-parity.test.ts`), registered in `get-dictionary.ts`.
  - Storybook stories for every new component/screen per this repo's
    mandatory-storybook rule (seeding TanStack Query cache with fixture
    data, not mocking the hook modules).

### Out of scope (deferred, matches the api proposal's own deferred list)

- Manual override / picking a non-top candidate when the identification
  came back `no_match` (no UI for it since the api doesn't support it yet).
- A dedicated full-page/table history view (`inventory-table-redesign`-style)
  — v1 ships an inline recent-list section on the identify screen only.
- Deleting an identification from history.
- Any change to `dashboard-home`'s placeholder sections (that change is
  in-flight separately; this proposal deliberately does not touch it —
  wiring an "Identify" entry point into the future dashboard is a natural
  follow-up once both land).
- Touching `CreatePlantModal`/`SpeciesCombobox` — this proposal's create
  flow is a separate, smaller modal (species already known), not a reuse of
  the general create-plant form.

---

## Approach

New bounded context `src/core/plant-identification/`, following the same
DDD + Hexagonal pattern already established by `plant-photos` (dual
transport: REST for the multipart operation, GraphQL for everything else).
Presentation connects to `plants-list.screen.tsx` via a route link (new
page, not an inline component), and to a new plant's detail page via
`next/navigation` redirect after a successful conversion — same shape
`CreatePlantModal`'s own success path already uses.
