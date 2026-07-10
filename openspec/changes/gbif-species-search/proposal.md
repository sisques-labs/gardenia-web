# Proposal: gbif-species-search

**Issue**: GDN-35 — https://sisqueslabs.atlassian.net/browse/GDN-35

## Intent

GDN-35 wants the user to be able to search for a plant species by name and get
live GBIF results while typing, then attach the chosen species to a plant —
with nothing GBIF returns ever persisted locally. Today there is **no species
selection UI at all**: `CreatePlantModal`/`EditPlantModal` only collect `name`
and `imageUrl`; `plantSpeciesId`/`species` are plumbed through the domain and
GraphQL layer for read-only display (plant card/detail render `species.name`
or a "no species" fallback) but nothing ever writes them. This is greenfield
on the web side.

This proposal is paired with an already-drafted `gardenia-api` change (same
change name, `gbif-species-search`) that **keeps** the local `plant-species`
catalog and `Plant.plantSpeciesId` FK (revised from an earlier draft that
deleted them — see that proposal's own revision note), but trims the catalog
to just `scientificName` + `gbifKey`, and adds a new
`gbifSpeciesSearch(input: { name, limit })` GraphQL query that proxies GBIF's
`/species/suggest` endpoint live, with zero persistence anywhere. Creating or
updating a plant now accepts `gbifSpeciesKey` + `speciesScientificName`
(what a live search pick gives you) instead of a raw `plantSpeciesId`; the
api resolves that pair to a catalog id internally (find-or-create). The
**read side is unaffected in shape**: `Plant.species` stays a nested resolved
object exactly as it is today, just trimmed to `{ gbifKey, scientificName }`
(no more `description`/`imageUrl`).

**Sequencing dependency**: this web change consumes the api change's new
query and its updated `Plant` shape. It should not be merged/deployed ahead of
the api change (see Rollback below for how to keep both revertable
independently in the meantime).

## Scope

- `gardenia-web`, `plants` bounded context — domain, application,
  infrastructure, and presentation layers, plus one new shared UI primitive.
- `domain/interfaces/plant.interface.ts`: `PlantSpecies` interface trimmed to
  `{ gbifKey: number | null; scientificName: string }` (drop `id`,
  `description`, `imageUrl`, `createdAt`, `updatedAt` — nothing else reads
  them). `Plant.plantSpeciesId`/`Plant.species` **stay as-is** (still a
  nested, optional, read-only resolved field — unchanged shape, just a
  trimmed `PlantSpecies`).
- `application/interfaces/create-plant-input.interface.ts` /
  `update-plant-input.interface.ts`: replace `plantSpeciesId?: string` with
  `gbifSpeciesKey?: number`, `speciesScientificName?: string` (paired) — this
  is the one real write-side change, since the client only ever has a live
  search pick, never a local catalog id.
- New use case `SearchSpeciesUseCase` (`application/use-cases/search-species/`)
  + port method `IPlantsRepository.searchSpecies(name, limit?)`.
- `infrastructure/repositories/graphql/plants.gql.repository.ts`: implement
  `searchSpecies`; add `queries/gbif-species-search.query.ts`; update
  `queries/plant-find-by-id.query.ts` and
  `queries/plants-find-by-criteria.query.ts`'s existing `species { ... }`
  selection to the trimmed field set (`gbifKey`, `scientificName` — drop
  `description`/`imageUrl`); update `mutations/create-plant.mutation.ts` /
  `mutations/update-plant.mutation.ts` inputs (`plantSpeciesId` →
  `gbifSpeciesKey`/`speciesScientificName`).
- New hook `presentation/hooks/use-species-search/useSpeciesSearch.hook.ts`
  (TanStack Query, debounced per the mandatory `useDebouncedValue` rule).
- New presentation component `SpeciesCombobox`
  (`presentation/components/species-combobox/`) wired into
  `CreatePlantModal`/`EditPlantModal` via their existing `use-create-plant-form`
  / `use-edit-plant-form` hooks and `create-plant.schema.ts` /
  `edit-plant.schema.ts`.
- Update `PlantCard` / `plant-detail.screen.tsx` (and any other place reading
  `plant.species?.name` or `plant.species?.scientificName`) to read
  `plant.species?.scientificName` — same "no species" fallback UX, no
  structural change (this was already the field name post-enrichment; verify
  at apply time whether the current code still says `.name` as tech debt and
  fix it while here).
- i18n: new `plants.speciesSearch.*` keys (`en`/`es`) — label, placeholder,
  no-results text, "search unavailable" text (AC4).

## Out of Scope

- Any `gardenia-api` change — covered by the paired api proposal.
- A standalone species catalog/management screen — none exists or is
  planned; the combobox is scoped to the create/edit plant modals only
  (confirmed).
- Calling GBIF directly from the browser — the web app only ever calls our
  own API's `gbifSpeciesSearch` query.
- Persisting or caching search results beyond TanStack Query's normal
  in-memory query cache for the current session (this is not "local storage"
  in the AC2 sense — it's the standard, transient, per-tab query cache every
  other TanStack Query call in this app already uses; nothing is written to
  Zustand, `localStorage`, or any persistent store).
- Extending the generic shared `Combobox`
  (`shared/presentation/components/ui/combobox/combobox.tsx`) to support
  async/remote options — see Design for why a separate component is used
  instead.

## Rollback

Mostly additive (new fields, new use case, new query/hook/component). The
one real coupling to the api change is the **write side**: the create/update
plant mutation inputs move from `plantSpeciesId` to
`gbifSpeciesKey`/`speciesScientificName`. Rollback plan:

- If the api change has NOT shipped yet: do not merge this change's Phase 2
  (mutation input field swap) ahead of it — the api wouldn't recognize the
  new input field names yet. The read-side trim (`PlantSpecies` interface,
  query selection sets) is low-risk either way since it only drops fields
  (`description`/`imageUrl`) the UI never rendered from GBIF-sourced data in
  the first place.
- If the api change HAS shipped: reverting this PR removes the combobox/use
  case/hook and reverts the mutation input field names back to
  `plantSpeciesId` — which the api would then reject post-its-own-change, so
  a full rollback requires reverting both changes together (same dependency
  as before, just scoped to the write path now instead of the whole `Plant`
  read shape).
- No backend/API call in this change is destructive; nothing here risks data
  loss on the web side.
