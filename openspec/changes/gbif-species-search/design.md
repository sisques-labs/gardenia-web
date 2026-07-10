# Design: gbif-species-search (web)

## 1. Layer map

```
domain/
  interfaces/plant.interface.ts          — Plant.plantSpeciesId / species UNCHANGED in shape;
                                            PlantSpecies trimmed to { gbifKey, scientificName }
  interfaces/gbif-species-suggestion.interface.ts   — NEW: { gbifKey: number; scientificName: string }

application/
  interfaces/create-plant-input.interface.ts        — field swap
  interfaces/update-plant-input.interface.ts         — field swap
  ports/plants.repository.port.ts                    — + searchSpecies(name, limit?)
  use-cases/search-species/search-species.use-case.ts  — NEW: SearchSpeciesUseCase

infrastructure/
  repositories/graphql/queries/gbif-species-search.query.ts   — NEW gql query doc
  repositories/graphql/queries/plant-find-by-id.query.ts       — trim `species{...}` selection
  repositories/graphql/queries/plants-find-by-criteria.query.ts — same
  repositories/graphql/mutations/create-plant.mutation.ts       — input field swap (write side only)
  repositories/graphql/mutations/update-plant.mutation.ts       — input field swap (write side only)
  repositories/graphql/plants.gql.repository.ts                 — implement searchSpecies

presentation/
  hooks/use-species-search/useSpeciesSearch.hook.ts   — NEW: debounced TanStack Query wrapper
  components/species-combobox/species-combobox.tsx   — NEW
  components/species-combobox/species-combobox.stories.tsx — NEW (mandatory per storybook rule)
  components/create-plant-modal/create-plant-modal.tsx      — + SpeciesCombobox field
  components/edit-plant-modal/edit-plant-modal.tsx           — + SpeciesCombobox field
  hooks/use-create-plant-form/use-create-plant-form.hook.ts  — pass through 2 new fields
  hooks/use-edit-plant-form/use-edit-plant-form.hook.ts       — pass through 2 new fields
  schemas/create-plant.schema.ts                              — + 2 optional fields, paired refine
  schemas/edit-plant.schema.ts (or shared schema if identical) — same
  components/plant-card/plant-card.tsx                        — read species?.scientificName (trimmed shape, same nesting)
  screens/plant-detail/plant-detail.screen.tsx                — read species?.scientificName (trimmed shape, same nesting)
  i18n/en.ts, i18n/es.ts                                        — plants.speciesSearch.*
```

Cross-layer rules respected: domain interfaces stay framework-free;
`SearchSpeciesUseCase` (application) depends only on `IPlantsRepository`
(port); `useSpeciesSearch` (presentation) is the only layer that touches
TanStack Query, and it calls the use case, not the repository directly —
matching the existing `use-plant`/`use-plants` hook pattern (verify at apply
time whether existing hooks call the use case or the repository directly;
follow whichever the codebase actually does today for consistency).

## 2. ADR-001 — `SpeciesCombobox` is a new, plants-specific component, not an extension of the shared `Combobox`

**Decision**: build `SpeciesCombobox` inside
`src/core/plants/presentation/components/species-combobox/`, not as a new mode
of `src/shared/presentation/components/ui/combobox/combobox.tsx`.

**Context**: the existing `Combobox` is a pure, synchronous, client-filtered
primitive — it takes a static `options: ComboboxOption[]` array and filters
it in-memory (`shouldFilter={false}` + manual `.includes()`). Making it
support async/remote/debounced options would change its contract for its
existing (unknown, possibly-other) callers and mixes "generic UI shell" with
"fetch + debounce" concerns.

**Decision rationale**:
- YAGNI: there is exactly one current caller needing async search
  (species). Generalizing the shared primitive now is speculative; extract a
  shared `AsyncCombobox` later if a second real use case appears.
- Keeps the fetch+debounce logic where the "mixes responsibilities" rule
  says it belongs: a dedicated component backed by its own hook
  (`useSpeciesSearch`), same shape as every other feature component in this
  codebase (fetch/business logic delegated to a hook, component stays about
  presentation + wiring).
