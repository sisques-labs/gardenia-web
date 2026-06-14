# Technical Design: add-planting-spots

## 0. Context & Constraints

- Stack: Next.js 16 (App Router), TypeScript (strict), React 19, Apollo Client v4,
  TanStack Query v5, React Hook Form + Zod, shadcn/ui + Tailwind v4, Vitest + Testing Library.
- Architecture: DDD + Hexagonal under `src/core/{context}/{layer}/`.
- Strict TDD: every use-case, repository, hook, screen, and parity test is written
  test-first (`pnpm test`).
- Reference module: `src/core/harvests/` — mirrored for CRUD; `src/core/plants/`
  for read-only patterns.
- Artifact store: openspec (files).

### Key conventions confirmed from existing code

- **GQL repository** is the current standard (`openspec/config.yaml`, `harvests` module).
  HTTP repositories are legacy.
- **Apollo Client** is imported directly as `apolloClient` from
  `@/shared/infrastructure/http/apollo.client`. The client already includes `X-Space-ID`.
- **TanStack Query keys** include `currentSpaceId` (from `useSpacesStore`) so the cache
  invalidates on space switch.
- **Mutation use-cases** take an input object and return the mutated entity (by re-fetching
  via `findById` after the mutation — matches `harvestsGqlRepository`).
- **Form screens** are `'use client'`, receive `dict` + `lang` props from Server Component
  pages, use React Hook Form + Zod schema.
- **No barrel `index.ts`** unless the module explicitly needs a public API surface.

---

## 1. Module Structure

```
src/core/planting-spots/
  domain/
    interfaces/
      planting-spot.interface.ts            # PlantingSpot, PlantingSpotType
  application/
    interfaces/
      create-planting-spot-input.interface.ts
      update-planting-spot-input.interface.ts
    ports/
      planting-spots.repository.port.ts     # IPlantingSpotsRepository
    use-cases/
      get-planting-spots/
        get-planting-spots.use-case.ts
        get-planting-spots.use-case.spec.ts
      get-planting-spot/
        get-planting-spot.use-case.ts
        get-planting-spot.use-case.spec.ts
      create-planting-spot/
        create-planting-spot.use-case.ts
        create-planting-spot.use-case.spec.ts
      update-planting-spot/
        update-planting-spot.use-case.ts
        update-planting-spot.use-case.spec.ts
      delete-planting-spot/
        delete-planting-spot.use-case.ts
        delete-planting-spot.use-case.spec.ts
  infrastructure/
    repositories/
      graphql/
        queries/
          planting-spots-find-by-criteria.query.ts
          planting-spot-find-by-id.query.ts
        mutations/
          planting-spot-create.mutation.ts
          planting-spot-update.mutation.ts
          planting-spot-delete.mutation.ts
        responses/
          planting-spots-find-by-criteria.response.ts
          planting-spot-find-by-id.response.ts
          planting-spot-create.response.ts
          planting-spot-update.response.ts
          planting-spot-delete.response.ts
        planting-spots.gql.repository.ts
        planting-spots.gql.repository.spec.ts
  presentation/
    hooks/
      use-planting-spots/
        use-planting-spots.hook.ts
        use-planting-spots.hook.spec.ts
      use-planting-spot/
        use-planting-spot.hook.ts
        use-planting-spot.hook.spec.ts
      use-create-planting-spot/
        use-create-planting-spot.hook.ts
        use-create-planting-spot.hook.spec.ts
      use-update-planting-spot/
        use-update-planting-spot.hook.ts
        use-update-planting-spot.hook.spec.ts
      use-delete-planting-spot/
        use-delete-planting-spot.hook.ts
        use-delete-planting-spot.hook.spec.ts
    schemas/
      planting-spot.schema.ts
    screens/
      planting-spots-list/
        planting-spots-list.screen.tsx
        planting-spots-list.screen.test.tsx
      planting-spot-form/
        planting-spot-form.screen.tsx
        planting-spot-form.screen.test.tsx
    components/
      planting-spot-card/
        planting-spot-card.tsx
        planting-spot-card.test.tsx
      planting-spot-type-badge/
        planting-spot-type-badge.tsx
        planting-spot-type-badge.test.tsx
    i18n/
      en.ts
      es.ts
      i18n-parity.test.ts
```

Shared touch-points (PR2):

