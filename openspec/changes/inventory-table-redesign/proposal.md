# Proposal: inventory-table-redesign

## Intent

### Problem

The `inventory` module (`src/core/inventory/`) shipped as a v1 "bring everything,
filter in the browser" screen (see `openspec/changes/inventory-web/proposal.md`,
§Out of scope): it fetches a hardcoded `perPage: 100` snapshot and filters/searches
entirely client-side. Row actions are three inline ghost buttons, and Delete
fires the mutation immediately with **no confirmation** — a real data-loss risk
now that `plants` already fixed the same problem via `ConfirmDialog`. There is
also no way to select multiple rows and act on them, and a `findById`
query/repo/use-case already exists but nothing in the UI uses it.

### Why now

`plants` (`src/core/plants/presentation/`) already solved every one of these
problems for a structurally identical list-with-filters screen: server-side
pagination (`usePaginatedPlants` + `useUrlPage`), server-side debounced search
via `Filter[]`/`FilterOperator` (`usePlantFilters`), and delete-with-confirmation
(`useDeletePlantConfirm` + shared `ConfirmDialog`). The shared `DataTable`
(`src/shared/presentation/components/ui/table/table.tsx`) already supports
controlled server-side `sorting`, a `pagination` prop, and `enableRowSelection`
— none of which `InventoryTable` currently passes in. This change is porting an
already-proven pattern into `inventory`, not inventing one.

The gardenia-api `inventory` context already exposes everything needed for
pagination/sort/filter (`InventoryItemFindByCriteria` with real `page`/`perPage`,
a filterable-fields registry, generic sorts) — the 100-item cap and client-side
filtering are purely a web-side v1 shortcut, not an API limitation.

### Success looks like

- The inventory table paginates and sorts server-side, no artificial 100-item
  ceiling.
- Search/type/low-stock/expiring-soon filters are sent to the API as criteria
  (debounced for the free-text search), shown as removable chips.
- Row actions collapse into a "⋯" dropdown (View detail / Adjust / Edit / Delete).
- Delete (single or bulk) always asks for confirmation via the shared
  `ConfirmDialog` before calling the mutation.
- Users can select multiple rows and bulk-delete them in one action, backed by
  the new `inventoryItemsDeleteBulk` GraphQL mutation (see the companion
  gardenia-api change `inventory-bulk-delete`).
- Clicking a row (or "View detail") opens a drawer with the item's full detail
  (brand, notes, acquired/expiry dates, timestamps) — fields not shown in the
  table today.

---

## Scope (this change)

### In scope

- **Server-side pagination**: `usePaginatedInventoryItems(spaceId, { page, perPage, filters, sorts })` mirroring `usePaginatedPlants`; wire `useUrlPage` + `DataTablePagination` into `InventoryTable`.
- **Server-side sorting**: wire `DataTable`'s controlled `sorting`/`onSortingChange` + `SortableHeader` on sortable columns (name, quantity, expiresAt); translate to `InventoryItemSortInput[]`.
- **Server-side filtering**: extend `useInventoryFilters` to debounce search (`useDebouncedValue`) and emit `InventoryFilter[]` (type, name LIKE, low-stock, expiring-before) instead of filtering an in-memory array; add `InventoryItemQueryableField` enum (mirrors `PlantQueryableField`) and `InventoryFilter` type on the web side.
- **Quick filter chips**: `ActiveFilterChips` row summarizing active filters (type / low-stock / expiring-soon / search term) with per-chip removal.
- **Row actions dropdown**: replace the 3 inline buttons with `DropdownMenu` (View detail, Adjust, Edit, Delete — Delete visually distinct/destructive).
- **Delete confirmation**: `useDeleteInventoryItemConfirm` (mirrors `useDeletePlantConfirm`) + shared `ConfirmDialog`, for both single-row and bulk delete.
- **Item detail drawer**: `useInventoryItem(id)` hook (the query/repo/use-case already exist, unused) + a `Drawer`-based detail view.
- **Bulk selection + bulk delete**: `enableRowSelection` on `InventoryTable`, a selection toolbar (count + "Delete selected"), `useBulkDeleteInventoryItems` calling the new `inventoryItemsDeleteBulk` mutation.

### Out of scope

