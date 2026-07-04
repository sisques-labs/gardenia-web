# Spec: plant-editing-ui

## Requirements

### R-1 — Edit entry point on the plant detail screen

The plant detail screen (`plant-detail.screen.tsx`) MUST show an "Edit" action in its action
bar, alongside "Mark watered" and "Delete plant".

### R-2 — Edit modal pre-filled with current values

Clicking "Edit" MUST open a modal form pre-filled with the plant's current `name` and
`imageUrl`, using the same validation as plant creation (`name` required, max 100 characters;
`imageUrl` optional).

### R-3 — Submitting updates the plant via the existing mutation

Submitting the form MUST call the existing `useUpdatePlant` mutation with the plant's `id` and
the edited `name`/`imageUrl`, and MUST NOT introduce a new mutation, use case, or repository
method.

### R-4 — Success closes the modal and refreshes data

On a successful update, the modal MUST close. Cache invalidation is already handled by
`useUpdatePlant` (`plants`, `plant`, `planting-spots`, `planting-spot` query keys) — no
additional invalidation is required.

### R-5 — Failure keeps the modal open with an error

On a failed update, the modal MUST stay open and show an inline error message
(`plants.edit.error`), matching the existing pattern in `CreatePlantModal`.

### R-6 — i18n parity

New copy MUST be added to both `en.ts` and `es.ts` under `plants.edit.*` and
`plants.detail.actions.edit`, and MUST pass the existing `i18n-parity.test.ts`.

## Acceptance Scenarios

**S-1**: User opens a plant's detail page, clicks "Edit" → sees a modal titled "Edit plant"
with the `name` field pre-filled with the plant's current name and the `imageUrl` field
pre-filled with its current image URL.

**S-2**: User clears the `name` field and submits → sees the "name is required" validation
error; no mutation is fired.

**S-3**: User changes the name to a valid value and submits → the update mutation fires with
`{ id, name, imageUrl }` → on success the modal closes and the detail screen shows the new
name.

**S-4**: The update mutation fails (network/server error) → the modal stays open and shows
"Could not update the plant. Try again." (`plants.edit.error`).

**S-5**: User clicks "Cancel" → the modal closes without calling the mutation.
