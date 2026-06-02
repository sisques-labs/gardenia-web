# Technical Design: plants-module

## 0. Context & Constraints

- Stack: Next.js 15 (App Router), TypeScript, React Query (`@tanstack/react-query`), Vitest + Testing Library.
- Architecture: DDD + Hexagonal under `src/core/{context}/{layer}/`.
- Strict TDD: **true** — every use-case, repository, hook, screen, and the i18n parity test is written test-first (`npx vitest run`).
- Reference module: `src/core/spaces/` — mirrored exactly.
- Artifact store: openspec (files).

### Reality check against the proposal/brief (load-bearing)

The brief assumed repository/use-case signatures like `getPlants(spaceId)` and a header injected per call. **This is wrong for this codebase** and the design corrects it:

- `src/shared/infrastructure/http/axios.client.ts` already injects `X-Space-ID` via a request interceptor, reading `useSpacesStore.getState().currentSpaceId` for every non-`/auth/` request.
- Therefore the **repository and use-case take NO `spaceId` argument** — exactly like `SpacesHttpRepository.listByUser()`. Passing `spaceId` would duplicate state the interceptor already owns and break the established pattern.
- `spaceId` DOES belong in the **React Query key** at the hook layer, so the cache invalidates and refetches when the user switches active space. This is the only place `spaceId` is a first-class identifier in the plants module.

This is ADR-001 below.

---

## 1. Module Structure

```
src/core/plants/
  domain/
    interfaces/
      plant.interface.ts            # Plant, PlantSpecies, PlantQr
  application/
    ports/
      plants.repository.port.ts      # IPlantsRepository
    use-cases/
      get-plants/
        get-plants.use-case.ts
        get-plants.use-case.spec.ts
      get-plant/
        get-plant.use-case.ts
        get-plant.use-case.spec.ts
  infrastructure/
    repositories/
      plants-http.repository.ts
      plants-http.repository.spec.ts
  presentation/
    hooks/
      use-plants/
        use-plants.hook.ts
        use-plants.hook.spec.ts
      use-plant/
        use-plant.hook.ts
        use-plant.hook.spec.ts
    screens/
      plants-list/
        plants-list.screen.tsx
        plants-list.screen.test.tsx
      plant-detail/
        plant-detail.screen.tsx
        plant-detail.screen.test.tsx
    components/
      plant-card/
        plant-card.tsx
        plant-card.test.tsx
      plant-section-placeholder/
        plant-section-placeholder.tsx
        plant-section-placeholder.test.tsx
    i18n/
      en.ts
      es.ts
      i18n-parity.test.ts
```

Plus shared/route touch-points (PR2 mostly):

```
app/[lang]/(protected)/plants/page.tsx          # list page (async Server Component)
app/[lang]/(protected)/plants/[id]/page.tsx     # detail page (async Server Component)
src/shared/presentation/i18n/get-dictionary.ts  # register plants dict in AppDict
src/shared/presentation/components/sidebar-nav-items/nav-items.ts  # add "Inventario" item
```

Note on test file extension: spaces screens use `.screen.test.tsx` (not `.spec.tsx`). We follow the **observed convention**: `.test.tsx` for React component/screen tests, `.spec.ts` for pure use-case/repository/hook logic. This matches the existing tree (`spaces-list.screen.test.tsx`, `list-spaces.use-case.spec.ts`).

---

## 2. Domain Layer

`domain/interfaces/plant.interface.ts` — plain TS interfaces mirroring `PlantRestResponseDto`. Pure, no dependencies.

```ts
export interface PlantSpecies {
  id: string;
  name: string;
}

export interface PlantQr {
  id: string;
  image: string;        // base64 PNG payload (no data: prefix — added at render time)
  targetUrl: string;
  generation: number;
}

export interface Plant {
  id: string;
  name: string;
  plantSpeciesId?: string;
  species?: PlantSpecies;
  imageUrl?: string;
  userId: string;
  spaceId: string;
  qr?: PlantQr;
  createdAt: string;
  updatedAt: string;
}
```

Optionality mirrors the API exactly: `plantSpeciesId`, `species`, `imageUrl`, and `qr` are all optional. Screens must treat them as possibly-absent.

