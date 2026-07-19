# Tasks: plant-identification-redesign

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 450 – 600 (mostly presentation: one new component, several reworked ones, stories, specs) |
| 400-line budget risk | Medium — likely needs splitting into 2 chained PRs (e.g. sidebar+layout first, candidate-selection+routing second) per this repo's 400-line cap |
| Delivery strategy | Chained PRs if the single-PR diff exceeds ~400 lines; confirm at apply time once the diff is drafted |
| Depends on | Nothing — built entirely on `gardenia-api`'s existing, unmodified contract |

## Phase 1: Sidebar

- [x] 1.1 `shared/presentation/i18n/shell/en.ts` / `es.ts` — add `nav.identifyPlant`
- [x] 1.2 `shared/presentation/components/sidebar-nav-items/nav-items.ts` — add `{ key: 'identifyPlant', href: '/[lang]/identify', icon: ScanSearch }`
- [x] 1.3 Confirm `sidebar.spec.tsx`/`nav-item.spec.tsx` (existing) still pass — updated the local nav-dict mocks in `sidebar.spec.tsx`/`app-shell.spec.tsx`/`app-shell-layout.spec.tsx` (TS required the new `identifyPlant` key)

## Phase 2: Candidate selection component

- [x] 2.1 `presentation/components/candidate-selection-list/candidate-selection-list.tsx` (+ spec + story) — radio-group semantics, props: `candidates`, `selectedIndex`, `onSelect(index)`. Selection keys off array **index**, not a backend `rank` field — `PlantIdentificationCandidate` has no `rank` in the web domain model, and the array is already returned pre-sorted by rank, so index is equivalent
- [x] 2.2 `presentation/components/identification-result-panel/identification-result-panel.tsx` (+ spec, story) — unified `resolved`/`no_match` rendering around `CandidateSelectionList`; new props `selectedIndex`, `onSelectCandidate`, `onConfirm`, `onNoneMatch`; removed the `Accordion` usage
- [x] 2.3 i18n: `presentation/i18n/en.ts` / `es.ts` — added `noneMatch`, dropped `resolved.viewOtherCandidates` and `noMatch.fallbackToManual` (superseded by the explicit "none match" action)

## Phase 3: Layout rework

- [x] 3.1 `presentation/screens/identify-plant/identify-plant.screen.tsx` (+ spec) — two-region responsive grid (`lg:grid-cols-2`); owns `selectedIndex: number | null`, seeded from the auto-resolved candidate's index whenever a new identification arrives (adjusted during render, not via `useEffect` + `setState`, to avoid the cascading-render lint error)
- [x] 3.2 Story updated (`identify-plant.screen.stories.tsx`) — now passes the new required `createPlantDict` prop

## Phase 4: Routing on confirm (no backend change)

- [x] 4.1 `core/plants/presentation/components/create-plant-modal/create-plant-modal.tsx` (+ spec) — added `initialImageUrl?`/`initialSpeciesName?` props; `useCreatePlantForm` gained a `defaultValues` param; `SpeciesCombobox` gained a `defaultQuery` prop to seed the search text without a resolved GBIF match
- [x] 4.2 `identify-plant.screen.tsx` — confirming the auto-resolved candidate opens `CreatePlantFromIdentificationModal` unchanged; any other candidate or "Ninguna de estas es correcta" opens `CreatePlantModal` pre-filled with the candidate's name (or nothing, for none-match) and the identification's first photo
- [x] 4.3 `identify-plant.screen.spec.tsx` — covers both routing branches plus the none-match case

## Phase 5: Verification

- [x] 5.1 `pnpm test` — 1604/1607 green (3 pre-existing, unrelated failures in `app/api/image-proxy/[id]/route.spec.ts`, confirmed untouched by this change)
- [x] 5.2 `pnpm lint` / `pnpm tsc --noEmit` — clean (fixed one React Compiler lint error — synchronous `setState` in an effect — and one React Doctor warning — array index used as key — during implementation)
- [x] 5.3 `pnpm build` succeeds, `/[lang]/identify` present in the route manifest
- [x] 5.4 `pnpm run build-storybook` succeeds
- [ ] 5.5 Manual browser pass — not performed in this headless environment; recommend a manual pass before/after merge
