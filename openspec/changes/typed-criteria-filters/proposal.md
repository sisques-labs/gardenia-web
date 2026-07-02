# Proposal: Wire the Plants List Filters to Typed Criteria

## Intent

`plants-list.screen.tsx` already has a "Filters" button and a row of category
tabs — both rendered `disabled`, wired to nothing. `usePlants(spaceId)` fetches
every plant for the space with `plantsFindByCriteria()` (no `input` at all)
and does client-side pagination only. Meanwhile `gardenia-api` is introducing
(companion change `typed-criteria-filters` in that repo) a type-safe version
of the shared `Criteria` filter pattern: per-context GraphQL enum for `field`,
validated `value`, and a working `where` translation in the read repository.

This change enables the existing (currently disabled) filter UI by building
real `filters`/`sorts` arrays against that new, validated shape — replacing
client-side-only filtering with server-side `plantsFindByCriteria(input)`
calls — instead of inventing a parallel, hand-rolled filter representation
like the one already living in `inventory-filters.tsx`
(`INVENTORY_ITEM_TYPES`, a plain string array disconnected from any backend
enum). The field names sent from the client must match the API's
`PlantQueryableFieldEnum` values (`name`, `plantSpeciesId`, `plantingSpotId`,
`createdAt`, `updatedAt`) — mirrored here as a local TypeScript enum so a typo
fails at compile time, not as a 400 from the API.

## Scope

### In Scope

- `PlantsFindByCriteriaRequestDto`-equivalent input added to
  `PLANTS_FIND_BY_CRITERIA` (the `gql` query file): accept `filters` and
  `sorts` variables.
- `PlantsGqlRepository.findByCriteria` (or the existing method backing
  `usePlants`) forwards `filters`/`sorts` to the query instead of calling it
  with no arguments.
- `domain/enums/plant-queryable-field.enum.ts`: local mirror of the API's
  `PlantQueryableFieldEnum` (`NAME`, `PLANT_SPECIES_ID`, `PLANTING_SPOT_ID`,
  `CREATED_AT`, `UPDATED_AT`) — used to build filter/sort objects, not
  duplicated as ad hoc strings.
- `presentation/hooks/use-plant-filters/`: local `useState`-based filter state
  (search text → `LIKE` on `NAME`; species select → `EQUALS` on
  `PLANT_SPECIES_ID`), following the "state local to one screen" rule — no
  Zustand, this isn't shared across unrelated screens.
- Enable the currently-disabled "Filters" button in `plants-list.screen.tsx`
  to open a small filter form (search input + species select), and enable the
  species-based category tabs if species data is available client-side
  (`speciesCount`/species list already fetched via plant records).
- Switch pagination from `useUrlPagination` client-side slicing to real
  server-side pagination (the `pagination` field already exists on
  `BaseFindByCriteriaInput` and is simply unused today).
- Tests: `plants.gql.repository.spec.ts` (mock `apolloClient`, assert
  `filters`/`sorts`/`pagination` variables are sent correctly),
  `use-plant-filters.hook.spec.ts`, updated `plants-list.screen.spec.tsx`.

### Out of Scope (explicit)

- Any enum-valued dropdown filter (e.g. a future plant status) — `plants` has
  no enum field on the API side yet; this change only covers `name` (text) and
  `plantSpeciesId`/`plantingSpotId` (id-based) filters.
- Reworking `inventory-filters.tsx` to stop duplicating
  `INVENTORY_ITEM_TYPES` — same root problem, separate follow-up once this
  pattern is proven on `plants`.
- Any change to `gardenia-api` itself — this change only *consumes* the new
  `plantsFindByCriteria(input)` shape once the companion API change ships;
  it is blocked on that change merging first.
- Planting-spot filter UI (`plantingSpotId`) — the field enum includes it for
  parity with the API, but no spot-picker UI exists yet; deferred.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| This change is blocked on the `gardenia-api` companion change; if that lands with a different field-enum shape, the client mirror drifts | Med | Med | Land API change first; treat the web enum as a manually-synced mirror and note the dependency in both PRs |
| Switching from client-side to server-side pagination changes perceived behaviour (e.g. `speciesCount` currently derived from the full unfiltered list) | Med | Med | Fetch `speciesCount` from a separate lightweight query, or keep it computed from an unfiltered summary call — decide in design.md before implementing |
| Existing `plants-list.screen.spec.tsx` / `use-plants.hook.spec.ts` assert today's no-args `execute()` call | High | Low | Update both specs as part of this change; they are expected to change signature |

## Rollback Plan

Additive to existing files (new hook, new enum, extended query variables); no
new dependencies. Rollback = revert the branch — `usePlants` falls back to its
current no-filter behaviour, and the "Filters" button/category tabs simply
go back to `disabled`.

## Success Criteria

- [ ] The "Filters" button and category tabs in `plants-list.screen.tsx` are
      no longer `disabled`.
- [ ] Typing in the filter search box narrows the plant list via a real
      `plantsFindByCriteria` call with a `NAME`/`LIKE` filter (not client-side
      `.filter()`).
- [ ] Pagination is server-side (`pagination` sent in the query variables).
- [ ] `pnpm test`, `pnpm lint`, `pnpm tsc --noEmit` green.
