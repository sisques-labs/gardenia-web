# Spec: gbif-species-search (web)

## Requirements

### R-1 — Live species search in create/edit plant forms

`CreatePlantModal` and `EditPlantModal` MUST show a species search field
(`SpeciesCombobox`) that queries the api's `gbifSpeciesSearch` GraphQL query
live as the user types, debounced 300ms, with no query fired for input under
2 characters.

### R-2 — Nothing is persisted client-side beyond the normal query cache

Species search results MUST NOT be written to Zustand, `localStorage`, or any
other persistent client store. They may live in TanStack Query's normal
in-memory cache for the session, like any other server-data query in this
app.

### R-3 — Selecting a result stores key + name on the plant

Selecting a suggestion MUST set the form's `gbifSpeciesKey` (number) and
`speciesScientificName` (string) fields. Submitting the create/edit form MUST
send both fields to the `createPlant`/`updatePlant` mutation. Leaving the
field untouched MUST NOT send either field (create) or send them as
unchanged (edit, matching existing partial-update semantics).

### R-4 — Reasonable degradation on search failure

If the `gbifSpeciesSearch` query fails or times out, the combobox MUST show
an inline "search unavailable" state (`plants.speciesSearch.unavailable`) and
MUST NOT crash the modal or block the rest of the form (name/imageUrl remain
editable and submittable without a species selected).

### R-5 — Read side shows the plant's own chosen name, not a resolved catalog entry

`PlantCard` and the plant detail screen MUST render
`plant.speciesScientificName` (falling back to the existing "no species"
placeholder when null/undefined). Neither MUST reference the removed
`plant.species` nested object.

### R-6 — i18n parity

New copy (`plants.speciesSearch.label`, `.placeholder`, `.noResults`,
`.unavailable`) MUST exist in both `en.ts` and `es.ts` and pass the existing
`plants` module `i18n-parity.test.ts`.

### R-7 — Storybook coverage

`SpeciesCombobox` MUST have a co-located `species-combobox.stories.tsx`
seeding `useSpeciesSearch`'s TanStack Query cache with fixture data (not
mocking the hook module), per this repo's mandatory storybook convention.

## Acceptance Scenarios

**S-1**: User opens "Create plant", types "Monst" in the species field →
after a ~300ms pause, a list of GBIF matches (e.g. "Monstera deliciosa")
appears.

**S-2**: User selects "Monstera deliciosa" from the list → the field shows
the chosen name; submitting the form sends `gbifSpeciesKey: 2882337,
speciesScientificName: "Monstera deliciosa"` (example key) along with
`name`/`imageUrl` to the create mutation.

**S-3**: User submits the create form without touching the species field →
the mutation is sent without `gbifSpeciesKey`/`speciesScientificName`; the
created plant has no species.

**S-4**: The `gbifSpeciesSearch` query fails (network error / api down) →
the combobox shows "Species search is unavailable right now" instead of a
spinner or a crash; the rest of the form stays usable.

**S-5**: A plant card/detail for a plant with `speciesScientificName: "Ficus
lyrata"` renders "Ficus lyrata"; a plant with `speciesScientificName: null`
renders the existing "no species" placeholder — unchanged from today's
behavior other than the underlying field name.

**S-6**: User edits an existing plant that already has a species, opens
"Edit" → the species field is pre-filled with the plant's current
`speciesScientificName` (no `gbifSpeciesKey` round-trip needed to display
it — the name alone is enough to show the pre-filled value).