- Bulk create/update/adjust (API doesn't support it; only bulk delete does, per the companion API change).
- Column reordering/visibility toggles.
- Infinite scroll (page-based, like `plants`, not cursor-based).
- CSV/Excel export.
- Any change to the create/edit/adjust modals themselves (they stay as-is).

---

## Approach

### Option A — Port the `plants` pattern into `inventory` (selected)

Reuse, file-for-file, the same hook shapes and shared components `plants`
already uses for this exact problem (paginated list + debounced server filter +
confirm-before-delete). Add `enableRowSelection` + a bulk-delete path on top,
which `plants` doesn't need yet but `DataTable` already supports.

**Rationale**: lowest risk — the pattern is already in production for `plants`,
already tested, and already reviewed. No new shared-component work needed
(`DataTable`, `ConfirmDialog`, `DropdownMenu`, `ActiveFilterChips`, `Drawer`,
`useDebouncedValue`, `useUrlPage` all already exist and are unused-but-ready in
`inventory`).

### Rejected alternatives

- **Cursor-based / infinite-scroll pagination**: no other module in this
  codebase uses it; would introduce a second pagination paradigm for no
  benefit over the existing page-based one `plants` already validated.
- **Keep client-side filtering, just fix delete confirmation + dropdown**: was
  considered as a smaller v1.1, but the hardcoded `perPage: 100` is a silent
  data-loss risk for any space with >100 items (rows past the cap are simply
  invisible, not just unfiltered) — not acceptable for a "redesign," so server
  pagination is included.
- **Optimistic bulk delete (delete rows from cache before the mutation
  resolves)**: rejected for v1 — the mutation call is fast and returns
  per-id results (`deletedIds`/`notFoundIds`); waiting for the real response
  and reconciling from it is simpler and avoids a rollback code path for the
  rare partial-failure case.

---

## Delivery

Chained PRs (400-line cap), in dependency order:

1. **PR1 — Row actions + delete confirmation** (no API dependency, no schema change).
2. **PR2 — Server-side pagination + sorting** (depends on PR1 landing for the columns file it also touches).
3. **PR3 — Server-side filters + quick filter chips** (depends on PR2 for the `usePaginatedInventoryItems` variables shape).
4. **PR4 — Item detail drawer** (independent of PR2/PR3, can land any time after PR1).
5. **PR5 — Bulk selection + bulk delete** — **blocked on the gardenia-api change `inventory-bulk-delete` shipping first** (needs `inventoryItemsDeleteBulk` in the GraphQL schema).

---

## Risks

1. **`InventoryItemFindByCriteria`'s exact filter operator semantics for `low_stock`/`expiringBefore` haven't been exercised from the web client before** (the original `inventory-web` change explicitly deferred this — see its Risks §2). Mitigation: mirror `plants`' `LIKE` usage for `name` exactly, and unit-test the GQL repository against the mocked Apollo client per field, same as `plants.gql.repository.spec.ts` does.
2. **Page-reset-on-filter-change bug class**: `plants-list.screen.tsx` has a documented ref-based workaround (lines 39–56) for a stale-closure page-reset bug. Port that exact pattern, don't rediscover it.
3. **Bulk delete UI ships before the API mutation exists** if PR5 is attempted before the API change merges — sequencing risk. Mitigation: PR5 explicitly gated on the API change's merge in tasks.md.
4. **Existing tests assert `enableRowSelection={false}`** (`inventory-table.spec.tsx`) — PR5 must update this test alongside the change, not leave it stale/failing.

---

## Affected Areas

- `src/core/inventory/domain/enums/inventory-item-queryable-field.enum.ts` — new (mirrors `PlantQueryableField`).
- `src/core/inventory/application/interfaces/inventory-filter.interface.ts` — new (mirrors `PlantFilter`).
- `src/core/inventory/application/use-cases/get-inventory-items/` — modify to accept `{ filters, sorts, pagination }`.
- `src/core/inventory/infrastructure/repositories/graphql/` — modify `queries/inventory-items-find-by-criteria.query.ts` call site + `inventory.gql.repository.ts` to forward real pagination/filters/sorts instead of the hardcoded `{ page: 1, perPage: 100 }`.
- `src/core/inventory/presentation/hooks/` — new `use-paginated-inventory-items/`, `use-inventory-item/`, `use-delete-inventory-item-confirm/`, `use-bulk-delete-inventory-items/`; modify `use-inventory-filters/`.
- `src/core/inventory/presentation/components/` — modify `inventory-table` (columns → dropdown actions, controlled sort/pagination/selection); new `inventory-item-detail-drawer/`, `inventory-bulk-actions-bar/`.
- `src/core/inventory/presentation/screens/inventory-list/inventory-list.screen.tsx` — modify (mirrors `plants-list.screen.tsx` wiring).
- `src/core/inventory/presentation/i18n/{en,es}.ts` — add copy for dropdown items, confirm dialog, detail drawer, bulk toolbar, filter chips.
