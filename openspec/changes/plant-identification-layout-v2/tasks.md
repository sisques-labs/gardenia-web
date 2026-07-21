# Tasks: plant-identification-layout-v2

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 250 – 350 (5 files reworked + specs/stories updated, no new files except i18n keys) |
| 400-line budget risk | Low — single PR expected |
| Delivery strategy | Single PR |
| Depends on | `plant-identification-redesign` (already applied) — this change only restyles/restructures its output, doesn't touch its behavior |

## Phase 1: Confidence-tier helper + candidate card redesign

- [ ] 1.1 `candidate-selection-list.tsx` — add local `confidenceTier(score): 'high' | 'medium' | 'low'` helper (`>= 0.7` high, `>= 0.4` medium, else low)
- [ ] 1.2 `candidate-selection-list.tsx` — add rank indicator (index + 1), render `candidate.commonNames[0]` when present, replace bare `{percent}%` with a `Badge` colored/labeled by tier next to the existing `ProgressBar`, add a `Check` icon marker on the selected card
- [ ] 1.3 i18n: `presentation/i18n/en.ts` / `es.ts` — add confidence-tier labels (exact keys per design.md; Spanish copy in Castellano de España, no voseo)
- [ ] 1.4 `candidate-selection-list.spec.tsx` — RED then GREEN for: rank rendering, common-name presence/absence, tier boundaries (0.39/0.4/0.69/0.7), selected-state marker
- [ ] 1.5 `candidate-selection-list.stories.tsx` (existing or new) — story variant with all three tiers + a candidate with/without common names

## Phase 2: Result panel restructure into Card

- [ ] 2.1 `identification-result-panel.tsx` — wrap status messaging in `CardHeader`, candidate list + actions in `CardContent`, using the existing `Card`/`CardHeader`/`CardContent` primitives from `shared/presentation/components/ui/card/card.tsx`
- [ ] 2.2 `identification-result-panel.spec.tsx` — update structural assertions for the new `Card` shell; confirm no behavioral assertion (routing, disabled states) needs to change
- [ ] 2.3 Storybook story update if present

## Phase 3: Screen layout — drop the two-column grid

- [ ] 3.1 `identify-plant.screen.tsx` — replace `grid grid-cols-1 gap-8 p-6 lg:grid-cols-2 lg:items-start` with a single-column `mx-auto flex max-w-2xl flex-col gap-6 p-4 sm:p-6`; wrap the upload/submit block and the recent-identifications block each in `Card` (result stage already carries its own `Card` from Phase 2)
- [ ] 3.2 `identify-plant.screen.spec.tsx` — update layout-container assertions; confirm existing routing/modal-opening tests still pass unmodified
- [ ] 3.3 `identify-plant.screen.stories.tsx` — update if the new structure affects existing story assertions/snapshots

## Phase 4: Photo picker & recent list polish

- [ ] 4.1 `photo-organ-picker.tsx` — grow remove-photo button hit area to ≥44×44px (padding, not visual icon size), review spacing (`gap-2` → `gap-3` where cramped)
- [ ] 4.2 `recent-identifications-list.tsx` — spacing polish only, no structural change (Card wrapper applied by the screen in Phase 3)
- [ ] 4.3 Update specs for any changed `data-testid`/class assertions touched by the above

## Phase 5: Verification

- [ ] 5.1 `pnpm test` — all suites green, including every file touched above
- [ ] 5.2 `pnpm lint` / `pnpm tsc --noEmit` — clean
- [ ] 5.3 `pnpm build` succeeds
- [ ] 5.4 `pnpm run build-storybook` succeeds
- [ ] 5.5 Manual browser pass at a mobile viewport (375px) and a desktop viewport (1280px) — confirm single-column flow, tap targets, and no regression to the confirm-routing/manual-fallback behavior from `plant-identification-redesign`
