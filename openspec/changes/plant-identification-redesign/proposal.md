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
fallback when none of PlantNet's candidates are right.

This is entirely achievable with `gardenia-api`'s **existing** contract, no
backend change needed: `createPlantFromIdentification` already works for
the server's auto-resolved candidate exactly as it does today, and the
existing generic "Crear planta" flow (`plants`' `CreatePlantModal` +
`SpeciesCombobox`, live GBIF search) already creates a plant from any
scientific name a user picks or searches for. Picking the auto-resolved
candidate keeps using the existing identification-specific mutation;
picking any *other* candidate (or searching manually) routes to that
existing generic flow, pre-filled with the chosen candidate's name and the
identification's photo as a starting point the user can refine or replace.

### Success looks like

- "Identificar planta" is its own item in the sidebar, not just a secondary
  button on the plants list.
- After identifying, the user sees **every** returned candidate as an
  equally visible, selectable card with its confidence percentage — not one
  candidate promoted above an accordion hiding the rest — regardless of
  whether the server auto-resolved one.
- Picking the auto-resolved candidate and confirming creates the plant the
  same way it does today.
- Picking any other candidate — or searching manually when none fit —
  opens the existing "Crear planta" form pre-filled with that candidate's
  name (editable, backed by live GBIF search via `SpeciesCombobox`) and the
  identification's first photo, including when the identification's
  `status` is `no_match`.

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
- **Routing on confirm**: confirming with the auto-resolved candidate still
  selected calls the existing `createPlantFromIdentification` mutation,
  unchanged. Confirming with any other candidate selected (or via "Ninguna
  de estas es correcta") opens the existing `CreatePlantModal`, pre-filled
  with that candidate's scientific name (or empty, for the manual case) and
  the identification's first photo URL — the user finishes via the existing
  GBIF-search-backed manual flow.
- `CreatePlantModal` gains two optional props, `initialImageUrl` and
  `initialSpeciesName` (small, additive) so this pre-fill is possible
  without duplicating the modal.

### Out of scope (deferred)

- A dedicated full-page/table history view — the inline "recent
  identifications" list stays as-is structurally (may get minor visual
  polish as a side effect of the layout pass, not a rework).
- Removing the existing plants-list entry point button.
- Any change to `dashboard-home` — same reasoning as the original proposal
  (that change is in-flight separately).
- Multi-select / comparing candidates side-by-side — selection stays
  single-candidate (radio).
- Any `gardenia-api` change — this proposal is scoped entirely to the web
  app, built on the API's existing, unmodified contract.

---

## Approach

Purely a presentation-layer rework inside the existing
`src/core/plant-identification/` bounded context, plus one small additive
change to `plants`' `CreatePlantModal` — no new domain interfaces, no
backend change, no new use-case. `IdentificationResultPanel` and the
create-plant flow are restructured around "the user's current candidate
selection" as shared local state owned by `IdentifyPlantScreen`. The
routing decision (existing identification mutation vs. the generic manual
flow) happens entirely on the client based on whether the current selection
equals the identification's own auto-resolved candidate. The manual path
reaches across into `plants`' existing `CreatePlantModal` — a presentation-
to-presentation reuse across bounded contexts, which this repo's DDD+
Hexagonal convention doesn't explicitly forbid at the UI layer (unlike the
backend's strict cross-context port rule) but is still worth flagging
explicitly (see design.md).
