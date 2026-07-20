# Technical Design: plant-identification-web

## 0. Context & Constraints

- Stack: Next.js 16 (App Router), TypeScript strict, React 19, Axios
  (multipart upload), Apollo Client v4 (GraphQL), TanStack Query v5, React
  Hook Form + Zod, Vitest + Testing Library, Storybook (mandatory).
- Architecture: DDD + Hexagonal under `src/core/{context}/{layer}/`.
- Strict TDD: RED before GREEN.
- Direct reference: `gardenia-api`'s paired `plant-identification` change
  for the exact API shape. Endpoints:
  - `POST /api/plant-identifications` (multipart: `photos` field, multiple
    files; `organs` field, JSON array index-aligned to `photos`) → REST
    JSON response `{ id, status, resolved: { gbifKey, scientificName } |
    null, candidates: [{ scientificName, commonNames, score }], photos: [{
    url, organ }], createdAt }`.
  - GraphQL `plantIdentifications(input: CriteriaInput): PlantIdentification
    Page!` (paginated, space-scoped).
  - GraphQL `createPlantFromIdentification(input: { identificationId, name,
    imageUrl }): CreatedEntity!`.

## Architecture Decisions

### ADR-001 — `plant-identification` is its own bounded context, not folded into `plants`

Same reasoning as `plant-photos`: it's a distinct capability with its own
lifecycle (an identification exists independently of any `Plant` until/unless
converted). `IdentifyPlantScreen` is a standalone route
(`/plants/identify`), not a tab inside the plant detail or create-plant flow.

### ADR-002 — One repository, two transports underneath

`IPlantIdentificationsRepository` exposes `identify()` (REST/axios,
multipart), `findByCriteria()` and `createPlantFromIdentification()`
(GraphQL/Apollo) as methods of the *same* port/repository pair, rather than
splitting into an HTTP repository and a GQL repository like some other
modules do. Rationale: unlike `plant-photos` (where every operation —
upload, list, delete — is REST because the api never added GraphQL reads for
it), here only the binary-upload operation is REST-constrained; the other
two are GraphQL like the rest of this app's read/write traffic. A one-off
axios call *inside* `PlantIdentificationGqlRepository` (alongside its
Apollo-backed methods) is simpler than maintaining two separate repository
files, two separate ports, and wiring both into every hook/use-case that
might need either. This is a deliberate, scoped exception — not a new
default pattern; the docstring on the repository class says so explicitly.

### ADR-003 — Multi-photo, per-photo organ, client-side before submit

