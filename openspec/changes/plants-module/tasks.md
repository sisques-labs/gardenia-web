# Tasks: plants-module

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | PR1 ~280 lines · PR2 ~310 lines |
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
| 2 | Components + screens + pages + nav entry | PR2 | Base: PR1 merged to main; depends on PR1 types, hooks, dict |

---

## Phase 1: Domain

- [ ] 1.1 Create `src/core/plants/domain/interfaces/plant.interface.ts` — `Plant`, `PlantSpecies`, `PlantQr` interfaces (mirrors `PlantRestResponseDto`; species/imageUrl/qr optional). Satisfies: CC1.

---

## Phase 2: Application

- [ ] 2.1 Create `src/core/plants/application/ports/plants.repository.port.ts` — `IPlantsRepository { list(): Promise<Plant[]>; getById(id: string): Promise<Plant> }`. No `spaceId` param (ADR-001). Satisfies: CC1, CC2.
- [ ] 2.2 RED: Write `src/core/plants/application/use-cases/get-plants/get-plants.use-case.spec.ts` — failing tests: "returns plants from repository" + "propagates repository errors". Satisfies: CC5.
- [ ] 2.3 GREEN: Create `src/core/plants/application/use-cases/get-plants/get-plants.use-case.ts` — `GetPlantsUseCase.execute()` delegates to `plantsRepository.list()`. Satisfies: CC1, CC2.
- [ ] 2.4 RED: Write `src/core/plants/application/use-cases/get-plant/get-plant.use-case.spec.ts` — failing tests: "fetches single plant by id" + "propagates repository errors". Satisfies: CC5.
- [ ] 2.5 GREEN: Create `src/core/plants/application/use-cases/get-plant/get-plant.use-case.ts` — `GetPlantUseCase.execute(id)` delegates to `plantsRepository.getById(id)`. Satisfies: CC1, CC2.

---

## Phase 3: Infrastructure

- [ ] 3.1 RED: Write `src/core/plants/infrastructure/repositories/plants-http.repository.spec.ts` — failing tests: "list() calls GET /plants and returns data" + "getById() calls GET /plants/:id and returns data". Mock `@/shared/infrastructure/http/axios.client`. Satisfies: CC5.
- [ ] 3.2 GREEN: Create `src/core/plants/infrastructure/repositories/plants-http.repository.ts` — `PlantsHttpRepository` implements `IPlantsRepository`; reuses shared `http` axios instance; exports singleton `plantsHttpRepository`. Note: if `GET /api/plants` returns `{ items, ... }` instead of bare array, map `res.data.items`. Satisfies: CC3.

---

## Phase 4: i18n + Dict Registration

- [ ] 4.1 Create `src/core/plants/presentation/i18n/en.ts` — `as const` dict with `list.*`, `detail.*`, `nav` keys; exports `PlantsDict` type. Satisfies: R1.8.
- [ ] 4.2 Create `src/core/plants/presentation/i18n/es.ts` — mirror of `en.ts`; `as const satisfies WidenStringLiterals<PlantsDict>`. Satisfies: R1.8.
- [ ] 4.3 RED+GREEN: Create `src/core/plants/presentation/i18n/i18n-parity.test.ts` — flatten keys of both dicts; assert symmetric difference is empty at all nesting levels. Satisfies: R1.8, BDD Scenario 7.
- [ ] 4.4 Update `src/shared/presentation/i18n/get-dictionary.ts` — import `PlantsDict` type + `enPlants`/`esPlants`; add `plants` to `AppDict` type; add to `dictionaries.en` and `dictionaries.es`. Satisfies: CC4.

---

## Phase 5: Presentation Hooks

- [ ] 5.1 RED: Write `src/core/plants/presentation/hooks/use-plants/use-plants.hook.spec.ts` — failing tests: "returns plant data on success" + "stays idle when spaceId is null". Mock use-case module + `useSpacesStore`. Satisfies: CC5.
- [ ] 5.2 GREEN: Create `src/core/plants/presentation/hooks/use-plants/use-plants.hook.ts` — `usePlants()` using `useQuery(['plants', spaceId])`, `enabled: !!spaceId`, instantiates `GetPlantsUseCase` at module scope. Satisfies: CC2, R1.4.
- [ ] 5.3 RED: Write `src/core/plants/presentation/hooks/use-plant/use-plant.hook.spec.ts` — failing tests: "returns plant detail on success" + "stays idle when spaceId is null". Mock use-case module + `useSpacesStore`. Satisfies: CC5.
- [ ] 5.4 GREEN: Create `src/core/plants/presentation/hooks/use-plant/use-plant.hook.ts` — `usePlant(id)` using `useQuery(['plant', spaceId, id])`, `enabled: !!spaceId && !!id`. Satisfies: CC2, R2.12.