---

## 3. Application Layer

### Port — `application/ports/plants.repository.port.ts`

```ts
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

export interface IPlantsRepository {
  list(): Promise<Plant[]>;
  getById(id: string): Promise<Plant>;
}
```

No `spaceId` param (ADR-001). Naming mirrors the spaces port style (`listByUser` → here `list`; detail fetch → `getById`).

### Use-case — `get-plants/get-plants.use-case.ts`

```ts
import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

export class GetPlantsUseCase {
  constructor(private readonly plantsRepository: IPlantsRepository) {}

  async execute(): Promise<Plant[]> {
    return this.plantsRepository.list();
  }
}
```

### Use-case — `get-plant/get-plant.use-case.ts`

```ts
export class GetPlantUseCase {
  constructor(private readonly plantsRepository: IPlantsRepository) {}

  async execute(id: string): Promise<Plant> {
    return this.plantsRepository.getById(id);
  }
}
```

Unlike `ListSpacesUseCase`, the plants use-cases do **NOT** write to a store (plants are query-cached by React Query, not persisted to a Zustand store). They are thin pass-throughs — that is intentional and correct for a read-only inventory. ADR-002.

### Use-case tests (Strict TDD — written first)

`get-plants.use-case.spec.ts`:
- mock `IPlantsRepository` with `vi.fn()` for `list` and `getById`.
- "returns plants from the repository" → `list` resolves `mockPlants`, assert `execute()` equals `mockPlants`.
- "propagates repository errors" → `list` rejects, assert `execute()` rejects with same error.

`get-plant.use-case.spec.ts`:
- "fetches a single plant by id" → `getById` resolves `mockPlant`, assert `execute('plant-1')` equals it and `getById` was called with `'plant-1'`.
- "propagates repository errors".

---

## 4. Infrastructure Layer

### `infrastructure/repositories/plants-http.repository.ts`

```ts
import { http } from '@/shared/infrastructure/http/axios.client';
import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

export class PlantsHttpRepository implements IPlantsRepository {
  async list(): Promise<Plant[]> {
    const res = await http.get<Plant[]>('/plants');
    return res.data;
  }

  async getById(id: string): Promise<Plant> {
    const res = await http.get<Plant>(`/plants/${id}`);
    return res.data;
  }
}

export const plantsHttpRepository = new PlantsHttpRepository();
```

