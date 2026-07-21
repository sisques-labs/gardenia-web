# plant-identification-layout-v2

## MODIFIED Requirements

### Requirement: Identify screen layout is a single responsive column

The identify-plant screen MUST render its upload/submit stage, result stage,
and recent-identifications stage as a single top-to-bottom column at every
viewport width — it MUST NOT place the upload/submit stage and the result
stage in separate side-by-side columns at any breakpoint. Each stage MUST be
rendered inside a visually bounded section (`Card`) so the three stages are
distinguishable from one another without relying on whitespace alone.

#### Scenario: Desktop viewport shows a single constrained column

- GIVEN the identify screen is viewed at a desktop viewport width (e.g. 1280px)
- WHEN the page renders
- THEN the upload/submit stage and the result stage (once an identification
  exists) both render in the same vertical column, with the result stage
  below the upload/submit stage, not beside it

#### Scenario: Mobile viewport preserves the same stage order

- GIVEN the identify screen is viewed at a mobile viewport width (e.g. 375px)
- WHEN the page renders
- THEN the upload/submit stage renders first, the result stage renders below
  it once an identification exists, and the recent-identifications stage
  renders last — the same order as the desktop viewport

### Requirement: Every candidate card shows rank, common name, and a legible confidence signal

`CandidateSelectionList` MUST render each candidate with: its position in
the list (rank), its scientific name, its first common name when
`commonNames` is non-empty, and a confidence indicator that communicates
high/medium/low via more than color alone (e.g. a text label or icon in
addition to color), alongside the existing numeric percentage and progress
bar. The currently selected candidate MUST expose a selected-state
affordance beyond a border/background color change alone (e.g. a check
icon), so selection state doesn't rely solely on a subtle color shift.

#### Scenario: Candidate with a common name

- GIVEN an identification with a candidate whose `commonNames` is
  `['Swiss cheese plant', 'Monstera']`
- WHEN the candidate list renders
- THEN the card shows the scientific name and "Swiss cheese plant" as a
  secondary line

#### Scenario: Candidate with no common name

- GIVEN a candidate whose `commonNames` is `[]`
- WHEN the candidate list renders
- THEN the card shows only the scientific name, with no empty/placeholder
  common-name line

#### Scenario: Confidence tiers are visually distinct

- GIVEN three candidates with scores `0.85`, `0.55`, and `0.2`
- WHEN the candidate list renders
- THEN each candidate's confidence indicator is visually distinguishable
  (not identical styling) and each carries a text label or icon indicating
  its tier, not color alone

#### Scenario: Selecting a candidate shows a non-color selected affordance

- GIVEN a rendered candidate list with no selection
- WHEN the user selects a candidate card
- THEN that card renders a selected-state marker (e.g. a check icon) in
  addition to any border/background change, and no other card shows it

## ADDED Requirements

### Requirement: Interactive controls meet a minimum mobile tap-target size

On the identify screen, interactive controls that a mobile user taps
directly (remove-photo button, organ select trigger, candidate cards, the
submit button) MUST have a rendered hit area of at least 44×44 CSS pixels.

#### Scenario: Remove-photo button is tappable on mobile

- GIVEN the photo/organ picker shows at least one added photo
- WHEN the screen is viewed at a mobile viewport width
- THEN the remove-photo button's hit area is at least 44×44 CSS pixels

## Non-Regression (carried over unchanged from `plant-identification-redesign`)

This change does not modify — and its implementation MUST NOT regress —
the requirements already specified in
`openspec/changes/plant-identification-redesign/spec.md`:

- Sidebar entry point.
- Every returned candidate remains individually selectable regardless of
  `resolved`/`no_match` status.
- Confirming the auto-resolved candidate still calls the existing
  `createPlantFromIdentification` mutation unchanged.
- Confirming any other candidate, or "Ninguna de estas es correcta", still
  opens the existing `CreatePlantModal` pre-filled the same way.