The photo picker lets the user add several photos and pick an organ per
photo *before* submitting — one `IdentifyPlantUseCase.execute()` call sends
everything in a single multipart request (matches the api's "one PlantNet
call per identification" design). No per-photo upload progress UI in v1
(single request either succeeds or fails as a whole) — a future iteration
could stream per-file progress if multipart chunking is added later.

### ADR-004 — Result rendering distinguishes "resolved", "no_match", and error

The screen's result state has three distinct visual treatments:
1. **Resolved** — species name + confidence badge, "Crear planta con esta
   especie" CTA, full candidate list collapsed under a "ver otras
   posibilidades" disclosure.
2. **No match** — no CTA, candidate list shown directly (if any came back)
   with a message explaining none was confident enough, plus a link to the
   existing manual "Crear planta" flow (`SpeciesCombobox`) as the fallback.
3. **Provider error / quota exceeded** — the api returns 502/429 for these
   (does not persist an identification); the screen shows a retryable error
   state, distinct from "no match", using the existing toast/alert pattern.

### ADR-005 — Create-from-identification is a small dedicated modal, not `CreatePlantModal` reuse

`CreatePlantModal` asks for name + optional species search + optional image
URL — most of that is redundant once an identification already resolved a
species and has real uploaded photos. `CreatePlantFromIdentificationModal`
asks only for `name` (RHF + Zod, `min(1).max(100)`, same constraint as
`createPlantSchema.name`) and defaults `imageUrl` to the identification's
first submitted photo's `url` (not user-editable in v1). On submit it calls
`createPlantFromIdentification`, not the generic `createPlant` mutation —
this is what lets the api stamp `convertedToPlantId` back onto the
identification, which the generic mutation has no way to do.

### ADR-006 — Recent-identifications list is inline, not a route

`usePlantIdentifications(spaceId)` fetches the first page (e.g. 5) sorted by
`createdAt` desc and renders a compact list under the identify form on the
same screen — no new route, no table/pagination controls in v1. A dedicated
history page is deferred (see proposal.md's out-of-scope list); this keeps
the feature's footprint proportionate to a v1 that's mainly about the
identify-and-convert loop, not archival browsing.

---

## 1. Module Structure

```
src/core/plant-identification/
  domain/
    interfaces/
      plant-identification.interface.ts        # PlantIdentification, PlantIdentificationPhoto, PlantIdentificationCandidate
      plant-identification-organ.type.ts        # 'leaf' | 'flower' | 'fruit' | 'bark' | 'habit' | 'other'
  application/
    ports/
      plant-identifications.repository.port.ts  # IPlantIdentificationsRepository
    interfaces/
      identify-plant-input.interface.ts         # { photos: { file: File; organ: PlantIdentificationOrgan }[] }
      create-plant-from-identification-input.interface.ts  # { identificationId, name }
    use-cases/
      identify-plant/
        identify-plant.use-case.ts
        identify-plant.use-case.spec.ts
      get-plant-identifications/
        get-plant-identifications.use-case.ts
        get-plant-identifications.use-case.spec.ts
      create-plant-from-identification/
        create-plant-from-identification.use-case.ts
        create-plant-from-identification.use-case.spec.ts
  infrastructure/
    repositories/
      graphql/
        queries/
          plant-identifications.query.ts
        mutations/
          create-plant-from-identification.mutation.ts
        plant-identification.gql.repository.ts   # implements IPlantIdentificationsRepository; identify() uses axios internally, see ADR-002
        plant-identification.gql.repository.spec.ts
  presentation/
    hooks/
      use-identify-plant/
        use-identify-plant.hook.ts
        use-identify-plant.hook.spec.ts
      use-plant-identifications/
        use-plant-identifications.hook.ts
        use-plant-identifications.hook.spec.ts
      use-create-plant-from-identification/
        use-create-plant-from-identification.hook.ts
        use-create-plant-from-identification.hook.spec.ts
    schemas/
      create-plant-from-identification.schema.ts
    components/
      photo-organ-picker/
        photo-organ-picker.tsx
        photo-organ-picker.spec.tsx
        photo-organ-picker.stories.tsx
      identification-result-panel/
        identification-result-panel.tsx
        identification-result-panel.spec.tsx
        identification-result-panel.stories.tsx
      create-plant-from-identification-modal/
        create-plant-from-identification-modal.tsx
        create-plant-from-identification-modal.spec.tsx
        create-plant-from-identification-modal.stories.tsx
      recent-identifications-list/
        recent-identifications-list.tsx
        recent-identifications-list.spec.tsx
        recent-identifications-list.stories.tsx
    screens/
      identify-plant/
        identify-plant.screen.tsx
        identify-plant.screen.spec.tsx
        identify-plant.screen.stories.tsx
    i18n/
      en.ts
      es.ts
      i18n-parity.test.ts
```

Plus:
- `app/[lang]/(protected)/plants/identify/page.tsx` (server component, calls
  `getDictionary(lang)`, renders `<IdentifyPlantScreen dict={...} />`).
- Update `src/core/plants/presentation/screens/plants-list/plants-list.screen.tsx`
  — add "Identificar planta" button linking to `/[lang]/plants/identify`.
- Update `src/shared/presentation/i18n/get-dictionary.ts` — register
  `plantIdentification`.

## 2. Domain

```typescript
export type PlantIdentificationOrgan =
  | 'leaf' | 'flower' | 'fruit' | 'bark' | 'habit' | 'other';

export interface PlantIdentificationPhoto {
  url: string;
  organ: PlantIdentificationOrgan;
}

export interface PlantIdentificationCandidate {
  scientificName: string;
  commonNames: string[];
  score: number;
}

export interface PlantIdentification {
  id: string;
  status: 'resolved' | 'no_match';
  resolved: { gbifKey: number; scientificName: string } | null;
  candidates: PlantIdentificationCandidate[];
  photos: PlantIdentificationPhoto[];
  convertedToPlantId: string | null;
  createdAt: string;
}
```

## 3. Application

`IPlantIdentificationsRepository`:

```typescript
export interface IPlantIdentificationsRepository {
  identify(input: {
    photos: { file: File; organ: PlantIdentificationOrgan }[];
  }): Promise<PlantIdentification>;

  findByCriteria(spaceId: string, page: number, limit: number):
    Promise<{ items: PlantIdentification[]; total: number }>;

  createPlantFromIdentification(input: {
    identificationId: string;
    name: string;
  }): Promise<CreatedEntity>;
}
```

Use cases are thin pass-throughs (same shape as `plant-photos`' own —
`execute(input)` delegates directly to the repository method), except
`GetPlantIdentificationsUseCase` which forwards pagination params
unmodified.

## 4. Infrastructure

`PlantIdentificationGqlRepository` — singleton export
`plantIdentificationGqlRepository`, implements the port above:

- `findByCriteria` / `createPlantFromIdentification` — standard Apollo
  `apolloClient.query`/`mutate`, unit-tested by mocking `apolloClient`
  directly (`vi.mock`), same as every other GQL repository in this repo.
- `identify` — builds a `FormData` (one entry per photo under `photos`,
  plus an `organs` field with `JSON.stringify(organs)`), posts via the
  shared `http` axios client (`multipart/form-data`, `X-Space-ID` already
  attached by the existing interceptor), unit-tested by mocking `http`
  directly (matches `plant-photos-http.repository.spec.ts`'s own mocking
  approach).

## 5. Presentation

- `useIdentifyPlant()` — `useMutation`, `mutationFn: identifyPlantUseCase.execute`,
  no automatic query invalidation on success (the result is rendered
  directly from the mutation response — no need to refetch); a manual call
  to invalidate `['plant-identifications', spaceId]` happens so the
  recent-list section picks up the new entry.
- `usePlantIdentifications(spaceId)` — `useQuery`, key
  `['plant-identifications', spaceId]`, `enabled: !!spaceId`.
- `useCreatePlantFromIdentification()` — `useMutation`, on success invalidates
  `['plants', spaceId]` and `['plant-identifications', spaceId]` (the
  converted entry's `convertedToPlantId` needs to show up in the recent
  list), then the screen's `onSuccess` callback does
  `router.push(/[lang]/plants/${id})`.
- `IdentifyPlantScreen` orchestrates: `PhotoOrganPicker` (add/remove photos,
  pick organ per photo, client-side max-count guard e.g. 5) → submit via
  `useIdentifyPlant()` → `IdentificationResultPanel` (renders per ADR-004) →
  on "Crear planta" click, opens `CreatePlantFromIdentificationModal` →
  `RecentIdentificationsList` below, fed by `usePlantIdentifications`.

## 6. i18n keys (indicative, `plantIdentification` namespace)

```
plantIdentification.title
plantIdentification.addPhoto
plantIdentification.organ.leaf / .flower / .fruit / .bark / .habit / .other
plantIdentification.submit
plantIdentification.resolved.title
plantIdentification.resolved.confidence
plantIdentification.resolved.createPlantCta
plantIdentification.noMatch.title
plantIdentification.noMatch.fallbackToManual
plantIdentification.error.provider
plantIdentification.error.quota
plantIdentification.createModal.nameLabel
plantIdentification.createModal.nameRequired
plantIdentification.recent.title
plantIdentification.recent.empty
plantIdentification.recent.convertedBadge
```

Spanish copy: Castellano de España, tuteo (e.g. "Añade una foto",
"Crea la planta"), no voseo/regionalismos.
