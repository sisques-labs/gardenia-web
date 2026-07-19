# plant-identification-redesign

## ADDED Requirements

### Requirement: Sidebar entry point

The app sidebar MUST include a top-level "Identificar planta" navigation
item linking to `/[lang]/plants/identify`, alongside the existing
Home/Plants/Calendar/etc. entries.

#### Scenario: Navigating to plant identification from the sidebar

- GIVEN an authenticated user viewing any page inside the app shell
- WHEN they open the sidebar
- THEN "Identificar planta" appears as its own item and navigates to the
  identify-plant screen when clicked

### Requirement: Every returned candidate is selectable, regardless of status

`IdentificationResultPanel` MUST render every candidate PlantNet returned
as an individually selectable option with its confidence percentage,
whether or not the identification auto-resolved (`status: 'resolved'` or
`status: 'no_match'`), instead of only exposing the auto-resolved
candidate.

#### Scenario: Selecting a non-auto-resolved candidate

- GIVEN a resolved identification with 3 candidates, where the server
  auto-resolved rank 0 but the user believes rank 2 is correct
- WHEN the user selects rank 2's card
- THEN rank 2 becomes the active selection (rank 0 is no longer selected)
  and confirming creates the plant using rank 2

#### Scenario: Creating a plant from a `no_match` identification

- GIVEN an identification with `status: 'no_match'` and a non-empty
  candidate list
- WHEN the user selects one of the listed candidates and confirms
- THEN the plant is created using that candidate — previously impossible,
  since no create action existed for `no_match` identifications

### Requirement: Manual GBIF search fallback

When none of the returned candidates match what the user sees, they MUST be
able to open the existing manual "Crear planta" flow (live GBIF search via
`SpeciesCombobox`) directly from the identification result, with the
identification's first submitted photo pre-filled as the new plant's image.

#### Scenario: None of the candidates are correct

- GIVEN an identification whose candidates do not include the plant's real
  species
- WHEN the user selects "Ninguna de estas es correcta"
- THEN the manual create-plant form opens with the identification's first
  photo already set as the image, and the user can search and pick any
  species from the full GBIF catalog