- `SpeciesCombobox` reuses the `cmdk` `Command`/`Command.Input`/`Command.List`/
  `Command.Item` primitives directly (same building blocks `Combobox` uses)
  rather than duplicating unrelated UI chrome — only the data-source model
  differs (remote+debounced vs. static+sync).

**Rejected alternative**: add an `async`/`onSearch` prop to the shared
`Combobox`. Rejected for now — would require every existing (and any future)
static caller to reason about a debounce/loading branch it never needs.

## 3. `useSpeciesSearch` hook — debounce contract

Per this repo's mandatory rule ("any text search input whose value drives a
network query MUST debounce the derived value... using the shared
`useDebouncedValue(value, delayMs = 300)` hook"):

```ts
function useSpeciesSearch(rawQuery: string) {
  const debouncedQuery = useDebouncedValue(rawQuery, 300);

  return useQuery({
    queryKey: ['species-search', debouncedQuery],
    queryFn: () => searchSpeciesUseCase.execute({ name: debouncedQuery, limit: 10 }),
    enabled: debouncedQuery.trim().length >= 2, // avoid firing on 0-1 char input
    retry: false, // AC4: a transient GBIF failure should surface as "no results", not retry storms
  });
}
```

`SpeciesCombobox` owns `rawQuery` as local `useState` (updates immediately,
so typing feels responsive — the debounce only delays the network call, per
the existing convention used for filter inputs elsewhere in this app) and
passes it into the hook. `isError` renders the `plants.speciesSearch.unavailable`
copy (AC4: no crash, reasonable degradation) instead of throwing or leaving
the combobox in a stuck loading state.

**Deviation note**: the existing mandated pattern names the debounce
consumer `use{Context}Filters` (a list-filtering hook). This is a
search-**selection** hook, not a filters hook — the same debounce discipline
applies (raw state updates immediately, debounced value drives the query) but
it's intentionally not named/shaped as a filters hook, since it drives a
combobox's options, not a list's `criteria`. Called out explicitly so this
isn't read as a missed-convention deviation.

## 4. ADR-002 — form wiring: `Controller`, not `register`; `gbifKey` (form) vs. `gbifSpeciesKey` (mutation input)

**Decision**: the species field is wired into `CreatePlantModal`/
`EditPlantModal`'s React Hook Form via `Controller`, not `register` (which
the existing `name`/`imageUrl` plain `<Input>` fields use). The form value
uses `{ gbifKey, scientificName }` (matching the combobox/search-result
shape and the api's own resolved-`species`-object field names); the
`useCreatePlantForm`/`useEditPlantForm` hooks translate that into the flat
`gbifSpeciesKey`/`speciesScientificName` names the `createPlant`/`updatePlant`
mutations actually expect (the api's command *input* uses different, flat
field names from its *output* `species` object — see the paired api change's
design.md §6.3).

**Context**: `SpeciesCombobox` is a controlled component (`value`/`onChange`
of a compound `{ gbifKey, scientificName }` selection, not a single string),
so it can't be spread with `{...register('field')}` like a plain input.

```tsx
<Controller
  name="species" // a single form field holding { gbifKey, scientificName } | null
  control={control}
  render={({ field }) => (
    <SpeciesCombobox
      value={field.value}
      onChange={field.onChange}
      placeholder={dict.speciesSearch.placeholder}
    />
  )}
/>
```

```ts
// inside useCreatePlantForm's onSubmit
createPlant({
  name,
  imageUrl,
  gbifSpeciesKey: species?.gbifKey,
  speciesScientificName: species?.scientificName,
});
```

`createPlantSchema`/the edit equivalent model this as a single optional
`species: z.object({ gbifKey: z.number(), scientificName: z.string() }).nullable().optional()`
field (nullable = explicitly cleared, undefined = untouched); the
translation to the mutation's flat field names happens once, at the form
hook's submit boundary — the rest of the presentation layer (combobox, form
state, pre-fill from a read `Plant.species`) only ever deals with the
`{ gbifKey, scientificName }` shape, never the mutation-specific flat names.