- Reuses the shared `http` axios instance — JWT + `X-Space-ID` interceptors apply automatically. No bespoke header wiring.
- Open question to resolve during apply: the API `GET /api/plants` is **paginated**. If the response is `{ items: Plant[], ... }` rather than a bare array, `list()` maps `res.data.items`. The repository spec must pin this once the real shape is confirmed. Spaces returns a bare array; plants may differ. **Assumption for now: bare array** (matches the brief's `Promise<Plant[]>`); flagged as a risk.

### Repository test — `plants-http.repository.spec.ts`

- `vi.mock('@/shared/infrastructure/http/axios.client', () => ({ http: { get: vi.fn() } }))`.
- "list() calls GET /plants and returns data" → `http.get` resolves `{ data: mockPlants }`, assert `'/plants'` called and result equals `mockPlants`.
- "getById() calls GET /plants/:id" → assert `http.get` called with `'/plants/plant-1'`, returns `{ data: mockPlant }.data`.

---

## 5. Presentation Layer — Hooks

Each hook instantiates its use-case once at module scope (mirrors `useSpaces`), and keys the query by `currentSpaceId` so switching space refetches.

### `hooks/use-plants/use-plants.hook.ts`

```ts
import { useQuery } from '@tanstack/react-query';
import { GetPlantsUseCase } from '@/core/plants/application/use-cases/get-plants/get-plants.use-case';
import { plantsHttpRepository } from '@/core/plants/infrastructure/repositories/plants-http.repository';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

const getPlantsUseCase = new GetPlantsUseCase(plantsHttpRepository);

export function usePlants() {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  return useQuery({
    queryKey: ['plants', spaceId],
    queryFn: () => getPlantsUseCase.execute(),
    enabled: !!spaceId,
  });
}
```

### `hooks/use-plant/use-plant.hook.ts`

```ts
export function usePlant(id: string) {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  return useQuery({
    queryKey: ['plant', spaceId, id],
    queryFn: () => getPlantUseCase.execute(id),
    enabled: !!spaceId && !!id,
  });
}
```

Design decisions:
- `usePlants()` takes **no argument** — it reads `currentSpaceId` from the store internally (consumer screens never pass spaceId around). This diverges from the brief's `usePlants(spaceId)` signature; rationale in ADR-001. Brief said pass `spaceId` from the page; but the page is a Server Component and the active space lives in a client Zustand store, so it must be read client-side.
- `enabled: !!spaceId` prevents a fire before a space is resolved (the spaces store resolves `currentSpaceId` asynchronously after login).
- `usePlant(id)` keys on `['plant', spaceId, id]` so the cache is space-scoped.

### Hook tests — `use-plants.hook.spec.ts` / `use-plant.hook.spec.ts`

- `renderHook` wrapped in a `QueryClientProvider` (fresh `QueryClient` with retries off per test).
- mock the use-case module: `vi.mock('.../get-plants.use-case', () => ({ GetPlantsUseCase: vi.fn(() => ({ execute: vi.fn().mockResolvedValue(mockPlants) })) }))`.
- mock `useSpacesStore` to return a `currentSpaceId`.
- assert: hook reaches `isSuccess` with `data === mockPlants`; assert `enabled` gating by rendering with `currentSpaceId: null` and asserting the query stays idle (`fetchStatus === 'idle'`).

---

## 6. Presentation Layer — Components

### `plant-card/plant-card.tsx`

`'use client'`. Props: `{ plant: Plant; dict: AppDict['plants']['list']; lang: string }`.

Renders a `Card` linking to `/${lang}/plants/${plant.id}`:
- Avatar: if `plant.imageUrl` → `<img>`; else a letter-avatar fallback (first char of `plant.name`, uppercased) in a muted circle.
- `CardTitle` = `plant.name`.
- Species line = `plant.species?.name` or `dict.unknownSpecies` fallback.
- An **"En desarrollo"** `Badge` (variant muted/secondary) where category/growth-stage will go — rendered via `PlantSectionPlaceholder` inline or a `Badge` with `dict.comingSoon`.
- **No QR rendering in cards** (bandwidth — QR is base64; ADR-003).

### `plant-section-placeholder/plant-section-placeholder.tsx`

Reusable "coming soon" block. Props: `{ label: string }` (caller passes `dict.comingSoon` or a section-specific label).

Visual approach (matches existing muted style — there is **no shared `Skeleton` primitive**; the home module uses bespoke shimmer skeleton siblings, and `text-muted-foreground` is the codebase's muted convention):

```tsx
export function PlantSectionPlaceholder({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-center">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
```

Dashed border + `bg-muted/30` + muted text = clearly "intentional placeholder", not broken. This is the single source of the "En desarrollo" visual; reused on both list (badge-style) and detail (block-style) where appropriate.

### Skeletons

Mirror the home module: bespoke shimmer skeleton components are acceptable, but to keep the module small we use a single inline `PlantsListSkeleton` (a grid of `animate-pulse` muted cards) and a `PlantDetailSkeleton`. These live inside the screen files (or as sibling `.skeleton.tsx` if they grow). Loading state is driven by React Query `isLoading`, **not** `<Suspense>` (the hooks are `useQuery`, not suspense queries — matching `useSpaces`, which renders `data = []` while loading). ADR-004.

---

## 7. Presentation Layer — Screens

### `plants-list/plants-list.screen.tsx`

```tsx
'use client';
type Props = { dict: AppDict['plants']['list']; lang: string };
```

- Calls `usePlants()` (no arg).
- `<ScreenHeader title={dict.title} actions={<Button disabled>{dict.newPlant}</Button>} />` — "Nueva planta" rendered **disabled** (out of scope v1).
- While `isLoading` → `PlantsListSkeleton`.
- Empty (`plants.length === 0`) → `dict.empty` muted message.
- Otherwise → responsive grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`) of `PlantCard`.
- Category filter tabs: rendered as **visual-only disabled** chips (no API backing) or omitted in v1 — minimal version omits them to stay under budget; documented as follow-up.

### `plant-detail/plant-detail.screen.tsx`

```tsx
'use client';
type Props = { dict: AppDict['plants']['detail']; lang: string; plantId: string };
```

- Calls `usePlant(plantId)`.
- While `isLoading` → `PlantDetailSkeleton`.
- On error / not found → `dict.notFound` message.
- On success renders:
  - Header: `plant.name`, species name (or fallback), back link to `/${lang}/plants`.
  - Image: `plant.imageUrl` or letter-avatar fallback (larger).
  - QR block: only if `plant.qr` → `<img src={`data:image/png;base64,${plant.qr.image}`} alt={dict.qrAlt} />` (ADR-003 — QR only on detail).
  - "En desarrollo" sections via `PlantSectionPlaceholder` for: Cuidados (Riego/Sol/Suelo/Poda), Calendario, Asociaciones, Fotos, Plagas — each a placeholder block with its `dict.sections.*` label.

### Screen tests — `.test.tsx`

Mirror `spaces-list.screen.test.tsx`:
- `vi.mock('next/navigation', ...)` for `useRouter`/`useParams`.
- `vi.mock('.../use-plants/use-plants.hook', () => ({ usePlants: vi.fn(() => ({ data: [...], isLoading: false })) }))`.
- `vi.mock('.../screen-header/screen-header', ...)` to assert title.
- Provide a literal `dict` object matching the slice shape.
- List screen assertions: ScreenHeader renders `dict.title`; empty state renders `dict.empty` when `data: []`; renders N `PlantCard`s for N plants; renders "En desarrollo" badge text.
- Detail screen assertions: loading renders skeleton; success renders name + species + QR `<img>` when `qr` present and NOT when absent; placeholder sections render.

Where a screen genuinely needs the real query (not mocked), wrap in `QueryClientProvider` per the brief; default approach is mocking the hook (lighter, matches spaces).

---

## 8. i18n

`presentation/i18n/en.ts` (source of truth — `as const`, exports `PlantsDict` type):

```ts
const dict = {
  list: {
    title: 'Plant catalogue',
    empty: 'No plants in this space yet.',
    newPlant: 'New plant',
    unknownSpecies: 'Unknown species',
    comingSoon: 'In development',
  },
  detail: {
    back: 'Back to catalogue',
    species: 'Species',
    unknownSpecies: 'Unknown species',
    qrAlt: 'Plant QR code',
    notFound: 'Plant not found.',
    comingSoon: 'In development',
    sections: {
      care: 'Care',
      calendar: 'Calendar',
      associations: 'Associations',
      photos: 'Photos',
      pests: 'Pests',
    },
  },
  nav: 'Inventory',
} as const;

export default dict;
export type PlantsDict = typeof dict;
```

`presentation/i18n/es.ts` (mirror, `satisfies WidenStringLiterals<PlantsDict>` per the spaces pattern):

```ts
import type { PlantsDict } from './en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';

const dict = {
  list: {
    title: 'Catálogo de la huerta',
    empty: 'Todavía no hay plantas en este espacio.',
    newPlant: 'Nueva planta',
    unknownSpecies: 'Especie desconocida',
    comingSoon: 'En desarrollo',
  },
  detail: {
    back: 'Volver al catálogo',
    species: 'Especie',
    unknownSpecies: 'Especie desconocida',
    qrAlt: 'Código QR de la planta',
    notFound: 'Planta no encontrada.',
    comingSoon: 'En desarrollo',
    sections: {
      care: 'Cuidados',
      calendar: 'Calendario',
      associations: 'Asociaciones',
      photos: 'Fotos',
      pests: 'Plagas',
    },
  },
  nav: 'Inventario',
} as const satisfies WidenStringLiterals<PlantsDict>;

export default dict;
```

`i18n-parity.test.ts`: copy the spaces parity test verbatim (flatten keys of both dicts, assert symmetric difference is empty). Both `nav` and nested `sections.*` keys are covered by the recursive flatten.

### Register in `AppDict` — `get-dictionary.ts`

Add:
```ts
import type { PlantsDict } from '@/core/plants/presentation/i18n/en';
import enPlants from '@/core/plants/presentation/i18n/en';
import esPlants from '@/core/plants/presentation/i18n/es';
// AppDict += plants: WidenStringLiterals<PlantsDict>;
// dictionaries.en.plants = enPlants; dictionaries.es.plants = esPlants;
```

---

## 9. Next.js Pages (Server Components)

### `app/[lang]/(protected)/plants/page.tsx`

```tsx
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return <PlantsListScreen dict={dict.plants.list} lang={locale} />;
}
```

### `app/[lang]/(protected)/plants/[id]/page.tsx`

```tsx
export default async function Page({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return <PlantDetailScreen dict={dict.plants.detail} lang={locale} plantId={id} />;
}
```

Important correction vs. the brief: **pages do NOT read `spaceId` from cookies.** The active space lives in a client Zustand store (`useSpacesStore`), persisted to `localStorage` (`gardenia.activeSpaceId`), and is consumed by the axios interceptor + hooks on the client. There is no server-side cookie for space in this codebase. Pages only resolve the locale and slice the dict — identical to `spaces/page.tsx`. ADR-001.

Both pages sit under `(protected)` so the existing `(protected)/layout.tsx` guards auth.

---

## 10. Sidebar Nav

`src/shared/presentation/components/sidebar-nav-items/nav-items.ts` — append:

```ts
import { Home, LayoutGrid, Leaf } from 'lucide-react';
// ...
{
  label: 'Inventory', // TODO: i18n (matches existing 'Home'/'Spaces' literal style)
  href: '/[lang]/plants',
  icon: Leaf,
},
```

The existing nav uses literal labels with a `// TODO: i18n` marker and `/[lang]/...` href templating (resolved by `NavItem`/sidebar at runtime). We follow that exact (imperfect) convention rather than introducing a new i18n wiring in this change — consistency over local improvement. The `plants.nav` dict key exists for when nav i18n is wired project-wide.

---

## 11. Data Flow

```
Server Component page (resolves locale, slices dict)
        │  props: dict, lang[, plantId]
        ▼
'use client' Screen  ──calls──►  usePlants() / usePlant(id)
        │                              │
        │                              ▼
        │                       useQuery(['plants', spaceId])
        │                              │ reads currentSpaceId from useSpacesStore
        │                              ▼
        │                       GetPlantsUseCase.execute()
        │                              ▼
        │                       PlantsHttpRepository.list()
        │                              ▼
        │                       http.get('/plants')
        │                              │ interceptor adds Authorization + X-Space-ID
        │                              ▼
        │                       gardenia-api  GET /api/plants
        ▼
   renders PlantCard[] / detail sections + PlantSectionPlaceholder ("En desarrollo")
```

---

## 12. Component Trees

### List page
```
PlantsListScreen (dict, lang)
├── ScreenHeader (title, actions=<Button disabled> New plant)
└── conditional:
    ├── PlantsListSkeleton            (isLoading)
    ├── <p> dict.empty               (data.length === 0)
    └── grid
        └── PlantCard × N (plant, dict, lang)
            ├── img | letter-avatar
            ├── CardTitle name
            ├── species line
            └── Badge "En desarrollo" (PlantSectionPlaceholder badge variant)
```

### Detail page
```
PlantDetailScreen (dict, lang, plantId)
├── conditional PlantDetailSkeleton (isLoading)
├── conditional <p> dict.notFound   (error / undefined)
└── success:
    ├── header (back link, name, species)
    ├── img | letter-avatar (large)
    ├── QR <img data:image/png;base64> (only if plant.qr)
    └── sections grid
        ├── PlantSectionPlaceholder (Care)
        ├── PlantSectionPlaceholder (Calendar)
        ├── PlantSectionPlaceholder (Associations)
        ├── PlantSectionPlaceholder (Photos)
        └── PlantSectionPlaceholder (Pests)
```

---

## 13. Test Strategy (Strict TDD — `npx vitest run`)

| Layer | File | Approach |
|-------|------|----------|
| Use-cases | `*.use-case.spec.ts` | Pure units. Mock `IPlantsRepository` with `vi.fn()`. Assert pass-through + error propagation. |
| Repository | `plants-http.repository.spec.ts` | `vi.mock` the `http` client. Assert URLs (`/plants`, `/plants/:id`) and returned `res.data`. |
| Hooks | `*.hook.spec.ts` | `renderHook` + `QueryClientProvider`. Mock the use-case module + `useSpacesStore`. Assert success data and `enabled` gating. |
| Screens | `*.screen.test.tsx` | `render` + mock the hook, `next/navigation`, `ScreenHeader`. Assert DOM: title, empty, card count, "En desarrollo", QR presence/absence. |
| Placeholder | `plant-section-placeholder.test.tsx` | Render with a label; assert label text + dashed/muted classes present. |
| Card | `plant-card.test.tsx` | Render with a `Plant`; assert name, species fallback, image vs letter-avatar, link href, no QR. |
| i18n parity | `i18n-parity.test.ts` | Flatten en/es keys; assert symmetric difference empty. |

Each file is written **before** its implementation (red → green → refactor).

---

## 14. Delivery Plan (2 chained PRs, < 400 lines each)

- **PR1 — data layer**: domain interfaces, port, both use-cases + specs, HTTP repository + spec, both hooks + specs, i18n `en`/`es` + parity test, `get-dictionary.ts` registration.
- **PR2 — presentation layer**: `PlantCard`, `PlantSectionPlaceholder`, both screens + skeletons + tests, both Next.js pages, "Inventario" nav item.

PR2 depends on PR1 (presentation consumes PR1 hooks/use-cases/dict).

---

## 15. ADRs

### ADR-001 — Space identity lives in the axios interceptor + React Query key, not in call signatures
**Decision**: Repository and use-case methods take no `spaceId`. The shared axios interceptor injects `X-Space-ID` from `useSpacesStore.currentSpaceId`. Hooks include `currentSpaceId` only in the React Query key (cache scoping) and gate with `enabled: !!spaceId`. Pages do NOT read a space cookie (none exists; space is a client-side persisted store).
**Rationale**: Matches the established spaces pattern (`listByUser()` with no params). Avoids duplicating space state and threading it through Server Components, which cannot read the client store.
**Rejected**: `getPlants(spaceId)` per the brief — would duplicate interceptor responsibility and require server-side space resolution that doesn't exist here.

### ADR-002 — Plants use-cases are thin pass-throughs (no store write)
**Decision**: Unlike `ListSpacesUseCase` (which writes to `useSpacesStore`), plants use-cases just return repository data; caching is React Query's job.
**Rationale**: Plants are read-only view data with no cross-cutting global-state need. A Zustand store would be unused ceremony.
**Rejected**: A `plants.store.ts` — premature; add only when a feature needs global plant state.

### ADR-003 — QR rendered only on the detail page
**Decision**: `qr.image` (base64 PNG) is rendered via `<img src="data:image/png;base64,...">` on the detail page only; list cards never render QR.
**Rationale**: base64 payloads are heavy; rendering N of them in a grid wastes bandwidth/memory.

### ADR-004 — React Query loading states, not Suspense
**Decision**: Screens drive loading via `useQuery`'s `isLoading` + bespoke skeletons, not `<Suspense>`.
**Rationale**: The hooks are standard `useQuery` (matching `useSpaces`), not suspense queries. Mixing in Suspense would require `useSuspenseQuery` and Server-Component boundaries that don't fit the `'use client'` screen pattern.

### ADR-005 — Out-of-scope UI rendered as honest placeholders
**Decision**: "Nueva planta" is a disabled button; category filters omitted/visual-only; all unbacked detail sections render `PlantSectionPlaceholder` ("En desarrollo").
**Rationale**: Honest "coming soon" beats broken or fake-functional UI; keeps PRs small.

---

## 16. Open Questions / Assumptions to validate during apply

1. **Pagination shape**: Is `GET /api/plants` a bare `Plant[]` or `{ items, total, ... }`? Assumed bare array; if wrapped, `list()` maps `res.data.items` and the repo spec pins it. (Risk.)
2. **`isLocale` import path** for the detail page mirrors the spaces page — confirm during apply.
3. **Category filter chips**: omitted in v1 minimal to protect line budget; confirm with the product owner whether visual-only chips are wanted now.
