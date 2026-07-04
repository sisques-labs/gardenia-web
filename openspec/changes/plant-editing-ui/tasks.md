# Tasks: plant-editing-ui

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated lines | ~230 lines |
| 400-line budget risk | Low |
| Chained PRs | No (single PR) |
| Delivery strategy | ship directly |

## Phase 1 — Presentation hook

- [x] T-1 — `useEditPlantForm(plant, onClose)` hook: React Hook Form + `createPlantSchema`
  (reused, no new schema file), seeded with `defaultValues: { name: plant.name, imageUrl:
  plant.imageUrl ?? '' }`, submits via `useUpdatePlant().mutate({ id, name, imageUrl: imageUrl
  || null }, { onSuccess: onClose })`.

## Phase 2 — Component

- [x] T-2 — `EditPlantModal` component mirroring `CreatePlantModal` (`FormModal` + `Input` +
  `resolveFieldError`), taking `{ plant, dict, onClose }`.
- [x] T-3 — `edit-plant-modal.spec.tsx`: dialog renders, cancel calls `onClose` (mirrors
  `create-plant-modal.spec.tsx`).

## Phase 3 — Screen wiring

- [x] T-4 — "Edit" button in `plant-detail.screen.tsx`'s action bar (`btn-edit-plant`,
  `Pencil` icon), `isEditOpen` state, conditional `<EditPlantModal>` render pre-filled from the
  loaded `plant`.
- [x] T-5 — `plant-detail.screen.spec.tsx`: new test asserting the edit button opens the modal
  for the current plant id; updated the existing action-bar assertion to include
  `btn-edit-plant`.

## Phase 4 — i18n

- [x] T-6 — `plants.edit.*` + `plants.detail.actions.edit` keys added to `en.ts`/`es.ts`;
  `i18n-parity.test.ts` passes unchanged (validates by construction).
- [x] T-7 — Updated local dict fixtures in `plant-detail.screen.spec.tsx` and
  `plants-list.screen.spec.tsx` to satisfy the widened `PlantsDict` type.

## Phase 5 — Verify & ship

- [x] T-8 — `pnpm test` (1352 tests), `pnpm lint`, `pnpm tsc --noEmit` — all green.
- [x] T-9 — PR opened against `develop`.
