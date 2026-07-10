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
change name, `gbif-species-search`) that deletes the local `plant-species`
catalog and its `Plant.plantSpeciesId` FK entirely, replacing them with two
plain fields owned by `Plant`: `gbifSpeciesKey` (GBIF's numeric `usageKey`)
and `speciesScientificName` (the name as chosen by the user). It also adds a
new `gbifSpeciesSearch(input: { name, limit })` GraphQL query that proxies
GBIF's `/species/suggest` endpoint live, with zero persistence anywhere.

**Sequencing dependency**: this web change consumes the api change's new
query and its updated `Plant` shape. It should not be merged/deployed ahead of
the api change (see Rollback below for how to keep both revertable
independently in the meantime).

## Scope

- `gardenia-web`, `plants` bounded context — domain, application,
  infrastructure, and presentation layers, plus one new shared UI primitive.
- `domain/interfaces/plant.interface.ts`: drop `plantSpeciesId`/`species`
  (and the now-unused `PlantSpecies` interface); add `gbifSpeciesKey: number
  | null`, `speciesScientificName: string | null`.
- `application/interfaces/create-plant-input.interface.ts` /
  `update-plant-input.interface.ts`: same field swap.
- New use case `SearchSpeciesUseCase` (`application/use-cases/search-species/`)
  + port method `IPlantsRepository.searchSpecies(name, limit?)`.
- `infrastructure/repositories/graphql/plants.gql.repository.ts`: implement
  `searchSpecies`; add `queries/gbif-species-search.query.ts`; update
  `queries/plant-find-by-id.query.ts` and
  `queries/plants-find-by-criteria.query.ts` to fetch `gbifSpeciesKey`/
  `speciesScientificName` instead of the nested `species { ... }` selection;
  update `mutations/create-plant.mutation.ts` /
  `mutations/update-plant.mutation.ts` inputs.
- New hook `presentation/hooks/use-species-search/useSpeciesSearch.hook.ts`
  (TanStack Query, debounced per the mandatory `useDebouncedValue` rule).
- New presentation component `SpeciesCombobox`
  (`presentation/components/species-combobox/`) wired into
  `CreatePlantModal`/`EditPlantModal` via their existing `use-create-plant-form`
  / `use-edit-plant-form` hooks and `create-plant.schema.ts` /
  `edit-plant.schema.ts`.
- Update `PlantCard` / `plant-detail.screen.tsx` (and any other place reading
  `plant.species?.name`) to read `plant.speciesScientificName` directly, same
  "no species" fallback UX.
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

Additive on the domain/application/infrastructure side (new fields, new use
case, new query/hook/component) plus one breaking field rename
(`plantSpeciesId`/`species` → `gbifSpeciesKey`/`speciesScientificName`) that
is coupled to the api change. Rollback plan:

- If the api change has NOT shipped yet: do not merge this change. The field
  rename in `plant.interface.ts` would break `PlantCard`/detail rendering
  against the current (pre-change) api schema.
- If the api change HAS shipped: reverting this PR removes the combobox/use
  case/hook and reverts the field rename; since the api no longer serves
  `plantSpeciesId`/`species` after its own change ships, reverting this PR
  without also reverting the api change would leave the web app unable to
  read species at all (fields would be `undefined`) — acceptable degraded
  state (falls back to "no species" UI) but not a full rollback. True
  rollback requires reverting both changes together.
- No backend/API call in this change is destructive; nothing here risks data
  loss on the web side.