```
app/[lang]/(protected)/planting-spots/page.tsx            # list
app/[lang]/(protected)/planting-spots/new/page.tsx        # new form
app/[lang]/(protected)/planting-spots/[id]/edit/page.tsx  # edit form
src/shared/presentation/i18n/get-dictionary.ts            # add plantingSpots
src/shared/presentation/components/sidebar-nav-items/nav-items.ts  # nav entry
```

---

## 2. Domain Layer

### `domain/interfaces/planting-spot.interface.ts`

```ts
export type PlantingSpotType =
  | 'raised_bed'
  | 'pot'
  | 'container'
  | 'field_section'
  | 'other';

export interface PlantingSpot {
  id: string;
  name: string;
  type: PlantingSpotType;
  description?: string | null;
  userId: string;
  spaceId: string;
  createdAt: string;
  updatedAt: string;
}
```

No enum — the GraphQL schema returns raw string values; a union type is sufficient.
All fields except `description` are required (mirrors `PlantingSpotResponseDto`).

---

## 3. Application Layer

### Interfaces

`application/interfaces/create-planting-spot-input.interface.ts`:
```ts
import type { PlantingSpotType } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

export interface CreatePlantingSpotInput {
  name: string;
  type: PlantingSpotType;
  description?: string | null;
}
```

`application/interfaces/update-planting-spot-input.interface.ts`:
```ts
import type { PlantingSpotType } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

export interface UpdatePlantingSpotInput {
  id: string;
  name?: string;
  type?: PlantingSpotType;
  description?: string | null;
}
```

### Port — `application/ports/planting-spots.repository.port.ts`

```ts
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import type { CreatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/create-planting-spot-input.interface';
import type { UpdatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/update-planting-spot-input.interface';

export interface IPlantingSpotsRepository {
  list(): Promise<PlantingSpot[]>;
  findById(id: string): Promise<PlantingSpot>;
  create(input: CreatePlantingSpotInput): Promise<PlantingSpot>;
  update(input: UpdatePlantingSpotInput): Promise<PlantingSpot>;
  delete(id: string): Promise<void>;
}
```

No `spaceId` params (ADR-001 — axios interceptor injects `X-Space-ID`).

### Use-cases

All five follow the same thin-pass-through pattern (no Zustand store writes — TanStack
Query caches query results; mutation hooks invalidate the list query):

```ts
// get-planting-spots.use-case.ts
export class GetPlantingSpotsUseCase {
  constructor(private readonly repo: IPlantingSpotsRepository) {}
  async execute(): Promise<PlantingSpot[]> { return this.repo.list(); }
}

// get-planting-spot.use-case.ts
export class GetPlantingSpotUseCase {
  constructor(private readonly repo: IPlantingSpotsRepository) {}
  async execute(id: string): Promise<PlantingSpot> { return this.repo.findById(id); }
}

// create-planting-spot.use-case.ts
export class CreatePlantingSpotUseCase {
  constructor(private readonly repo: IPlantingSpotsRepository) {}
  async execute(input: CreatePlantingSpotInput): Promise<PlantingSpot> {
    return this.repo.create(input);
  }
}

// update-planting-spot.use-case.ts
export class UpdatePlantingSpotUseCase {
  constructor(private readonly repo: IPlantingSpotsRepository) {}
  async execute(input: UpdatePlantingSpotInput): Promise<PlantingSpot> {
    return this.repo.update(input);
  }
}

// delete-planting-spot.use-case.ts
export class DeletePlantingSpotUseCase {
  constructor(private readonly repo: IPlantingSpotsRepository) {}
  async execute(id: string): Promise<void> { return this.repo.delete(id); }
}
```

Each exported as a module singleton:
```ts
export const getPlantingSpotsUseCase = new GetPlantingSpotsUseCase(plantingSpotsGqlRepository);
```

### Use-case tests (Strict TDD — written first)

Mock `IPlantingSpotsRepository` with `vi.fn()`.

- `get-planting-spots.use-case.spec.ts`: "returns list from repo" + "propagates errors".
- `get-planting-spot.use-case.spec.ts`: "returns spot by id" + "called with id" + "propagates errors".
- `create-planting-spot.use-case.spec.ts`: "calls repo.create with input" + "returns created spot".
- `update-planting-spot.use-case.spec.ts`: "calls repo.update with input" + "returns updated spot".
- `delete-planting-spot.use-case.spec.ts`: "calls repo.delete with id" + "resolves void".

