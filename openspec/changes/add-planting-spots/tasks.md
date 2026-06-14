# Tasks: add-planting-spots

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | PR1 ~320 lines · PR2 ~370 lines |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR1 (data layer) → PR2 (presentation layer) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Domain + application + infrastructure + i18n + dict registration | PR1 | Base: main; all pure TS/logic; no Next.js pages |
| 2 | Zod schema + hooks + components + screens + pages + nav entry | PR2 | Base: PR1 merged; depends on PR1 types, hooks, dict |

---

## Phase 1: Domain

- [ ] 1.1 Create `src/core/planting-spots/domain/interfaces/planting-spot.interface.ts` — `PlantingSpotType` union (`'raised_bed' | 'pot' | 'container' | 'field_section' | 'other'`) + `PlantingSpot` interface with fields `id, name, type, description?, userId, spaceId, createdAt, updatedAt`. No enum (ADR-004).

---

## Phase 2: Application

- [ ] 2.1 Create `src/core/planting-spots/application/interfaces/create-planting-spot-input.interface.ts` — `CreatePlantingSpotInput { name: string; type: PlantingSpotType; description?: string | null }`.
- [ ] 2.2 Create `src/core/planting-spots/application/interfaces/update-planting-spot-input.interface.ts` — `UpdatePlantingSpotInput { id: string; name?: string; type?: PlantingSpotType; description?: string | null }`.
- [ ] 2.3 Create `src/core/planting-spots/application/ports/planting-spots.repository.port.ts` — `IPlantingSpotsRepository { list(): Promise<PlantingSpot[]>; findById(id: string): Promise<PlantingSpot>; create(input): Promise<PlantingSpot>; update(input): Promise<PlantingSpot>; delete(id): Promise<void> }`. No `spaceId` param (ADR-001).
- [ ] 2.4 RED: Write `src/core/planting-spots/application/use-cases/get-planting-spots/get-planting-spots.use-case.spec.ts` — failing tests: "returns list from repository" + "propagates repository errors". Mock `IPlantingSpotsRepository` with `vi.fn()`.
- [ ] 2.5 GREEN: Create `src/core/planting-spots/application/use-cases/get-planting-spots/get-planting-spots.use-case.ts` — `GetPlantingSpotsUseCase.execute()` delegates to `repo.list()`. Export module singleton.
- [ ] 2.6 RED: Write `src/core/planting-spots/application/use-cases/get-planting-spot/get-planting-spot.use-case.spec.ts` — failing tests: "returns spot by id" + "called with id" + "propagates errors".
- [ ] 2.7 GREEN: Create `src/core/planting-spots/application/use-cases/get-planting-spot/get-planting-spot.use-case.ts` — `GetPlantingSpotUseCase.execute(id)` delegates to `repo.findById(id)`. Export singleton.
- [ ] 2.8 RED: Write `src/core/planting-spots/application/use-cases/create-planting-spot/create-planting-spot.use-case.spec.ts` — failing tests: "calls repo.create with input" + "returns created spot".
- [ ] 2.9 GREEN: Create `src/core/planting-spots/application/use-cases/create-planting-spot/create-planting-spot.use-case.ts` — `CreatePlantingSpotUseCase.execute(input)` delegates to `repo.create(input)`. Export singleton.
- [ ] 2.10 RED: Write `src/core/planting-spots/application/use-cases/update-planting-spot/update-planting-spot.use-case.spec.ts` — failing tests: "calls repo.update with input" + "returns updated spot".
- [ ] 2.11 GREEN: Create `src/core/planting-spots/application/use-cases/update-planting-spot/update-planting-spot.use-case.ts` — `UpdatePlantingSpotUseCase.execute(input)` delegates to `repo.update(input)`. Export singleton.
- [ ] 2.12 RED: Write `src/core/planting-spots/application/use-cases/delete-planting-spot/delete-planting-spot.use-case.spec.ts` — failing tests: "calls repo.delete with id" + "resolves void".
- [ ] 2.13 GREEN: Create `src/core/planting-spots/application/use-cases/delete-planting-spot/delete-planting-spot.use-case.ts` — `DeletePlantingSpotUseCase.execute(id)` delegates to `repo.delete(id)`. Export singleton.

