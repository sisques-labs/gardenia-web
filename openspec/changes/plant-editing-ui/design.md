# Design: plant-editing-ui

## Layering

```
plant-detail.screen.tsx                        Client — "Edit" button + isEditOpen state
  └─ EditPlantModal                             Presentation component (mirrors CreatePlantModal)
       └─ useEditPlantForm(plant, onClose)       Presentation hook — React Hook Form + Zod
            ├─ createPlantSchema                 Reused as-is (identical fields/validation)
            └─ useUpdatePlant()                   Existing TanStack useMutation hook
                 └─ UpdatePlantUseCase             Existing application use case (unchanged)
                      └─ plantsGqlRepository.update Existing GQL mutation (unchanged)
```

No new files below the presentation layer — `UpdatePlantInput`, `UpdatePlantUseCase`,
`useUpdatePlant`, and the `updatePlant` GraphQL mutation already exist and are exercised today
by `PlantPlantingSpotField`. This change only adds a second consumer of `useUpdatePlant` for the
`name`/`imageUrl` fields.

## Schema reuse

`useEditPlantForm` reuses `createPlantSchema` (`presentation/schemas/create-plant.schema.ts`)
rather than introducing an `edit-plant.schema.ts` duplicate — the create and edit forms have
identical fields (`name`, `imageUrl`) and identical validation rules. Introducing a second Zod
object with the same shape would be pure duplication with no behavioral difference; if the two
forms ever diverge (e.g. edit needs a field create doesn't), the schemas should be split then.

## Component

`EditPlantModal` (`presentation/components/edit-plant-modal/edit-plant-modal.tsx`) is a direct
sibling of `CreatePlantModal`, reusing `FormModal`, `Input`, and `resolveFieldError`. It takes
`{ plant: { id, name, imageUrl }, dict, onClose }` instead of `{ spaceId, dict, onClose }` —
`plant.imageUrl` seeds the form's default value via `useForm({ defaultValues })`, and
`imageUrl || null` (rather than create's `imageUrl || undefined`) is sent on submit, since
`UpdatePlantInput.imageUrl` is `string | null | undefined` and an explicit `null` is how a
caller clears a previously-set image through this mutation.

## State

`plant-detail.screen.tsx` gets a second local `useState` (`isEditOpen`), following the exact
pattern already used for `isDeleteOpen` — conditionally rendering `<EditPlantModal>` only while
open, so the mutation hook (and its `QueryClient` dependency) is never mounted until the user
opens the modal.

## i18n

New keys under `plants`:

```
plants.edit.title
plants.edit.name
plants.edit.namePlaceholder
plants.edit.nameRequired
plants.edit.nameMax
plants.edit.imageUrl
plants.edit.imageUrlPlaceholder
plants.edit.submit
plants.edit.submitting
plants.edit.cancel
plants.edit.error
plants.detail.actions.edit
```

Mirrors `plants.create.*` naming 1:1 so the two dictionaries stay easy to compare at a glance.