---

## 4. Infrastructure Layer

### GQL documents

`queries/planting-spots-find-by-criteria.query.ts`:
```ts
import { gql } from '@apollo/client';
export const PLANTING_SPOTS_FIND_BY_CRITERIA = gql`
  query PlantingSpotsFindByCriteria {
    plantingSpotsFindByCriteria {
      items {
        id name type description userId spaceId createdAt updatedAt
      }
    }
  }
`;
```

`queries/planting-spot-find-by-id.query.ts`:
```ts
import { gql } from '@apollo/client';
export const PLANTING_SPOT_FIND_BY_ID = gql`
  query PlantingSpotFindById($input: PlantingSpotFindByIdRequestDto!) {
    plantingSpotFindById(input: $input) {
      id name type description userId spaceId createdAt updatedAt
    }
  }
`;
```

`mutations/planting-spot-create.mutation.ts`:
```ts
import { gql } from '@apollo/client';
export const PLANTING_SPOT_CREATE = gql`
  mutation PlantingSpotCreate($input: PlantingSpotCreateRequestDto!) {
    plantingSpotCreate(input: $input) { id success message }
  }
`;
```

`mutations/planting-spot-update.mutation.ts`:
```ts
import { gql } from '@apollo/client';
export const PLANTING_SPOT_UPDATE = gql`
  mutation PlantingSpotUpdate($input: PlantingSpotUpdateRequestDto!) {
    plantingSpotUpdate(input: $input) { id success message }
  }
`;
```

`mutations/planting-spot-delete.mutation.ts`:
```ts
import { gql } from '@apollo/client';
export const PLANTING_SPOT_DELETE = gql`
  mutation PlantingSpotDelete($input: PlantingSpotDeleteRequestDto!) {
    plantingSpotDelete(input: $input) { id success message }
  }
`;
```

### Response types

One TypeScript interface per GQL response (co-located in `responses/`):

```ts
// planting-spots-find-by-criteria.response.ts
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
export interface PlantingSpotsFindByCriteriaResponse {
  plantingSpotsFindByCriteria: { items: PlantingSpot[] };
}

// planting-spot-find-by-id.response.ts
export interface PlantingSpotFindByIdResponse {
  plantingSpotFindById: PlantingSpot | null;
}

// planting-spot-create.response.ts
export interface PlantingSpotCreateResponse {
  plantingSpotCreate: { id: string; success: boolean; message: string };
}
// (same shape for Update and Delete)
```

### GQL Repository — `planting-spots.gql.repository.ts`

```ts
import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
// ... imports for documents and response types ...

export class PlantingSpotsGqlRepository implements IPlantingSpotsRepository {
  async list(): Promise<PlantingSpot[]> {
    const res = await apolloClient.query<PlantingSpotsFindByCriteriaResponse>({
      query: PLANTING_SPOTS_FIND_BY_CRITERIA,
      fetchPolicy: 'network-only',
    });
    return res.data?.plantingSpotsFindByCriteria?.items ?? [];
  }

  async findById(id: string): Promise<PlantingSpot> {
    const res = await apolloClient.query<PlantingSpotFindByIdResponse>({
      query: PLANTING_SPOT_FIND_BY_ID,
      variables: { input: { id } },
      fetchPolicy: 'network-only',
    });
    if (!res.data?.plantingSpotFindById) throw new Error(`PlantingSpot not found: ${id}`);
    return res.data.plantingSpotFindById;
  }

  async create(input: CreatePlantingSpotInput): Promise<PlantingSpot> {
    const res = await apolloClient.mutate<PlantingSpotCreateResponse>({
      mutation: PLANTING_SPOT_CREATE,
      variables: { input },
    });
    if (!res.data?.plantingSpotCreate?.success) throw new Error('plantingSpotCreate failed');
    return this.findById(res.data.plantingSpotCreate.id);
  }

  async update(input: UpdatePlantingSpotInput): Promise<PlantingSpot> {
    const res = await apolloClient.mutate<PlantingSpotUpdateResponse>({
      mutation: PLANTING_SPOT_UPDATE,
      variables: { input },
    });
    if (!res.data?.plantingSpotUpdate?.success) throw new Error('plantingSpotUpdate failed');
    return this.findById(res.data.plantingSpotUpdate.id);
  }

  async delete(id: string): Promise<void> {
    await apolloClient.mutate<PlantingSpotDeleteResponse>({
      mutation: PLANTING_SPOT_DELETE,
      variables: { input: { id } },
    });
  }
}

export const plantingSpotsGqlRepository = new PlantingSpotsGqlRepository();
```

