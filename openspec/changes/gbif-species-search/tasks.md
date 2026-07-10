# Tasks: gbif-species-search (web)

## Phase 1: Domain + application

- [x] 1.1 Update `domain/interfaces/plant.interface.ts`: trim `PlantSpecies`
      to `{ gbifKey: number | null; scientificName: string }` (drop `id`,
      `description`, `imageUrl`, `createdAt`, `updatedAt`). `Plant.plantSpeciesId`
      and `Plant.species` stay as-is (unchanged shape/nesting).
- [x] 1.2 Create `domain/interfaces/gbif-species-suggestion.interface.ts`:
      `GbifSpeciesSuggestion { gbifKey: number; scientificName: string }`.
- [x] 1.3 Update `application/interfaces/create-plant-input.interface.ts` and
      `update-plant-input.interface.ts`: replace `plantSpeciesId?` with
      `gbifSpeciesKey?: number | null`, `speciesScientificName?: string | null`.
- [x] 1.4 Update `application/ports/plants.repository.port.ts`: add
      `searchSpecies(name: string, limit?: number): Promise<GbifSpeciesSuggestion[]>`.
- [x] 1.5 Create `application/use-cases/search-species/search-species.use-case.ts`
      (`SearchSpeciesUseCase`, constructor takes `IPlantsRepository`) +
      `search-species.use-case.spec.ts` (RED then GREEN: happy path, empty
      result, propagates repository error).

## Phase 2: Infrastructure (GraphQL)

- [x] 2.1 Create `infrastructure/repositories/graphql/queries/gbif-species-search.query.ts`
      — gql document for `gbifSpeciesSearch(input: { name, limit })` matching
      the api's new query shape (`gbifKey`/`scientificName` per result).
- [x] 2.2 Update `queries/plant-find-by-id.query.ts` and
      `queries/plants-find-by-criteria.query.ts`: trim the existing nested
      `species { id scientificName description imageUrl createdAt updatedAt }`
      selection down to `species { gbifKey scientificName }` — keep the
      nesting, just drop the fields the api no longer returns.
- [x] 2.3 Update `mutations/create-plant.mutation.ts` and
      `mutations/update-plant.mutation.ts`: input field swap
      (`plantSpeciesId` → `gbifSpeciesKey`/`speciesScientificName`).
- [x] 2.4 Update `infrastructure/repositories/graphql/plants.gql.repository.ts`
      (+ spec, extend `plants.gql.repository.spec.ts`): implement
      `searchSpecies` (mock `apolloClient.query` per existing pattern); update
      `create`/`update`/`list`/`getById` mappings for the field swap.

## Phase 3: Presentation — search hook + combobox

- [x] 3.1 Create `presentation/hooks/use-species-search/useSpeciesSearch.hook.ts`
      + co-located spec: debounces raw query via the shared
      `useDebouncedValue(value, 300)`, calls `SearchSpeciesUseCase`, `enabled`
      guard for short queries, `retry: false`, exposes `data`/`isLoading`/`isError`.
- [x] 3.2 Create `presentation/components/species-combobox/species-combobox.tsx`
      (controlled `value`/`onChange` of `{ gbifKey, scientificName } |
      null`, built on `cmdk` `Command` primitives) + `.test.tsx` (RED then
      GREEN: renders results, selection fires `onChange`, loading/empty/error
      states) + `species-combobox.stories.tsx` (seed `useSpeciesSearch`'s
      TanStack Query cache via `queryClient.setQueryData`, per the mandatory
      hook-backed-component storybook convention — do not mock the hook).

## Phase 4: Wire into forms

- [x] 4.1 Update `presentation/schemas/create-plant.schema.ts` (and the edit
      schema, if separate): add optional
      `species: z.object({ gbifKey: z.number(), scientificName: z.string() }).nullable().optional()`
      (field names match the combobox/search-result shape — `gbifKey`, not
      `gbifSpeciesKey`).
- [x] 4.2 Update `presentation/hooks/use-create-plant-form/use-create-plant-form.hook.ts`:
      destructure `species` and map it to the mutation's flat input field
      names when calling `createPlant`: `gbifSpeciesKey: species?.gbifKey`,
      `speciesScientificName: species?.scientificName`.
- [x] 4.3 Update `presentation/hooks/use-edit-plant-form/use-edit-plant-form.hook.ts`:
      same mapping for `updatePlant`; pre-fill the combobox's initial value
      from the plant's current `species` (`{ gbifKey, scientificName }`)
      when opening the edit modal.
- [x] 4.4 Update `presentation/components/create-plant-modal/create-plant-modal.tsx`
      and `edit-plant-modal/edit-plant-modal.tsx`: wire `SpeciesCombobox` via
      `Controller` (React Hook Form) as the new `species` field, alongside the
      existing `name`/`imageUrl` inputs. Extend their `.test.tsx` files.

## Phase 5: Read-side updates

- [x] 5.1 Update `presentation/components/plant-card/plant-card.tsx` (+ test):
      confirm/fix it reads `plant.species?.scientificName` (not a stale
      `.name`), same fallback — field path itself is unchanged by this
      proposal.
- [x] 5.2 Update `presentation/screens/plant-detail/plant-detail.screen.tsx`
      (+ test): same field-path change.
- [x] 5.3 Grep the repo for any other `.species` / `plantSpeciesId` reference
      in `gardenia-web` (e.g. `planting-spot-plant` type if the web mirrors
      it) and update.

## Phase 6: i18n

- [x] 6.1 Add `plants.speciesSearch.{label,placeholder,noResults,unavailable}`
      to `presentation/i18n/en.ts` and `es.ts` (Castellano de España, tuteo,
      no voseo/latinoamericanismos).
- [x] 6.2 Confirm `i18n-parity.test.ts` (existing, `plants` module) passes
      with the new keys.

## Phase 7: Verification

- [x] 7.1 `pnpm lint` clean.
- [x] 7.2 `pnpm tsc --noEmit` clean.
- [x] 7.3 `pnpm test` — full unit suite green, including all new/updated specs
      above.
- [x] 7.4 `pnpm test:coverage` — confirm no regression.
- [x] 7.5 Confirm Storybook builds (`species-combobox.stories.tsx` renders).
- [ ] 7.6 Manual smoke check against a running api (once the paired api
      change is deployed to a reachable environment): create a plant with a
      searched species, edit it to change the species, confirm plant
      card/detail render the chosen name. NOT RUN in this environment — no
      reachable api deployment to smoke-test against.

## Sequencing note

Phases 1–2 (domain/application/infrastructure field rename) should not be
merged ahead of the paired `gardenia-api` `gbif-species-search` change
reaching an environment this app points at — see proposal.md's Rollback
section. Phases 3–6 (new search UI) have no hard dependency on the schema
rename and could theoretically ship independently, but splitting them
further is not recommended: the combobox is useless without somewhere to
plug its output into, and the field rename is meaningless without the UI to
set it.
