# Tasks: Wire the Plants List Filters to Typed Criteria

Blocked on the companion `gardenia-api` change (`typed-criteria-filters`)
merging first — `PlantFindByCriteriaRequestDto` must accept
`filters`/`sorts`/`pagination` and validate them before this repo can send
real values. Each phase keeps `pnpm test` / `pnpm lint` / `pnpm tsc --noEmit`
green.

## Phase 0 — Baseline

- [ ] 0.1 Confirm the API change has merged and `plantsFindByCriteria(input:
      ...)` is live (manual check against the running/staging API schema).
- [ ] 0.2 Confirm `pnpm test`, `pnpm lint`, `pnpm tsc --noEmit` are green
      before any change.

## Phase 1 — Query, port, repository

- [ ] 1.1 Add `domain/enums/plant-queryable-field.enum.ts` and
      `domain/enums/plant-filter-operator.enum.ts` (mirrors of the API
      enums, per design.md §2).
- [ ] 1.2 Update `PLANTS_FIND_BY_CRITERIA` to declare `$input` and select
      `total`/`page`/`perPage` alongside `items` (design.md §3).
- [ ] 1.3 Update `PlantsFindByCriteriaResponse` to include `total`/`page`/
      `perPage`.
- [ ] 1.4 Update `IPlantsRepository.list` signature and
      `PlantsGqlRepository.list` implementation to accept
      `PlantListCriteria` and return the paginated shape (design.md §2).
- [ ] 1.5 Update `GetPlantsUseCase.execute` to forward the criteria argument.
- [ ] 1.6 Update `plants.gql.repository.spec.ts`, `get-plants.use-case.spec.ts`
      for the new signature.
- [ ] 1.7 `pnpm test` green; commit.

## Phase 2 — Filter state hook

- [ ] 2.1 Create `presentation/hooks/use-plant-filters/use-plant-filters.hook.ts`
      (search + speciesId → `PlantFilter[]`, design.md §4). Write the RED
      spec first.
- [ ] 2.2 Update `use-plants.hook.ts` to accept and forward
      `criteria`/pagination, keying the TanStack Query cache on it.
- [ ] 2.3 Decide and implement `speciesCount`'s new source (design.md §5) —
      either kept as an approximation from the current page or moved to a
      separate lightweight call; document the choice in the PR description.
- [ ] 2.4 Update `use-plants.hook.spec.ts` accordingly.
- [ ] 2.5 `pnpm test` green; commit.

## Phase 3 — Enable the filter UI + server-side pagination

- [ ] 3.1 Enable the "Filters" button in `plants-list.screen.tsx`; reveal a
      form (`SearchInput` + species `Select`) bound to `usePlantFilters`.
- [ ] 3.2 Replace `useUrlPagination` client-side slicing with the
      `pagination` criteria field + `total`/`page` from the response.
- [ ] 3.3 Update `plants-list.screen.spec.tsx` for the new filter form and
      server-side pagination.
- [ ] 3.4 Update/add a Storybook story for the filter-enabled state (seed
      the real `usePlants`/`usePlantFilters` hooks per the project's
      Storybook convention — no hook mocking).
- [ ] 3.5 `pnpm test`, `pnpm lint`, `pnpm tsc --noEmit` green; commit.

## Phase 4 — Manual verification

- [ ] 4.1 Run the dev server, open the plants list, confirm: typing in the
      search box narrows results via a real network call (check the
      Network tab for `plantsFindByCriteria` variables), species select
      filters correctly, pagination controls move through server pages.
- [ ] 4.2 Confirm the "Filters" button and search/species controls are no
      longer `disabled`; category tabs remain disabled (explicitly out of
      scope).

## Follow-ups (separate changes, not part of this one)

- Rework `inventory-filters.tsx` to stop duplicating `INVENTORY_ITEM_TYPES`
  and instead mirror a real backend enum, once its API-side context adopts
  the `typed-criteria-filters` mechanism.
- Planting-spot filter UI (`plantingSpotId`) once a spot-picker component
  exists.