## 5. Read-side: `PlantCard` / plant detail

**Decision**: unchanged nesting — both continue to read
`plant.species?.scientificName` (the api still resolves `species` as a
nested object on `Plant`; only its field set shrinks). Same fallback UX
(`dict.unknownSpecies` / "no species" placeholder) when `species` is
`null`/`undefined`. `plant-find-by-id.query.ts` and
`plants-find-by-criteria.query.ts` trim their existing `species { id
scientificName description imageUrl createdAt updatedAt }` selection down to
`species { gbifKey scientificName }` — `description`/`imageUrl`/`id`/
timestamps are dropped because the api's `plant-species` catalog no longer
carries them (see the paired api change), not because the resolved-field
mechanism itself changed.

This is a smaller, lower-risk change than the flat-field version originally
drafted: no `Plant` field renames, no `PlantCard`/detail component logic
changes beyond the query's selection set — verify at apply time whether the
current code actually reads `.name` (stale, pre-enrichment) or already reads
`.scientificName`; fix it to `.scientificName` while touching this file
either way.

## 6. i18n additions

`plants.speciesSearch`: `label`, `placeholder`, `noResults`, `unavailable`
(AC4 degraded-state copy). Both `en.ts`/`es.ts`, covered by the existing
`i18n-parity.test.ts` for the `plants` module — no new test file needed, just
new keys in the existing dictionaries (parity test already asserts key-set
equality, it will fail if only one locale gets the new keys, which is exactly
the safety net wanted here).

## 7. Testing plan (Strict TDD)

- `search-species.use-case.spec.ts` — mocked port, happy path + empty result.
- `plants.gql.repository.spec.ts` (extend) — `searchSpecies` mocks
  `apolloClient.query` directly (existing pattern), asserts the gql document
  and variable shape, and maps the response.
- `useSpeciesSearch.hook.spec.ts` (or co-located `.test.tsx`) — debounce
  behavior (fake timers: rapid input changes → one query fire after 300ms
  settle), error state renders as empty/unavailable not a thrown error.
- `species-combobox.test.tsx` — renders options, selection calls `onChange`
  with `{ gbifSpeciesKey, scientificName }`, loading/empty/error states.
- `species-combobox.stories.tsx` — mandatory per storybook rule; since this
  component calls `useSpeciesSearch` (TanStack Query) internally, seed via
  `queryClient.setQueryData(['species-search', <query>], fixtureData)` in a
  decorator per the existing hook-backed-component storybook convention —
  do NOT mock the hook module.
- `create-plant-modal.test.tsx` / `edit-plant-modal.test.tsx` (extend) —
  selecting a species and submitting sends `gbifSpeciesKey`/
  `speciesScientificName` in the mutation call.
- `plant-card.test.tsx` / plant-detail screen tests (extend) — render with
  `species` set (`{ gbifKey, scientificName }`) and `species` unset/null,
  assert fallback text.
- `i18n-parity.test.ts` (existing, `plants` module) — passes with new keys
  added to both locales.

## 8. Risks

1. **Sequencing with the api change** — this change's mutation-input field
   rename (`plantSpeciesId` → `gbifSpeciesKey`/`speciesScientificName`) only
   makes sense once the api ships its own `gbif-species-search` change. The
   read-side query trim is lower-risk (only drops unused fields). See
   proposal's Rollback section.
2. **GBIF result volume** — `useSpeciesSearch`'s `limit: 10` and the 300ms
   debounce keep both request volume and combobox list length small; no
   further pagination is implemented (matches AC scope — this is autocomplete,
   not a browsable catalog).
3. **`enabled: debouncedQuery.trim().length >= 2`** — an arbitrary but
   reasonable floor to avoid a network call on a single keystroke; adjust at
   implementation time if UX testing suggests otherwise.
