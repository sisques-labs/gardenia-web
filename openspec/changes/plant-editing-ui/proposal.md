# Proposal: plant-editing-ui

## Intent

A user creating a plant has no way to fix a mistake afterwards: `plants-module` shipped
list + detail as read-mostly, and later changes only added narrow, single-field mutations
(`PlantPlantingSpotField` for the planting spot, watering for care logs). The application
layer already exposes a full `UpdatePlantUseCase` / `useUpdatePlant` hook backed by a working
`updatePlant` GraphQL mutation on `gardenia-api` — it was wired for the planting-spot field but
never surfaced as a general-purpose edit affordance. There is no UI path to rename a plant or
change its image once created.

## Scope

- `gardenia-web`, `plants` bounded context, presentation layer only — no domain/application/
  infrastructure changes, since `UpdatePlantUseCase`, `useUpdatePlant`, and the `updatePlant`
  mutation already exist and are exercised today by `PlantPlantingSpotField`.
- New `EditPlantModal` + `useEditPlantForm` hook, mirroring `CreatePlantModal` /
  `useCreatePlantForm` field-for-field (`name`, `imageUrl`) for UI consistency.
- New "Edit" action in `plant-detail.screen.tsx`'s action bar, opening the modal pre-filled
  with the current plant's `name`/`imageUrl`, submitting through the existing `useUpdatePlant`
  mutation.
- i18n: `plants.edit.*` keys (`en`/`es`) and `plants.detail.actions.edit` button label.

## Out of Scope

- Editing `plantSpeciesId` or `plantingSpotId` from this modal — species selection has no
  existing UI anywhere (not even at creation time) and is a larger, separate concern; planting
  spot already has its own dedicated field/control on the detail screen
  (`PlantPlantingSpotField`) and is intentionally left alone here.
- Editing from the plants list (`PlantCard`) — only the detail screen gets the entry point for
  this change; list-level quick-edit can be proposed separately if needed.
- Any `gardenia-api` change — the backend mutation and its resolver already support this.

## Rollback

Purely additive: remove the "Edit" button, `EditPlantModal`, and `useEditPlantForm`; the
underlying `useUpdatePlant` hook and mutation stay in place (still used by
`PlantPlantingSpotField`), so rollback carries no risk to existing functionality.