### Repository test

`vi.mock('@/shared/infrastructure/http/apollo.client', () => ({ apolloClient: { query: vi.fn(), mutate: vi.fn() } }))`.

Tests: "list() returns items", "findById() returns spot", "create() mutates then re-fetches",
"update() mutates then re-fetches", "delete() calls mutate with id".

---

## 5. Presentation Layer — Hooks

All hooks instantiate the use-case once at module scope and include `currentSpaceId` in
the query key to invalidate on space switch.

### Query hooks

```ts
// use-planting-spots.hook.ts
export function usePlantingSpots() {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  return useQuery({
    queryKey: ['planting-spots', spaceId],
    queryFn: () => getPlantingSpotsUseCase.execute(),
    enabled: !!spaceId,
  });
}

// use-planting-spot.hook.ts
export function usePlantingSpot(id: string) {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  return useQuery({
    queryKey: ['planting-spot', spaceId, id],
    queryFn: () => getPlantingSpotUseCase.execute(id),
    enabled: !!spaceId && !!id,
  });
}
```

### Mutation hooks

```ts
// use-create-planting-spot.hook.ts
export function useCreatePlantingSpot() {
  const queryClient = useQueryClient();
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  return useMutation({
    mutationFn: (input: CreatePlantingSpotInput) => createPlantingSpotUseCase.execute(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['planting-spots', spaceId] }),
  });
}

// use-update-planting-spot.hook.ts  (same shape, invalidates list + detail)
// use-delete-planting-spot.hook.ts  (same shape, invalidates list)
```

The mutation hooks return the TanStack Query `UseMutationResult` directly — screens call
`mutate(input)` and handle `isPending` / `isError`.

---

## 6. Presentation Layer — Zod Schema

`presentation/schemas/planting-spot.schema.ts`:

```ts
import { z } from 'zod';

export const PLANTING_SPOT_TYPES = [
  'raised_bed', 'pot', 'container', 'field_section', 'other',
] as const;

export const plantingSpotSchema = z.object({
  name: z.string().min(1),
  type: z.enum(PLANTING_SPOT_TYPES),
  description: z.string().optional(),
});

export type PlantingSpotFormValues = z.infer<typeof plantingSpotSchema>;
```

---

## 7. Presentation Layer — Components

### `PlantingSpotTypeBadge` — `components/planting-spot-type-badge/planting-spot-type-badge.tsx`

`'use client'`. Props: `{ type: PlantingSpotType; dict: PlantingSpotTypeLabels }`.

Renders a `Badge` (variant `secondary`) with the localized label for the spot type.
`dict` shape: `{ raised_bed: string; pot: string; container: string; field_section: string; other: string }`.

### `PlantingSpotCard` — `components/planting-spot-card/planting-spot-card.tsx`

`'use client'`. Props: `{ spot: PlantingSpot; dict: ...; lang: string }`.

Renders a `Card` linking to `/${lang}/planting-spots/${spot.id}/edit`:
- `CardTitle` = `spot.name`.
- `PlantingSpotTypeBadge`.
- Optional `spot.description` truncated to 2 lines.

---

## 8. Presentation Layer — Screens

### `PlantingSpotsListScreen` — `screens/planting-spots-list/planting-spots-list.screen.tsx`

`'use client'`. Props: `{ dict: AppDict['plantingSpots']['list']; lang: string }`.