---

## Phase 3: Infrastructure

- [ ] 3.1 Create `src/core/planting-spots/infrastructure/repositories/graphql/queries/planting-spots-find-by-criteria.query.ts` — `PLANTING_SPOTS_FIND_BY_CRITERIA` gql document; selects `items { id name type description userId spaceId createdAt updatedAt }`.
- [ ] 3.2 Create `src/core/planting-spots/infrastructure/repositories/graphql/queries/planting-spot-find-by-id.query.ts` — `PLANTING_SPOT_FIND_BY_ID` gql document; variables `$input: PlantingSpotFindByIdRequestDto!`.
- [ ] 3.3 Create `src/core/planting-spots/infrastructure/repositories/graphql/mutations/planting-spot-create.mutation.ts` — `PLANTING_SPOT_CREATE` gql document; variables `$input: PlantingSpotCreateRequestDto!`; returns `{ id success message }`.
- [ ] 3.4 Create `src/core/planting-spots/infrastructure/repositories/graphql/mutations/planting-spot-update.mutation.ts` — `PLANTING_SPOT_UPDATE` gql document; variables `$input: PlantingSpotUpdateRequestDto!`; returns `{ id success message }`.
- [ ] 3.5 Create `src/core/planting-spots/infrastructure/repositories/graphql/mutations/planting-spot-delete.mutation.ts` — `PLANTING_SPOT_DELETE` gql document; variables `$input: PlantingSpotDeleteRequestDto!`; returns `{ id success message }`.
- [ ] 3.6 Create response type files in `infrastructure/repositories/graphql/responses/` — one interface per GQL operation: `PlantingSpotsFindByCriteriaResponse`, `PlantingSpotFindByIdResponse`, `PlantingSpotCreateResponse`, `PlantingSpotUpdateResponse`, `PlantingSpotDeleteResponse`.
- [ ] 3.7 RED: Write `src/core/planting-spots/infrastructure/repositories/graphql/planting-spots.gql.repository.spec.ts` — `vi.mock('@/shared/infrastructure/http/apollo.client', () => ({ apolloClient: { query: vi.fn(), mutate: vi.fn() } }))`. Tests: "list() returns items from plantingSpotsFindByCriteria.items", "findById() returns spot or throws on null", "create() mutates then re-fetches via findById", "update() mutates then re-fetches via findById", "delete() calls mutate with input { id }".
- [ ] 3.8 GREEN: Create `src/core/planting-spots/infrastructure/repositories/graphql/planting-spots.gql.repository.ts` — `PlantingSpotsGqlRepository implements IPlantingSpotsRepository`; imports `apolloClient`; implements all five methods (list/findById/create/update/delete); export singleton `plantingSpotsGqlRepository`.

---

## Phase 4: i18n + Dict Registration

- [ ] 4.1 Create `src/core/planting-spots/presentation/i18n/en.ts` — `as const` dict with `list.*`, `form.*`, `types.*`, `nav` keys; exports `PlantingSpotsDict` type. Keys: `list.title`, `list.empty`, `list.new`; `form.titleCreate`, `form.titleEdit`, `form.name`, `form.type`, `form.description`, `form.save`, `form.saving`, `form.delete`, `form.deleteConfirm`, `form.cancel`; `types.raised_bed`, `types.pot`, `types.container`, `types.field_section`, `types.other`; `nav`.
- [ ] 4.2 Create `src/core/planting-spots/presentation/i18n/es.ts` — Castellano de España (tuteo). Mirror of `en.ts`; `as const satisfies WidenStringLiterals<PlantingSpotsDict>`. Translations: `list.title` → "Zonas de cultivo", `types.raised_bed` → "Bancal", `types.pot` → "Maceta", `types.container` → "Contenedor", `types.field_section` → "Sección de campo", `types.other` → "Otro".
- [ ] 4.3 RED+GREEN: Create `src/core/planting-spots/presentation/i18n/i18n-parity.test.ts` — flatten keys of both dicts recursively; assert symmetric difference is empty at all nesting levels.
- [ ] 4.4 Update `src/shared/presentation/i18n/get-dictionary.ts` — import `PlantingSpotsDict` type + `enPlantingSpots` / `esPlantingSpots`; add `plantingSpots: WidenStringLiterals<PlantingSpotsDict>` to `AppDict`; add to `dictionaries.en` and `dictionaries.es`.

