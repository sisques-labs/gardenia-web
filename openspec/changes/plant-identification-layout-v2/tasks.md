# Tasks: plant-identification-layout-v2

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 250 – 350 (5 files reworked + specs/stories updated, no new files except i18n keys) |
| 400-line budget risk | Low — single PR expected |
| Delivery strategy | Single PR |
| Depends on | `plant-identification-redesign` (already applied) — this change only restyles/restructures its output, doesn't touch its behavior |

## Phase 1: Confidence-tier helper + candidate card redesign

- [x] 1.1 `candidate-selection-list.tsx` — add local `confidenceTier(score): 'high' | 'medium' | 'low'` helper (`>= 0.7` high, `>= 0.4` medium, else low)
- [x] 1.2 `candidate-selection-list.tsx` — add rank indicator (index + 1), render `candidate.commonNames[0]` when present, replace bare `{percent}%` with a `Badge` colored by tier next to the existing `ProgressBar`, add a `Check` icon marker on the selected card
- [x] 1.3 Confidence tier signal — implemented as a per-tier lucide icon (`TrendingUp`/`Minus`/`TrendingDown`) inside the tier `Badge`, not new i18n text labels: satisfies spec.md's "more than color alone" requirement without adding copy, and needs no `en.ts`/`es.ts`/`i18n-parity.test.ts` change
- [x] 1.4 `candidate-selection-list.spec.tsx` — RED then GREEN for: rank rendering, common-name presence/absence, tier boundaries (0.39/0.4/0.69/0.7), selected-state marker
- [x] 1.5 `candidate-selection-list.stories.tsx` — added `AllConfidenceTiers` story variant with all three tiers + candidates with/without common names

## Phase 2: Result panel restructure into Card

- [x] 2.1 `identification-result-panel.tsx` — wrap status messaging in `CardHeader`, candidate list + actions in `CardContent`, using the existing `Card`/`CardHeader`/`CardContent` primitives from `shared/presentation/components/ui/card/card.tsx`
- [x] 2.2 `identification-result-panel.spec.tsx` — added a structural assertion for the `Card` shell (`toHaveClass('card')`); all prior behavioral assertions pass unmodified
- [x] 2.3 Storybook story — no change needed, existing stories render the new markup as-is

## Phase 3: Screen layout — drop the two-column grid

- [x] 3.1 `identify-plant.screen.tsx` — replaced `grid grid-cols-1 gap-8 p-6 lg:grid-cols-2 lg:items-start` with a single-column `mx-auto flex max-w-2xl flex-col gap-6 p-4 sm:p-6`; upload/submit block and recent-identifications block each wrapped in `Card` (result stage already carries its own `Card` from Phase 2)
- [x] 3.2 `identify-plant.screen.spec.tsx` — no assertion changes needed; all existing routing/modal-opening tests passed unmodified against the new layout
- [x] 3.3 `identify-plant.screen.stories.tsx` — no change needed

## Phase 4: Photo picker & recent list polish

- [x] 4.1 `photo-organ-picker.tsx` — remove-photo button hit area grown to 44×44px (`h-11 w-11` wrapper around the icon), "Add photo" button and photo-list rows given `min-h-11`/`gap-3`/`p-3`
- [x] 4.2 `recent-identifications-list.tsx` — beyond planned spacing polish (bigger thumbnail, `gap-3`/`p-3`), a real mobile bug was found and fixed during the manual pass: the "Convertida en planta" badge was squeezing the scientific name down to a couple of characters at 390px width. Restructured the row into two stacked lines (thumbnail+name on line 1, badge+link on line 2) instead of one horizontal row — still no new components, same `data-testid`s
- [x] 4.3 No spec changes were needed — all `data-testid`s were preserved through the restructure

## Phase 5: Verification

- [x] 5.1 `pnpm test` — 1615/1618 green; the 3 failures are the same pre-existing, unrelated `app/api/image-proxy/[id]/route.spec.ts` failures documented in `plant-identification-redesign/tasks.md` (§5.1), confirmed untouched by this change
- [x] 5.2 `pnpm lint` / `pnpm tsc --noEmit` — clean (0 errors; the 25 pre-existing warnings are all in unrelated files)
- [x] 5.3 `pnpm build` succeeds, `/[lang]/identify` present in the route manifest
- [x] 5.4 `pnpm run build-storybook` succeeds
- [x] 5.5 Manual pass done via Storybook + Playwright screenshots at 390px (mobile) and 1280px (desktop) viewports — single-column flow confirmed, tap targets confirmed, all three confidence tiers visually distinct, no regression to `plant-identification-redesign`'s routing/fallback behavior (covered by the unmodified `identify-plant.screen.spec.tsx` assertions)
