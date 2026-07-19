# Tasks: plant-identification-redesign

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 500 – 700 (mostly presentation: one new component, several reworked ones, stories, specs) |
| 400-line budget risk | Medium — likely needs splitting into 2 chained PRs (e.g. sidebar+layout first, candidate-selection+manual-fallback second) per this repo's 400-line cap |
| Delivery strategy | Chained PRs if the single-PR diff exceeds ~400 lines; confirm at apply time once the diff is drafted |
| Depends on | `gardenia-api`'s `plant-identification-select-candidate` (the `selectedCandidateRank` field must exist on the API before this ships end-to-end; the UI can be built and unit-tested against a mocked repository in the meantime) |

## Phase 1: Sidebar

- [ ] 1.1 `shared/presentation/i18n/shell/en.ts` / `es.ts` — add `nav.identifyPlant`
- [ ] 1.2 `shared/presentation/components/sidebar-nav-items/nav-items.ts` — add `{ key: 'identifyPlant', href: '/[lang]/plants/identify', icon: ScanSearch }`
- [ ] 1.3 Confirm `sidebar.spec.tsx`/`nav-item.spec.tsx` (existing) still pass and cover the new item generically (they iterate `NAV_ITEMS`, per existing pattern — no new test file expected)

## Phase 2: Candidate selection component

- [ ] 2.1 `presentation/components/candidate-selection-list/candidate-selection-list.tsx` (+ spec + story) — extracted/reworked from `IdentificationResultPanel`'s old `CandidateRow`; radio-group semantics, props: `candidates`, `selectedRank`, `onSelect(rank)`
- [ ] 2.2 `presentation/components/identification-result-panel/identification-result-panel.tsx` (+ spec, story) — unify `resolved`/`no_match` rendering around `CandidateSelectionList`; new props `selectedRank`, `onSelectCandidate`, `onNoneMatch`; remove the `Accordion` usage
- [ ] 2.3 i18n: `presentation/i18n/en.ts` / `es.ts` — add copy for "Ninguna de estas es correcta" and any updated candidate-list section headers; update `i18n-parity.test.ts` if key names change

## Phase 3: Layout rework

- [ ] 3.1 `presentation/screens/identify-plant/identify-plant.screen.tsx` (+ spec) — restructure into input/result regions (responsive grid, ≥`lg` two columns); owns `selectedRank: number | null` state, initialized from the identification's auto-resolved candidate's rank when present
- [ ] 3.2 Story updates for the screen covering both the `resolved` and `no_match` fixture cases with the new layout

## Phase 4: Manual GBIF fallback

- [ ] 4.1 `core/plants/presentation/components/create-plant-modal/create-plant-modal.tsx` (+ spec) — add optional `initialImageUrl?: string` prop, threaded into `useCreatePlantForm`'s default values
- [ ] 4.2 Wire `IdentificationResultPanel`'s `onNoneMatch` → `IdentifyPlantScreen` opens `CreatePlantModal` with `initialImageUrl: identification.photos[0]?.url`
- [ ] 4.3 `identify-plant.screen.spec.tsx` — cover opening the manual modal and that it receives the pre-filled image

## Phase 5: Wire `selectedCandidateRank` end to end

- [ ] 5.1 `application/interfaces/create-plant-from-identification-input.interface.ts` — add optional `selectedCandidateRank?: number`
- [ ] 5.2 `infrastructure/repositories/graphql/plant-identification.gql.repository.ts` (+ spec) — forward the field into the mutation's `input` variable when present
- [ ] 5.3 `presentation/components/create-plant-from-identification-modal/create-plant-from-identification-modal.tsx` (+ spec) — new `selectedRank: number | null` prop; include `selectedCandidateRank` in the mutation call only when it's set and differs from the identification's own resolved rank (see design.md decision)
- [ ] 5.4 `use-create-plant-from-identification.hook.spec.ts` — confirm the field passes through unchanged (thin wrapper, no logic to add here)

## Phase 6: Verification

- [ ] 6.1 `pnpm test` — full suite green
- [ ] 6.2 `pnpm lint` / `pnpm tsc --noEmit` clean
- [ ] 6.3 `pnpm build` succeeds, new/changed routes present in the manifest
- [ ] 6.4 `pnpm run build-storybook` succeeds
- [ ] 6.5 Manual browser pass: sidebar nav, candidate selection on both a resolved and a no_match fixture (requires the paired api change deployed, or a mocked backend), manual-fallback pre-fill