---

## Phase 5: Zod Schema

- [ ] 5.1 Create `src/core/planting-spots/presentation/schemas/planting-spot.schema.ts` — `PLANTING_SPOT_TYPES` tuple `as const`; `plantingSpotSchema` with `name: z.string().min(1)`, `type: z.enum(PLANTING_SPOT_TYPES)`, `description: z.string().optional()`; export `PlantingSpotFormValues = z.infer<typeof plantingSpotSchema>`.

---

## Phase 6: Presentation Hooks

- [ ] 6.1 RED: Write `src/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook.spec.ts` — failing tests: "returns spots data on success" + "stays idle when spaceId is null". Mock use-case module + `useSpacesStore`.
- [ ] 6.2 GREEN: Create `src/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook.ts` — `usePlantingSpots()` using `useQuery(['planting-spots', spaceId])`, `enabled: !!spaceId`.
- [ ] 6.3 RED: Write `src/core/planting-spots/presentation/hooks/use-planting-spot/use-planting-spot.hook.spec.ts` — failing tests: "returns spot on success" + "stays idle when spaceId or id is null".
- [ ] 6.4 GREEN: Create `src/core/planting-spots/presentation/hooks/use-planting-spot/use-planting-spot.hook.ts` — `usePlantingSpot(id)` using `useQuery(['planting-spot', spaceId, id])`, `enabled: !!spaceId && !!id`.
- [ ] 6.5 RED: Write `src/core/planting-spots/presentation/hooks/use-create-planting-spot/use-create-planting-spot.hook.spec.ts` — failing tests: "calls createPlantingSpotUseCase.execute with input" + "invalidates planting-spots query on success".
- [ ] 6.6 GREEN: Create `src/core/planting-spots/presentation/hooks/use-create-planting-spot/use-create-planting-spot.hook.ts` — `useCreatePlantingSpot()` using `useMutation`; `onSuccess` invalidates `['planting-spots', spaceId]`.
- [ ] 6.7 RED: Write `src/core/planting-spots/presentation/hooks/use-update-planting-spot/use-update-planting-spot.hook.spec.ts` — failing tests: "calls updatePlantingSpotUseCase.execute with input" + "invalidates list and detail queries on success".
- [ ] 6.8 GREEN: Create `src/core/planting-spots/presentation/hooks/use-update-planting-spot/use-update-planting-spot.hook.ts` — `useUpdatePlantingSpot()` using `useMutation`; `onSuccess` invalidates `['planting-spots', spaceId]` and `['planting-spot', spaceId, id]`.
- [ ] 6.9 RED: Write `src/core/planting-spots/presentation/hooks/use-delete-planting-spot/use-delete-planting-spot.hook.spec.ts` — failing tests: "calls deletePlantingSpotUseCase.execute with id" + "invalidates planting-spots query on success".
- [ ] 6.10 GREEN: Create `src/core/planting-spots/presentation/hooks/use-delete-planting-spot/use-delete-planting-spot.hook.ts` — `useDeletePlantingSpot()` using `useMutation`; `onSuccess` invalidates `['planting-spots', spaceId]`.

---

## Phase 7: Components

