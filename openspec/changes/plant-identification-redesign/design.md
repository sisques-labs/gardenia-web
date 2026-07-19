# Design: plant-identification-redesign

## Technical Approach

No new bounded context, no new domain interfaces, no `gardenia-api` change.
This is a presentation-layer rework of
`src/core/plant-identification/presentation/`, plus a small sidebar config
change and two small additive props on `plants`' existing `CreatePlantModal`.

Candidate selection becomes state owned by `IdentifyPlantScreen` (a single
`selectedRank: number | null`, `useState`) and passed down to both
`IdentificationResultPanel` (to render selection) and
`CreatePlantFromIdentificationModal` (to send on submit) — no Zustand store,
per this repo's own rule ("state local to a single component/form" and
"client state shared across unrelated components/screens" don't apply here:
the selection is shared only between siblings under one screen, the
established pattern for that is lifting state to the common parent, not a
store).

## Architecture Decisions

| Decision | Choice | Alternatives rejected | Rationale |
|----------|--------|------------------------|-----------|
| Selection state ownership | `IdentifyPlantScreen` owns `selectedRank`, passed as props to `IdentificationResultPanel`/`CreatePlantFromIdentificationModal` | New Zustand store for the selection | The selection is transient, single-screen, disappears on navigation — exactly the "local to a single component/form" case this repo's state-management rule reserves for `useState`, just lifted one level for two sibling consumers. |
| One candidate list component for both statuses | `IdentificationResultPanel` renders the same `CandidateSelectionList` regardless of `resolved`/`no_match`; the only status-conditional part left is the header messaging (title/subtitle) | Keep two separate render branches (as today) | The whole point of this redesign is that `resolved` vs. `no_match` should no longer produce a materially different, differently-capable UI — both let the user pick a candidate now. Diverging render paths for the same list was what caused the original bug (no create option under `no_match`). |
| Pre-selection, not special styling | The server's auto-resolved candidate (if any) sets the *initial* `selectedRank`, but renders with the same card styling as every other candidate (just already checked) | Keep a visually distinct "top pick" card above the rest | Directly addresses the product-owner's "no me gusta cómo se muestran los candidatos" feedback — the previous design's asymmetry (one big card + a collapsed accordion) is exactly what's being replaced. A pre-checked radio card communicates "we think it's this one" without visual hierarchy that buries the alternatives. |
| Manual/non-top-candidate path reuses `plants`' `CreatePlantModal` across the context boundary | Confirming with any candidate other than the auto-resolved one, or with "Ninguna de estas es correcta", opens `@/core/plants/presentation/components/create-plant-modal/create-plant-modal` directly, with new optional `initialImageUrl`/`initialSpeciesName` props | Build a second, near-duplicate species-search UI inside `plant-identification`; or extend the api's `createPlantFromIdentification` mutation to accept an arbitrary candidate | `SpeciesCombobox` + `CreatePlantModal` already do exactly this (live GBIF search, create a `Plant`) — no backend capability is missing, only a client-side routing decision. This repo's Hexagonal convention forbids cross-context reaches in `domain`/`application`/`infrastructure`, but presentation-layer component reuse across contexts isn't specced one way or the other; duplicating a whole search-and-create form (or growing the api's contract) to avoid one cross-context import is the worse trade. Flagging this explicitly rather than silently doing it, per this proposal's own "Approach" section. |
| Routing decided purely by comparing the selection to the auto-resolved rank | On confirm: if `selectedRank === identification.resolved`'s candidate rank (or the identification has exactly one candidate and it's selected), call the existing `createPlantFromIdentification` mutation unchanged; otherwise open `CreatePlantModal` pre-filled instead | Always route through `createPlantFromIdentification`, extending its contract | Keeps `gardenia-api` completely untouched. The existing mutation already does everything needed for the "server was right" path; every other path is exactly what the existing manual flow is for. |
| Layout: two-region screen, not a wizard | Photo/organ picker + submit stay together as an "input" region (top on mobile, left column ≥ `lg`); once `identification` exists, a "result" region (candidate list + create/fallback actions) appears as its own block (below on mobile, right column ≥ `lg`) — both regions can be visible at once, no step-gating | A multi-step wizard (upload → review → confirm as separate views/routes) | A wizard adds routing/state complexity (back button behavior, re-upload on back) for a flow that's realistically two logical groups, not three+ sequential steps; a responsive two-region layout fixes the "everything crammed in one column" complaint with much less surface area to get wrong. |
| Sidebar icon | `ScanSearch` (lucide-react) | `Leaf` (already used by "Plants", would be confusing next to it), `Camera` (describes the input mechanism, not the feature) | `ScanSearch` reads as "identify/scan something", distinct from the existing `Leaf` used for the Plants section right above it in the nav list. |

## Component Changes

```
presentation/
  screens/identify-plant/identify-plant.screen.tsx
    # layout restructured into input/result regions; owns `selectedRank` state
  components/
    identification-result-panel/identification-result-panel.tsx
      # unify resolved/no_match rendering around one candidate list;
      # new props: selectedRank, onSelectCandidate, onNoneMatch
    candidate-selection-list/candidate-selection-list.tsx        # NEW
      # extracted from identification-result-panel's old CandidateRow;
      # renders every candidate as a selectable card (radio group semantics)
    create-plant-from-identification-modal/create-plant-from-identification-modal.tsx
      # unchanged behavior — only ever called for the auto-resolved candidate
  screens/identify-plant/identify-plant.screen.tsx
    # decides which modal to open (CreatePlantFromIdentificationModal vs.
    # plants' CreatePlantModal) based on the current selection, see design
    # decision above
shared/
  presentation/
    components/sidebar-nav-items/nav-items.ts
      # + { key: 'identifyPlant', href: '/[lang]/plants/identify', icon: ScanSearch }
    i18n/shell/en.ts, es.ts
      # + nav.identifyPlant
core/plants/presentation/components/create-plant-modal/create-plant-modal.tsx
  # + optional `initialImageUrl?: string` / `initialSpeciesName?: string` props,
  #   threaded into useCreatePlantForm's default values (small, additive —
  #   every existing caller keeps working unchanged by simply not passing them)
```

## Testing Approach

- `candidate-selection-list.spec.tsx` (new): renders N candidates, clicking
  one calls `onSelectCandidate` with its rank, exactly one card shows
  selected at a time, works identically regardless of a `resolved`/`no_match`
  identification passed in.
- `identification-result-panel.spec.tsx`: update for the unified rendering
  path; add a case for `no_match` + candidate selected → create action is
  now enabled (previously impossible to test since no such path existed).
- `identify-plant.screen.spec.tsx`: update for the new layout regions and
  the routing decision — confirming the auto-resolved candidate opens
  `CreatePlantFromIdentificationModal`; confirming any other candidate, or
  "Ninguna de estas es correcta", opens `CreatePlantModal` pre-filled with
  the candidate's name (or empty) and the first photo.
- `create-plant-modal.spec.tsx`: cover the new `initialImageUrl`/
  `initialSpeciesName` props pre-filling the form.
- Every new/changed component gets a Storybook story per this repo's
  mandatory-storybook rule (seeding TanStack Query cache with fixtures,
  covering both a `resolved` and a `no_match` fixture identification).
- `i18n-parity.test.ts` (existing, `plant-identification` module) — no
  change needed beyond new keys existing in both `en.ts`/`es.ts`; the shell
  module's own i18n-parity test (if any) covers the new `nav.identifyPlant`
  key the same way.
