# Proposal: plant-identification-layout-v2

## Intent

### Problem

`plant-identification-redesign` (already applied — sidebar entry point +
"every candidate is selectable" behavior) also reworked the identify screen's
layout into a two-region CSS grid: photo/organ picker + submit in a left
column, `IdentificationResultPanel` in a right column (`grid-cols-1
lg:grid-cols-2`), with `RecentIdentificationsList` as a third block below.
That shipped and works functionally, but direct product-owner feedback after
using it is that the visual result still isn't good enough:

- The side-by-side column split reads as two disconnected forms competing for
  attention rather than one coherent flow, even on desktop where the columns
  have room.
- `CandidateSelectionList`'s cards are visually flat — a thin border, a name,
  a bare percentage, and a progress bar, with no hierarchy that helps a user
  scan and compare candidates at a glance. `commonNames` (already present on
  `PlantIdentificationCandidate`) isn't rendered at all, even though it's
  often the more legible signal for a non-botanist.
- Mobile responsiveness today is only "the grid collapses to one column at
  `lg`" — functional, but never deliberately designed for a phone-sized
  viewport (tap target sizing, spacing rhythm, section boundaries).

### Why now

Same direct product-owner feedback loop as the original redesign: "no me
gusta el layout que tiene" for the current result, plus an explicit mobile-
responsive requirement. This is a visual/layout iteration on a screen whose
*behavior* (candidate selection, routing to the identification mutation vs.
the manual `CreatePlantModal` fallback) was just fixed and is not in question
— nothing here should regress `plant-identification-redesign`'s scenarios in
`openspec/changes/plant-identification-redesign/spec.md`.

### Success looks like

- The screen reads as a single, top-to-bottom narrative at every viewport
  width — no side-by-side column split. Desktop gets a comfortably
  constrained reading width, not a second column competing for attention.
- Each stage (upload photos → submit → result → recent identifications) is
  visually bounded (`Card`) so the page has clear sections instead of raw
  stacked `div`s with only gap spacing between them.
- Candidate cards have real visual hierarchy: rank, scientific name, common
  name (when PlantNet returned one), and a confidence indicator that's
  legible at a glance (not just a bare `NN%` next to a thin progress bar),
  with a clearly-marked selected state (not just a subtle border/background
  tint).
- On a phone-width viewport, every interactive element (photo remove button,
  organ select, candidate card, submit button) meets a comfortable tap-target
  size, and section spacing doesn't feel cramped.
- No behavioral regression: all scenarios in
  `plant-identification-redesign/spec.md` still hold — same routing on
  confirm, same manual-fallback behavior, same data shown.

---

## Scope (this change)

### In scope

- `identify-plant.screen.tsx`: replace the `grid-cols-1 lg:grid-cols-2` split
  with a single-column, width-constrained (`max-w-2xl mx-auto` or similar)
  vertical flow; wrap the upload/submit stage, the result stage, and the
  recent-identifications stage each in a `Card` for visual separation.
- `identification-result-panel.tsx`: restructure the result stage's header
  and actions inside the new `Card` shell (title/status messaging in
  `CardHeader`, candidate list + actions in `CardContent`).
- `candidate-selection-list.tsx`: redesign the candidate card — add a rank
  indicator, render `commonNames[0]` when present, replace the bare `NN%`
  with a confidence-tier badge (high/medium/low, color-coded) alongside the
  existing `ProgressBar`, and a clearer selected-state affordance (check
  icon, not just border/background).
- `photo-organ-picker.tsx` and `recent-identifications-list.tsx`: spacing and
  tap-target polish only (larger touch targets on remove buttons, consistent
  `gap` scale) — no structural/behavioral change.
- i18n: any new copy (e.g. confidence-tier labels) added to both
  `plant-identification/presentation/i18n/en.ts` and `es.ts`.

### Out of scope (deferred)

- Any change to `plant-identification-redesign`'s already-shipped behavior:
  sidebar entry, "every candidate selectable", routing-on-confirm logic,
  manual-fallback flow. This change only touches how those states are
  rendered, never what triggers them.
- A dedicated full-page/table history view for past identifications (still
  the inline `RecentIdentificationsList`).
- Reworking `photo-organ-picker.tsx` onto the shared `photo-picker`/
  `file-upload` ui components — a bigger, separate change; this pass only
  polishes spacing/tap targets on the existing implementation.
- Any `gardenia-api` change — purely a web presentation-layer pass.
- Multi-select / wizard-style step flow on mobile — confirmed with the
  product owner: mobile stays a single scrollable flow (upload → submit →
  result, in that order), not a paginated/step-gated experience.

---

## Approach

Purely a presentation-layer visual rework inside
`src/core/plant-identification/presentation/`. No new domain interfaces, no
new use-cases, no state-shape changes — `IdentifyPlantScreen` keeps owning
`selectedIndex`/`openModal` exactly as `plant-identification-redesign` left
it; only the JSX/className layer changes. See `design.md` for the specific
layout and component decisions.