- [ ] 7.1 RED: Write `src/core/planting-spots/presentation/components/planting-spot-type-badge/planting-spot-type-badge.test.tsx` — failing tests: "renders localized label for each type" + "renders a Badge element".
- [ ] 7.2 GREEN: Create `src/core/planting-spots/presentation/components/planting-spot-type-badge/planting-spot-type-badge.tsx` — `'use client'`; `PlantingSpotTypeBadge({ type, dict })` renders `<Badge variant="secondary">{dict[type]}</Badge>`.
- [ ] 7.3 RED: Write `src/core/planting-spots/presentation/components/planting-spot-card/planting-spot-card.test.tsx` — failing tests: "renders spot name", "renders PlantingSpotTypeBadge", "renders description when present", "renders link to /lang/planting-spots/id/edit".
- [ ] 7.4 GREEN: Create `src/core/planting-spots/presentation/components/planting-spot-card/planting-spot-card.tsx` — `'use client'`; `PlantingSpotCard({ spot, dict, lang })`; `Card` linking to `/${lang}/planting-spots/${spot.id}/edit`; `CardTitle` = `spot.name`; `PlantingSpotTypeBadge`; optional `spot.description` clamped to 2 lines.

---

## Phase 8: Screens

- [ ] 8.1 RED: Write `src/core/planting-spots/presentation/screens/planting-spots-list/planting-spots-list.screen.test.tsx` — failing tests: "renders ScreenHeader with dict.title", "renders skeleton grid when isLoading", "renders empty message when data is []", "renders one PlantingSpotCard per spot". Mock `usePlantingSpots`, `ScreenHeader`, `next/navigation`.
- [ ] 8.2 GREEN: Create `src/core/planting-spots/presentation/screens/planting-spots-list/planting-spots-list.screen.tsx` — `'use client'`; `PlantingSpotsListScreen({ dict, lang })`; calls `usePlantingSpots()`; `ScreenHeader` with "New" button linking to `/${lang}/planting-spots/new`; skeleton on `isLoading`; empty state; responsive grid of `PlantingSpotCard`.
- [ ] 8.3 RED: Write `src/core/planting-spots/presentation/screens/planting-spot-form/planting-spot-form.screen.test.tsx` — failing tests: "renders create title in create mode", "renders edit title in edit mode", "pre-fills form fields in edit mode", "calls createPlantingSpot.mutate on submit in create mode", "calls updatePlantingSpot.mutate on submit in edit mode", "renders delete button only in edit mode", "shows AlertDialog on delete click". Mock `usePlantingSpot`, `useCreatePlantingSpot`, `useUpdatePlantingSpot`, `useDeletePlantingSpot`, `next/navigation`.
- [ ] 8.4 GREEN: Create `src/core/planting-spots/presentation/screens/planting-spot-form/planting-spot-form.screen.tsx` — `'use client'`; `PlantingSpotFormScreen({ dict, lang, mode, spotId? })`; React Hook Form + `plantingSpotSchema`; `name` Input, `type` Select, `description` Textarea; submit calls create or update use-case; on success redirect to list; edit mode: pre-fill from `usePlantingSpot(spotId)`, delete button with `AlertDialog` confirmation (ADR-005).

---

## Phase 9: Next.js Pages + Nav

- [ ] 9.1 Create `app/[lang]/(protected)/planting-spots/page.tsx` — async Server Component; `await params`; `isLocale` guard; `getDictionary(locale)`; renders `<PlantingSpotsListScreen dict={dict.plantingSpots.list} lang={locale} />`.
- [ ] 9.2 Create `app/[lang]/(protected)/planting-spots/new/page.tsx` — async Server Component; `await params`; `isLocale` guard; `getDictionary(locale)`; renders `<PlantingSpotFormScreen dict={dict.plantingSpots.form} lang={locale} mode="create" />`.
- [ ] 9.3 Create `app/[lang]/(protected)/planting-spots/[id]/edit/page.tsx` — async Server Component; `await params`; `isLocale` guard; `getDictionary(locale)`; renders `<PlantingSpotFormScreen dict={dict.plantingSpots.form} lang={locale} mode="edit" spotId={id} />`.
- [ ] 9.4 Update `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` — import `MapPin` from `lucide-react`; append nav item `{ label: 'Planting spots', href: '/[lang]/planting-spots', icon: MapPin }` (ADR-005; label from `dict.plantingSpots.nav` at runtime).
