# Design: plant-identification-layout-v2

## Technical Approach

No new bounded context, no new domain interfaces, no `gardenia-api` change,
no new state. `IdentifyPlantScreen` keeps the exact state shape
`plant-identification-redesign` left it with (`photos`, `selectedIndex`,
`openModal`, `manualSeedName`, `seededIdentificationId`) — this change only
touches JSX structure and `className`s across five files, plus new i18n
copy for the confidence-tier labels.

## Architecture Decisions

| Decision | Choice | Alternatives rejected | Rationale |
|----------|--------|------------------------|-----------|
| Layout shape | Single-column, `max-w-2xl mx-auto` vertical flow at every breakpoint (drop `lg:grid-cols-2` entirely) | Keep the two-column grid, just narrow it / tune breakpoints | The product-owner complaint is the side-by-side split itself, not its sizing — a form (upload) and its own result aren't two independent things a user compares side-by-side, they're sequential. A single column is also mobile-responsive by construction, which directly satisfies the "must be responsive" requirement without a separate mobile-only code path. |
| Section boundaries | Wrap each stage (upload+submit, result, recent) in the existing `Card`/`CardHeader`/`CardContent` (`shared/presentation/components/ui/card/card.tsx`) | Keep raw `div`s with only `gap-*` spacing (status quo) | "Flat" was explicit feedback on the candidate cards, but the screen overall has the same problem one level up — three blocks separated only by whitespace read as one long page, not three legible stages. `Card` is already the repo's standard section-boundary primitive (used across `plants`, `inventory`), so this is consistent, not novel. |
| Candidate card redesign | Add a numbered rank badge, render `candidate.commonNames[0]` as secondary text under the scientific name, replace the bare `{percent}%` text with a `Badge` colored by confidence tier (`>= 70` forest / `40–69` amber / `< 40` muted), keep `ProgressBar` alongside it, swap the selected-state border/bg tint for the same tint **plus** a `Check` (lucide-react) icon in a fixed-position corner slot | Add per-candidate photos (PlantNet doesn't return any — `PlantIdentificationCandidate` has no image field, would require an unrelated API change); redesign as a horizontal-scroll carousel of cards | All of this is derivable from data already on `PlantIdentificationCandidate` (`commonNames`, `score`) — no backend change. A carousel was rejected because vertical, one-per-row scanning is what lets a user compare N candidates at once without horizontal swiping, which matters more on mobile than a "cooler" layout. |
| Confidence tier thresholds | `>= 0.7` high, `>= 0.4` medium, else low (on the raw `score`, matching the existing `Math.round(candidate.score * 100)` percent basis) | Make thresholds configurable / driven by a constant exported from domain | No existing product requirement ties these to a business rule elsewhere (PlantNet's own confidence semantics aren't contractually stable), and no second consumer exists yet — a local, documented constant in the component is proportionate; extracting a shared threshold module would be premature abstraction for a single call site. |
| Photo picker / recent list changes | Spacing (`gap-2` → `gap-3` where cramped) and touch-target sizing only (e.g. the remove-photo `button` grows from `p-1` to a `44px`-minimum hit area via padding, not a visual size change) | Rebuild `photo-organ-picker.tsx` on the shared `photo-picker`/`file-upload` ui components | Proposal already scopes this out — swapping the underlying picker primitive is materially more surface area (upload flow, preview generation, drag-and-drop) than this pass's "layout + candidate legibility" goal; tracked as a possible future change, not bundled here. |
| Mobile flow | Single scrollable page, same top-to-bottom order (upload → submit → result → recent) at every width — no step/wizard gating | Wizard-style steps on mobile only (separate views per stage) | Explicitly ruled out with the product owner: adds routing/back-button state for a flow that's two-to-three sequential blocks, not enough steps to justify it. The single-column layout already fixes the "everything crammed side-by-side" complaint without a second, mobile-only code path to maintain. |

## Component Changes

```
presentation/
  screens/identify-plant/identify-plant.screen.tsx
    # replace `grid grid-cols-1 gap-8 p-6 lg:grid-cols-2 lg:items-start`
    # with a single-column `mx-auto flex max-w-2xl flex-col gap-6 p-4 sm:p-6`;
    # upload+submit stage and result stage each wrapped in <Card>;
    # no state/logic change
  components/
    identification-result-panel/identification-result-panel.tsx
      # render inside CardHeader (status title/alert) + CardContent
      # (candidate list + actions) instead of a bare flex column;
      # props unchanged
    candidate-selection-list/candidate-selection-list.tsx
      # card markup reworked: rank badge, commonNames[0] secondary line,
      # confidence-tier Badge + existing ProgressBar, Check icon on selected;
      # new local `confidenceTier(score)` helper; props unchanged
      # (candidates, selectedIndex, onSelect)
    photo-organ-picker/photo-organ-picker.tsx
      # spacing/tap-target polish only; no prop/behavior change
    recent-identifications-list/recent-identifications-list.tsx
      # wrapped in <Card> by the screen (not internally) OR internal
      # spacing polish — screen owns the Card per the "each stage is a
      # Card" decision above; component itself only gets minor spacing polish
i18n/
  en.ts / es.ts
    # + resolved.confidence tier labels if surfaced as text (e.g.
    # `confidenceHigh` / `confidenceMedium` / `confidenceLow`) — exact keys
    # decided at implementation time based on whether the tier needs a
    # text label or is color-only (accessibility: colour alone MUST NOT be
    # the only signal, so a short text/label is required — see spec.md)
```

## Testing Approach

- `candidate-selection-list.spec.tsx` (existing, update): assert the rank
  badge renders per index, `commonNames[0]` renders when present and is
  absent when `commonNames` is empty, confidence tier badge text/variant
  matches the score bucket for boundary values (0.39, 0.4, 0.69, 0.7), and
  the selected card exposes the check affordance (`aria-checked="true"` is
  already covered — this adds an assertion the visual selected-marker is
  present, e.g. via `data-testid`).
- `identification-result-panel.spec.tsx` (existing, update): assert the
  `Card`/`CardHeader`/`CardContent` structure renders (via `data-testid` or
  role queries), not the old bare-div structure. No behavioral scenario
  changes — this file's existing routing/selection tests keep passing
  unmodified in intent.
- `identify-plant.screen.spec.tsx` (existing, update): assert the new
  single-column class list is applied at the root layout container;
  existing behavioral assertions (routing on confirm, modal opening)
  unchanged.
- Storybook: update `identify-plant.screen.stories.tsx`,
  `identification-result-panel.stories.tsx` (if present),
  `candidate-selection-list.stories.tsx` (if present) to reflect the new
  markup — add a story variant showing all three confidence tiers in one
  candidate list for visual QA.
- `i18n-parity.test.ts` (existing, `plant-identification` module) — covers
  any new confidence-tier label keys automatically once added to both
  `en.ts`/`es.ts`.
- No new use-case/repository/store tests — nothing at those layers changes.
