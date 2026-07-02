# Design: Wire the Plants List Filters to Typed Criteria

## 1. Current shape vs. target shape

Today:

```ts
// port
list(): Promise<Plant[]>

// repository
async list(): Promise<Plant[]> {
  const res = await apolloClient.query<PlantsFindByCriteriaResponse>({
    query: PLANTS_FIND_BY_CRITERIA,
    fetchPolicy: 'network-only',
  });
  return res.data?.plantsFindByCriteria?.items ?? [];
}

// response
interface PlantsFindByCriteriaResponse {
  plantsFindByCriteria: { items: Plant[] };
}
```

No variables, no pagination read, `usePlants` fetches everything and
`useUrlPagination` slices client-side. Target: `list()` takes a
`PlantListCriteria` (filters + sorts + pagination), the response includes
`total`/`page`/`perPage`, and pagination becomes server-driven.

## 2. Port + repository change

```ts
// application/ports/plants.repository.port.ts
export interface PlantListCriteria {
  filters?: PlantFilter[];
  sorts?: PlantSort[];
  pagination?: { page: number; perPage: number };
}

export interface IPlantsRepository {
  list(criteria?: PlantListCriteria): Promise<{ items: Plant[]; total: number; page: number; perPage: number }>;
  // ...unchanged methods
}
```

```ts
// domain/enums/plant-queryable-field.enum.ts — mirrors the API's PlantQueryableFieldEnum
export enum PlantQueryableField {
  NAME = 'name',
  PLANT_SPECIES_ID = 'plantSpeciesId',
  PLANTING_SPOT_ID = 'plantingSpotId',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}
```

```ts
// domain/enums/filter-operator.enum.ts — mirrors nestjs-kit's FilterOperator (only the ones used here)
export enum PlantFilterOperator { EQUALS = 'eq', LIKE = 'like' }
```

```ts
// infrastructure/repositories/graphql/plants.gql.repository.ts
async list(criteria?: PlantListCriteria): Promise<PaginatedPlants> {
  const res = await apolloClient.query<PlantsFindByCriteriaResponse>({
    query: PLANTS_FIND_BY_CRITERIA,
    variables: { input: criteria },
    fetchPolicy: 'network-only',
  });
  const page = res.data?.plantsFindByCriteria;
  return { items: page?.items ?? [], total: page?.total ?? 0, page: page?.page ?? 1, perPage: page?.perPage ?? 10 };
}
```

`variables: { input: criteria }` matches how `PLANT_FIND_BY_ID` already sends
`{ input: { id } }` — same convention, no new pattern introduced.

## 3. Query file

`PLANTS_FIND_BY_CRITERIA` gains a declared `$input` variable and `total` /
`page` / `perPage` in the selection set:

```graphql
query PlantsFindByCriteria($input: PlantFindByCriteriaRequestDto) {
  plantsFindByCriteria(input: $input) {
    items { id name plantSpeciesId species { ... } imageUrl userId spaceId qr { ... } createdAt updatedAt }
    total
    page
    perPage
  }
}
```

## 4. Filter state — local to the screen, not Zustand

Per the state-management rule (data origin decides the tool): filter text and
selected species are **UI state local to `plants-list.screen.tsx`**, not
shared across unrelated screens/components — so this is a plain hook with
`useState`, not a store:

```ts
// presentation/hooks/use-plant-filters/use-plant-filters.hook.ts
export function usePlantFilters() {
  const [search, setSearch] = useState('');
  const [speciesId, setSpeciesId] = useState<string | null>(null);

  const filters = useMemo<PlantFilter[]>(() => {
    const result: PlantFilter[] = [];
    if (search) result.push({ field: PlantQueryableField.NAME, operator: PlantFilterOperator.LIKE, value: search });
    if (speciesId) result.push({ field: PlantQueryableField.PLANT_SPECIES_ID, operator: PlantFilterOperator.EQUALS, value: speciesId });
    return result;
  }, [search, speciesId]);

  return { search, setSearch, speciesId, setSpeciesId, filters };
}
```

`usePlants` (TanStack Query wrapper) takes `filters`/`page` as arguments and
includes them in the `queryKey` so changing a filter triggers a real refetch:

```ts
export function usePlants(spaceId: string | null, criteria?: PlantListCriteria) {
  return useQuery({
    queryKey: ['plants', spaceId, criteria],
    queryFn: () => plantsUseCase.execute(criteria),
    enabled: !!spaceId,
  });
}
```

## 5. Pagination: client-side → server-side

`useUrlPagination` currently slices an already-fetched full array. Once
`list()` returns a real page, `plants-list.screen.tsx` passes `{ page,
perPage: 20 }` from the URL page param directly into `usePlants`'s criteria,
and reads `total`/`page` from the response instead of computing
`totalPages` from `plants.length`. `speciesCount` (currently derived by
reducing over the full unfiltered list) can no longer be computed this way
once the list is paginated/filtered — it moves to a lightweight dedicated
call (out of scope here: keep `speciesCount` computed from the *first*
unfiltered page's species as an acceptable approximation, or drop it from the
header if that's misleading; decided during Phase 2 of tasks.md, not
pre-decided here since it needs a quick product call).

## 6. Enabling the disabled UI

`plants-list.screen.tsx`:
- The "Filters" button (`disabled`, `cursor-not-allowed`) becomes a toggle
  that reveals a small form (search input bound to `usePlantFilters().search`,
  species `Select` bound to `speciesId`) — same `Select`/`SearchInput`
  components already used in `inventory-filters.tsx`, no new UI primitives.
- Category tabs (currently `disabled`, keyed by `dict.list.categories`) stay
  out of scope — they map to a taxonomy that doesn't exist as a queryable
  field yet (see proposal's Out of Scope).

## 7. Mirroring risk

The web-side `PlantQueryableField` enum is a **manual mirror** of the API's
`PlantQueryableFieldEnum` — this repo has no GraphQL codegen (checked: no
`codegen.yml`/`graphql-codegen` dependency). If the API changes the enum,
this file needs a matching edit. This is called out explicitly rather than
silently accepted; if this class of drift becomes a recurring pain point
across more contexts, introducing `graphql-codegen` is the real fix — but
that's a tooling change out of scope for this proposal.