---

## Phase 6: Components

- [ ] 6.1 RED: Write `src/core/plants/presentation/components/plant-section-placeholder/plant-section-placeholder.test.tsx` — failing tests: "renders label text" + "applies dashed border and muted bg classes". Satisfies: CC5.
- [ ] 6.2 GREEN: Create `src/core/plants/presentation/components/plant-section-placeholder/plant-section-placeholder.tsx` — `PlantSectionPlaceholder({ label })` with dashed border + `bg-muted/30` + `text-muted-foreground`. Satisfies: R1.2, R2.6–R2.9.
- [ ] 6.3 RED: Write `src/core/plants/presentation/components/plant-card/plant-card.test.tsx` — failing tests: "renders plant name", "renders species or unknownSpecies fallback", "renders img when imageUrl present else letter-avatar", "renders link to /lang/plants/id", "does NOT render QR". Satisfies: CC5.
- [ ] 6.4 GREEN: Create `src/core/plants/presentation/components/plant-card/plant-card.tsx` — `PlantCard({ plant, dict, lang })`; image or letter-avatar; `CardTitle`; species line; `PlantSectionPlaceholder` badge; link to `/${lang}/plants/${plant.id}`; no QR (ADR-003). Satisfies: R1.2, BDD Scenario 1, BDD Scenario 9.

---

## Phase 7: Screens

- [ ] 7.1 RED: Write `src/core/plants/presentation/screens/plants-list/plants-list.screen.test.tsx` — failing tests: "renders ScreenHeader with dict.list.title", "renders skeleton when isLoading", "renders empty state when data is []", "renders PlantCard per plant". Mock `usePlants`, `ScreenHeader`, `next/navigation`. Satisfies: CC5.
- [ ] 7.2 GREEN: Create `src/core/plants/presentation/screens/plants-list/plants-list.screen.tsx` — `'use client'`; calls `usePlants()`; skeleton on `isLoading`; empty message on 0 results; responsive grid of `PlantCard`; `ScreenHeader` with disabled "Nueva planta" button; `PlantsListSkeleton` inline component. Satisfies: R1.3, R1.4, R1.5, CC4, BDD Scenarios 1–3.
- [ ] 7.3 RED: Write `src/core/plants/presentation/screens/plant-detail/plant-detail.screen.test.tsx` — failing tests: "renders skeleton when isLoading", "renders plant name + species", "renders QR img only when plant.qr is present", "renders PlantSectionPlaceholder for each section", "renders notFound message on error". Mock `usePlant`, `next/navigation`. Satisfies: CC5.
- [ ] 7.4 GREEN: Create `src/core/plants/presentation/screens/plant-detail/plant-detail.screen.tsx` — `'use client'`; calls `usePlant(plantId)`; skeleton on `isLoading`; error/notFound fallback; header with back link + name + species; image or letter-avatar; QR `<img data:image/png;base64>` only if `plant.qr`; `PlantSectionPlaceholder` for each unbacked section; `PlantDetailSkeleton` inline component. Satisfies: R2.2–R2.12, BDD Scenarios 4–6.

---

## Phase 8: Next.js Pages + Nav

- [ ] 8.1 Create `app/[lang]/(protected)/plants/page.tsx` — async Server Component; `await params`; `isLocale` guard; `getDictionary(locale)`; renders `<PlantsListScreen dict={dict.plants.list} lang={locale} />`. Satisfies: R1.1, CC4.
- [ ] 8.2 Create `app/[lang]/(protected)/plants/[id]/page.tsx` — async Server Component; `await params`; `isLocale` guard; `getDictionary(locale)`; renders `<PlantDetailScreen dict={dict.plants.detail} lang={locale} plantId={id} />`. Satisfies: R2.1, CC4.
- [ ] 8.3 Update `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` — append `{ label: 'Inventory', href: '/[lang]/plants', icon: Leaf }` (import `Leaf` from `lucide-react`; follows existing literal-label convention). Satisfies: R1.7, BDD Scenario 8.