- Calls `usePlantingSpots()`.
- `<ScreenHeader title={dict.title} actions={<Button asChild><Link href={...}>{dict.new}</Link></Button>} />`.
- `isLoading` → skeleton grid.
- Empty (`spots.length === 0`) → `dict.empty` muted message.
- Otherwise → responsive grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`) of
  `PlantingSpotCard`.

### `PlantingSpotFormScreen` — `screens/planting-spot-form/planting-spot-form.screen.tsx`

`'use client'`. Props:
```ts
type Props = {
  dict: AppDict['plantingSpots']['form'];
  lang: string;
  mode: 'create' | 'edit';
  spotId?: string;   // only in edit mode
};
```

- In **edit mode**: calls `usePlantingSpot(spotId!)` to pre-fill form; shows `isLoading` skeleton.
- Form fields: `name` (Input), `type` (Select with `PLANTING_SPOT_TYPES` options), `description`
  (Textarea optional).
- Submit: calls `useCreatePlantingSpot().mutate(values)` or `useUpdatePlantingSpot().mutate(...)`.
- On success: `router.push(`/${lang}/planting-spots`)`.
- In **edit mode**: renders a **Delete** button that calls `useDeletePlantingSpot().mutate(spotId)`
  with an inline `AlertDialog` confirmation (`dict.form.deleteConfirm`).
- On delete success: redirect to list.

---

## 9. i18n

`presentation/i18n/en.ts` (source of truth — `as const`, exports `PlantingSpotsDict` type):

```ts
const dict = {
  list: {
    title: 'Planting spots',
    empty: 'No planting spots in this space yet.',
    new: 'New planting spot',
  },
  form: {
    titleCreate: 'New planting spot',
    titleEdit: 'Edit planting spot',
    name: 'Name',
    type: 'Type',
    description: 'Description (optional)',
    save: 'Save',
    saving: 'Saving…',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this planting spot?',
    cancel: 'Cancel',
  },
  types: {
    raised_bed: 'Raised bed',
    pot: 'Pot',
    container: 'Container',
    field_section: 'Field section',
    other: 'Other',
  },
  nav: 'Planting spots',
} as const;

export default dict;
export type PlantingSpotsDict = typeof dict;
```

`presentation/i18n/es.ts`:
```ts
const dict = {
  list: {
    title: 'Zonas de cultivo',
    empty: 'Todavía no hay zonas de cultivo en este espacio.',
    new: 'Nueva zona de cultivo',
  },
  form: {
    titleCreate: 'Nueva zona de cultivo',
    titleEdit: 'Editar zona de cultivo',
    name: 'Nombre',
    type: 'Tipo',
    description: 'Descripción (opcional)',
    save: 'Guardar',
    saving: 'Guardando…',
    delete: 'Eliminar',
    deleteConfirm: '¿Estás seguro de que quieres eliminar esta zona de cultivo?',
    cancel: 'Cancelar',
  },
  types: {
    raised_bed: 'Bancal',
    pot: 'Maceta',
    container: 'Contenedor',
    field_section: 'Sección de campo',
    other: 'Otro',
  },
  nav: 'Zonas de cultivo',
} as const satisfies WidenStringLiterals<PlantingSpotsDict>;

export default dict;
```

`i18n-parity.test.ts`: flatten both dicts' keys recursively; assert symmetric difference is empty.

### Registration in `get-dictionary.ts`

```ts
import type { PlantingSpotsDict } from '@/core/planting-spots/presentation/i18n/en';
import enPlantingSpots from '@/core/planting-spots/presentation/i18n/en';
import esPlantingSpots from '@/core/planting-spots/presentation/i18n/es';
// AppDict += plantingSpots: WidenStringLiterals<PlantingSpotsDict>;
// dictionaries.en.plantingSpots = enPlantingSpots;
// dictionaries.es.plantingSpots = esPlantingSpots;
```

---

## 10. Next.js Pages (Server Components)

```ts
// app/[lang]/(protected)/planting-spots/page.tsx
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return <PlantingSpotsListScreen dict={dict.plantingSpots.list} lang={locale} />;
}

// app/[lang]/(protected)/planting-spots/new/page.tsx
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return <PlantingSpotFormScreen dict={dict.plantingSpots.form} lang={locale} mode="create" />;
}

