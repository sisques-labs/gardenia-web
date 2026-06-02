# Exploration: plants-module

## Current State

### Backend API (gardenia-api) — NestJS + CQRS + TypeORM

| Endpoint | Auth | Space Header | Response |
|----------|------|-------------|---------|
| `GET /api/plants` | JWT | Required | `{ items: Plant[], total, page, perPage }` |
| `GET /api/plants/:id` | JWT | Required | `PlantRestResponseDto` |
| `POST /api/plants` | JWT | Required | `PlantRestResponseDto` |
| `PATCH /api/plants/:id` | JWT | Required | `PlantRestResponseDto` |
| `DELETE /api/plants/:id` | JWT | Required | 204 |
| `GET /api/plant-species` | JWT | Not required | `{ items: Species[], total, page, perPage }` |

**`PlantRestResponseDto` fields**: `id`, `name`, `plantSpeciesId?`, `species?` (`{id, name, createdAt, updatedAt}`), `imageUrl?`, `userId`, `spaceId`, `qr?` (`{id, spaceId, targetUrl, generation, image (base64 PNG), createdAt, updatedAt}`), `createdAt`, `updatedAt`.

**No existing plants code in gardenia-web** — greenfield module.

---

## UI Mockup Analysis

### List Page — "Catálogo de la huerta"

- Header: title + "Nueva planta" CTA
- Category filter tabs: Todas | Hortaliza | Aromática | Hoja | Raíz | Flor | Árbol + "Filtros" button
- Grid of plant cards: thumbnail (or letter abbreviation), common name, scientific species name, category tag, growth stage badge, quick action buttons

### Detail Page — "Ficha de planta"

- Breadcrumb: Inventario > Hortalizas > [plant name]
- Header: plant name + QR print button + quick actions
- Tab nav: **Cuidados** | Calendario | Asociaciones
- Cuidados tab: cards for Riego, Sol, Suelo, Poda
- Growth stage timeline: Semilla → Plántula → Vegetativa → Fructificación
- Photo history: "Historial fotográfico" + "Subir foto del día"
- Pest list: e.g. "Pulgón verde / en control"

---

## Gap Analysis

| UI Section | Available from API? |
|-----------|-------------------|
| name, imageUrl, species.name, qr.image, createdAt | ✅ Yes |
| Category / type tag | ❌ En desarrollo |
| Growth stage (ciclo) | ❌ En desarrollo |
| Watering schedule (Riego) | ❌ En desarrollo |
| Sun requirements (Sol) | ❌ En desarrollo |
| Soil type (Suelo) | ❌ En desarrollo |
| Pruning notes (Poda) | ❌ En desarrollo |
| Photo history | ❌ En desarrollo |
| Pest tracking | ❌ En desarrollo |
| Calendar tab content | ❌ En desarrollo |
| Associations tab content | ❌ En desarrollo |

Only the plant's name, optional image, optional species name, QR code, and timestamps are fully available. All care/cycle sections → "En desarrollo".

---

## Frontend Patterns (spaces module — reference)

Layer stack at `src/core/{context}/{layer}/`:

1. `domain/interfaces/plant.interface.ts` — plain TS interface
2. `application/ports/plants.repository.port.ts` — repository interface
3. `application/use-cases/{name}/` — class + `.spec.ts` (Vitest + vi.fn())
4. `infrastructure/repositories/plants-http.repository.ts` — axios client with JWT + X-Space-ID interceptors
5. `presentation/hooks/use-{name}/` — React Query (`useQuery`) wrapping use-case
6. `presentation/screens/` — `'use client'` screens receiving `dict` prop
7. `presentation/i18n/en.ts` + `es.ts` + `i18n-parity.test.ts`

**Page pattern**: async Server Component (`app/[lang]/(protected)/plants/page.tsx`) calls `getDictionary(locale)`, passes dict slice to Screen component.

**Suspense pattern**: each section in `<Suspense fallback={<Skeleton />}>` with shimmer skeletons.

**Shared components available**: `Card`, `Badge`, `Button`, `Input`, `ScreenHeader` (breadcrumbs + actions), AppShell auto-wraps all protected pages.

---

## Route Structure

```
app/[lang]/(protected)/plants/
  page.tsx          → PlantsListScreen
  [id]/
    page.tsx        → PlantDetailScreen
```

Both auto-protected by the existing `(protected)/layout.tsx` — no middleware changes needed.

---

## i18n Requirements

Add `plants` to `AppDict` in `get-dictionary.ts`. Minimum keys:

```
plants.list.title, newPlant, empty, filterAll, inProgress
plants.detail.breadcrumbList, qrPrint, noImage, noSpecies
plants.detail.tabs.care, calendar, associations
plants.detail.sections.care.{title,inProgress}
plants.detail.sections.cycle.{title,inProgress}
plants.detail.sections.photoHistory.{title,inProgress}
plants.detail.sections.pests.{title,inProgress}
```

Required in both `en` and `es`. Parity enforced by new `i18n-parity.test.ts`.

---

## Open Questions (resolved)

1. **Pagination**: API defaults work. Fetch all for now. Pagination UI is a follow-up.
2. **Category filter tabs**: No API backing → render tabs as visual placeholders ("Todas" active, others disabled) in v1.
3. **"Nueva planta" button**: Exclude from this PR. Show as disabled with tooltip.
4. **Sidebar nav**: `NAV_ITEMS` needs an "Inventario" entry with `Leaf` icon → `/[lang]/plants`.
5. **QR on detail**: `qr.image` is base64 PNG → `<img src="data:image/png;base64,..." />`. Detail page only — don't render in list cards.

---

## Affected Areas

- `src/core/plants/` — new module (all 4 layers)
- `src/shared/presentation/i18n/get-dictionary.ts` — add plants dict
- `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` — add Inventario nav item
- `app/[lang]/(protected)/plants/page.tsx` — new
- `app/[lang]/(protected)/plants/[id]/page.tsx` — new

---

## Approaches Considered

| Approach | Pros | Cons |
|----------|------|------|
| **A. Full DDD layers (mirror spaces)** | Consistent, testable, follows conventions | More boilerplate |
| **B. Thin (skip use-cases)** | Fewer files | Breaks architecture, creates bad precedent |
| **C. Server Components with direct fetch** | Simple | Plants need X-Space-ID at request time (client auth header) — can't do in pure SC |

**Recommendation**: Option A — mirror spaces module exactly. 2 chained PRs.

---

## Risks

1. Detail page will look sparse — most content is "En desarrollo"
2. Category filter tabs have no API backing — disabled in v1
3. Strict TDD active — tests-first adds ~30-40% overhead
4. Full module with tests will be 300-450+ lines → chained PRs mandatory
5. `qr.image` is base64 — avoid loading on list cards (bandwidth)
