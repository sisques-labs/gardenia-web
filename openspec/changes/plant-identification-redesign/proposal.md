# Proposal: plant-identification-redesign

## Intent

### Problem

`plant-identification-web` (already applied) shipped a working but minimal
screen: photo picker, one long vertical stack (submit → result → recent
list), and a result panel that only shows the server's own auto-picked
"resolved" candidate prominently — every other candidate PlantNet returned
is buried inside a collapsed "Ver otras posibilidades" accordion, and when
nothing clears the confidence threshold (`status: 'no_match'`) there is no
way to create a plant from the identification at all, even if a human can
clearly see the right species sitting in the candidate list. The feature is
also only reachable via a small button next to "Crear planta" on the plants
list — it has no presence in the app's primary navigation.

### Why now

Direct product-owner feedback in an agent session: the current design isn't
good enough to ship as-is, the feature deserves its own sidebar entry, and
users should be able to pick **any** returned candidate (not just the
auto-resolved one) to create the plant — searching GBIF manually as a
fallback when none of PlantNet's candidates are right. The paired
`gardenia-api` change (`plant-identification-select-candidate`) adds the
backend capability this depends on: `createPlantFromIdentification` now
accepts an optional `selectedCandidateRank`, resolving *that* candidate
against GBIF instead of only the server's auto-pick, and works even when
`status` is `no_match`.

### Success looks like

- "Identificar planta" is its own item in the sidebar, not just a secondary
  button on the plants list.
- After identifying, the user sees **every** returned candidate as an
  equally visible, selectable card with its confidence percentage — not one
  candidate promoted above an accordion hiding the rest — regardless of
  whether the server auto-resolved one.
- Picking any candidate and confirming creates the plant with that species,
  including when the identification's `status` is `no_match`.
- If none of the candidates are right, a clearly-offered fallback opens the
  existing manual "Crear planta" flow (`SpeciesCombobox`, live GBIF search)
  with the identification's first photo pre-filled, instead of leaving the
  user with a dead end.

---

## Scope (v1 — this change)

### In scope

- **Sidebar**: new top-level `NAV_ITEMS` entry "Identificar planta" →
  `/[lang]/plants/identify`, own icon. The existing button on
  `plants-list.screen.tsx` stays as a secondary shortcut (low-risk, no
  reason to remove a working entry point while adding the primary one).
- **Layout redesign** of `identify-plant.screen.tsx`: replace the single
  long vertical stack with a clearer two-region layout — photo/organ picker
  and submit stay as the "input" region; the result (candidate selection,
  create action) renders as a distinct "result" region once an
  identification exists, instead of both regions competing for the same
  column. Exact breakpoint/grid behavior is a design.md decision, not
  pre-decided here.
- **Candidate selection redesign**: `IdentificationResultPanel` stops
  special-casing "the resolved one" vs. "the rest in an accordion" —
  candidates render as a single list of equally-weighted, selectable cards
  (radio semantics: exactly one selected at a time), each showing scientific
  name + confidence bar, for **both** `resolved` and `no_match` statuses.
  The server's auto-resolved candidate (when present) is pre-selected, not
  specially styled — this is a legibility fix, not a "trust the server less"
  statement.
- **Manual GBIF fallback**: a persistent "Ninguna de estas es correcta"
  option alongside the candidate cards opens the existing `CreatePlantModal`
  (from `plants`), pre-filled with the identification's first photo URL, so
  the user can search the full GBIF catalog via the existing
  `SpeciesCombobox` — reusing what already exists rather than building a new
  search UI.
- **Wiring the new API field**: `useCreatePlantFromIdentification`'s
  mutation input and the underlying GraphQL mutation gain
  `selectedCandidateRank?: number`; `CreatePlantFromIdentificationModal`
  passes the user's selected candidate's `rank`.
- `CreatePlantModal` gains an optional `initialImageUrl` prop (small,
  additive) so the manual-fallback path can pre-fill the photo without
  duplicating the modal.

### Out of scope (deferred)

- A dedicated full-page/table history view — the inline "recent
  identifications" list stays as-is structurally (may get minor visual
  polish as a side effect of the layout pass, not a rework).
- Removing the existing plants-list entry point button.
- Any change to `dashboard-home` — same reasoning as the original proposal
  (that change is in-flight separately).
- Multi-select / comparing candidates side-by-side — selection stays
  single-candidate (radio), matching what the api's `selectedCandidateRank`
  (a single value) supports.

---

## Approach

Mostly a presentation-layer rework inside the existing
`src/core/plant-identification/` bounded context — no new domain
interfaces, no new use-case beyond threading one new optional field through
the existing `createPlantFromIdentification` mutation call.
`IdentificationResultPanel` and `CreatePlantFromIdentificationModal` are
restructured around "the user's current candidate selection" as shared
local state owned by `IdentifyPlantScreen`, rather than the modal only ever
knowing about the single already-resolved species. The manual-fallback path
reaches across into `plants`' existing `CreatePlantModal` — a presentation-
to-presentation reuse across bounded contexts, which this repo's DDD+
Hexagonal convention doesn't explicitly forbid at the UI layer (unlike the
backend's strict cross-context port rule) but is still worth flagging
explicitly (see design.md).