// app/[lang]/(protected)/planting-spots/[id]/edit/page.tsx
export default async function Page({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return <PlantingSpotFormScreen dict={dict.plantingSpots.form} lang={locale} mode="edit" spotId={id} />;
}
```

Pages sit under `(protected)` — auth is guarded by the existing layout.

---

## 11. Sidebar Nav

`src/shared/presentation/components/sidebar-nav-items/nav-items.ts` — append:

```ts
import { MapPin } from 'lucide-react';
// ...
{ label: 'Planting spots', href: '/[lang]/planting-spots', icon: MapPin },
```

Uses `MapPin` (physical location/area feel). Follows the literal-label convention of
existing nav items.

---

## 12. Data Flow

```
Server Component page (resolves locale, slices dict)
        │  props: dict, lang[, mode, spotId]
        ▼
'use client' Screen  ──reads──►  usePlantingSpots() / usePlantingSpot(id)
                     ──writes──►  useCreatePlantingSpot() / useUpdate… / useDelete…
                                        │
                                        ▼
                                 use-case.execute(...)
                                        ▼
                                 PlantingSpotsGqlRepository.{list|findById|create|update|delete}()
                                        ▼
                                 apolloClient.{query|mutate}(...)
                                        │  X-Space-ID injected by Apollo client link
                                        ▼
                                 gardenia-api  GraphQL endpoint
```

---

## 13. Test Strategy (Strict TDD)

| Layer | File | Approach |
|-------|------|----------|
| Use-cases (×5) | `*.use-case.spec.ts` | Pure units. Mock `IPlantingSpotsRepository` with `vi.fn()`. Assert delegation + error propagation. |
| GQL Repository | `*.gql.repository.spec.ts` | `vi.mock` `apolloClient`. Assert GQL doc names, variables, returned data. |
| Query hooks (×2) | `*.hook.spec.ts` | `renderHook` + `QueryClientProvider`. Mock use-case + `useSpacesStore`. Assert `data` and `enabled` gating. |
| Mutation hooks (×3) | `*.hook.spec.ts` | `renderHook` + `QueryClientProvider`. Assert `mutate(input)` calls use-case + invalidates query key. |
| `PlantingSpotTypeBadge` | `*.test.tsx` | Render with each type; assert label text + badge presence. |
| `PlantingSpotCard` | `*.test.tsx` | Render with a spot; assert name, type badge, description, link href. |
| `PlantingSpotsListScreen` | `*.test.tsx` | Mock `usePlantingSpots`; assert header, skeleton, empty, card count. |
| `PlantingSpotFormScreen` | `*.test.tsx` | Mock `usePlantingSpot` + mutation hooks; assert create/edit title, field values, submit call, delete dialog in edit mode. |
| i18n parity | `i18n-parity.test.ts` | Flatten both dicts; assert symmetric difference empty. |

---

## 14. Delivery Plan

- **PR1 — data layer** (~320 lines): domain, application interfaces + 5 use-cases + specs,
  GQL repo + documents + specs, i18n dict + parity test, `get-dictionary.ts` registration.
- **PR2 — presentation layer** (~370 lines): Zod schema, query/mutation hooks + specs,
  `PlantingSpotTypeBadge`, `PlantingSpotCard`, `PlantingSpotsListScreen`,
  `PlantingSpotFormScreen`, 3 Next.js pages, nav entry.

---

## 15. ADRs

### ADR-001 — Space identity in Apollo link, not in call signatures
Same ADR as `plants-module`. Repository methods take no `spaceId`; the Apollo Client
already injects `X-Space-ID` from `useSpacesStore.currentSpaceId` per request.
Hooks include `currentSpaceId` only in the TanStack Query key.

### ADR-002 — GQL repository (not HTTP)
`openspec/config.yaml` labels HTTP repos as "legacy (being replaced)". Starting with
GQL avoids an immediate migration and matches `harvests` (the reference module for CRUD).

### ADR-003 — Single form screen for create and edit
One `PlantingSpotFormScreen` component handles both modes via a `mode: 'create' | 'edit'`
prop. This avoids duplicating the form JSX while keeping the screen logic clear.
The edit mode fetches the spot to pre-fill; create mode starts with empty defaults.

### ADR-004 — PlantingSpotType as union literal (not enum)
The API's `PlantingSpotTypeEnum` is a TypeScript enum on the backend, but GraphQL
serialises it to a plain string. The web uses a union type
(`'raised_bed' | 'pot' | 'container' | 'field_section' | 'other'`) — no runtime overhead,
fully type-safe, and consistent with how the existing `HarvestUnit` type is handled.

### ADR-005 — Delete via edit form (not list)
Deletion is triggered from the edit form screen (not a list card action). This avoids
an additional detail page and keeps the list simple. The confirmation uses `AlertDialog`
from shadcn/ui — already available in the shared component library.
