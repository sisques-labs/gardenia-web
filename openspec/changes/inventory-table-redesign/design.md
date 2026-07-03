# Design: inventory-table-redesign

## Technical Approach

Port the `plants` module's list/filter/delete pattern into `inventory`,
file-for-file where the shape matches, then extend `DataTable` usage with the
props it already supports but `InventoryTable` doesn't pass yet
(`pagination`, `sorting`/`onSortingChange`, `enableRowSelection`,
`onSelectionChange`). No changes to the shared `DataTable`, `ConfirmDialog`,
`DropdownMenu`, `ActiveFilterChips`, or `Drawer` components — they're already
built and already used elsewhere (`plants` for the first two, nothing yet for
the latter two, but their APIs are stable and documented in
`src/shared/presentation/components/ui/`).

## Architecture Decisions

| Decision | Choice | Alternatives rejected | Rationale |
|----------|--------|------------------------|-----------|
| Pagination model | Page-based (`page`, `perPage`), URL-driven via `useUrlPage` | Cursor-based / infinite scroll | Matches `plants` exactly; API's `InventoryItemCriteriaInput.pagination` is `{page, perPage}` already |
| Filter transport | `InventoryFilter[]` (`{field, operator, value}`) sent as GraphQL criteria, mirroring `PlantFilter`/`Filter<T>` | Keep bespoke `{query, type, lowStockOnly, expiringSoonOnly}` client shape, translate at the repo boundary | A typed `Filter<InventoryItemQueryableField>[]` matches what `InventoryItemFilterInput` expects 1:1 and is directly testable against the mocked Apollo client, same as `plants.gql.repository.spec.ts` |
| Search debounce | `useDebouncedValue(search)` inside `useInventoryFilters`, per AGENTS.md rule (now network-driving, no longer exempt) | Leave un-debounced | AGENTS.md: "Any text search input whose value drives a network query... MUST debounce" — was exempt while client-side-only; no longer exempt once it drives `findByCriteria` |
| Row actions UI | `DropdownMenu` ("⋯" trigger) with items: View detail, Adjust, Edit, separator, Delete (destructive style) | Keep 3 inline buttons | Scales to the new "View detail" action without cluttering the row; matches the user-requested redesign direction |
| Delete confirmation | `ConfirmDialog` + `use{X}DeleteConfirm` hook, exact shape of `useDeletePlantConfirm` | Inline `window.confirm` | Reuses the exact proven pattern; keeps focus management/i18n consistent with `plants` |
| Bulk delete request shape | One `inventoryItemsDeleteBulk` call with all selected ids | N sequential single-delete calls | Matches the new API mutation; a single network round trip; reconciles via `deletedIds`/`notFoundIds` in the response |
| Bulk delete UI reconciliation | Wait for the mutation response, then invalidate `['inventory']` and clear selection; show a toast/summary using `deletedCount`/`requestedCount` | Optimistic removal before the response | See proposal.md Rejected Alternatives — avoids a rollback path for the rare partial-failure case |
| Item detail | `Drawer` (`src/shared/presentation/components/ui/drawer/`) opened from a row click or the dropdown's "View detail", backed by a new `useInventoryItem(id)` hook wrapping the already-existing (but currently unused) `GetInventoryItemUseCase` | New dedicated `/inventory/[id]` route/screen | A drawer keeps the user in list context (matches how `plants` favors in-place modals over navigation); no new route/page needed |
| Sortable columns | Name, Quantity, Expires-at — wrapped in the existing `SortableHeader` | All columns sortable | Type and Status are derived/enum-ish and not meaningfully useful to sort by; matches `InventoryItemQueryableField`'s scalar fields |

## Data Flow

### Paginated + filtered + sorted list (PR2/PR3)

```
InventoryListScreen
  useUrlPage() ──page──┐
  useInventoryFilters() ──filters (debounced)──┤
  DataTable sorting state ──sorts──┘
                                     ▼
                     usePaginatedInventoryItems(spaceId, { page, perPage, filters, sorts })
                                     │
                         GetInventoryItemsUseCase.execute({ filters, sorts, pagination })
                                     │
                     InventoryGqlRepository.findByCriteria(criteria)
                                     │
                inventoryItemsFindByCriteria(input: { filters, sorts, pagination })
                                     │
                     PaginatedInventoryItemsResultDto { items, total, page, perPage, totalPages }
                                     │
                     InventoryTable renders `items`, DataTable's `pagination`/`sorting` props
                     reflect `total`/`totalPages`/current sort
```

Query key: `['inventory', spaceId, 'paginated', page, perPage, filters, sorts]`
— mirrors `usePaginatedPlants`'s key shape exactly so cache invalidation via
`invalidateQueries({ queryKey: ['inventory', spaceId] })` (used by the
create/update/delete/adjust/bulk-delete mutations) still matches by prefix.

### Bulk delete (PR5)

```
User selects N rows (DataTable enableRowSelection + onSelectionChange)
  → InventoryBulkActionsBar shows "N selected" + "Delete selected"
  → click → ConfirmDialog (reused component, same as single delete)
  → confirm → useBulkDeleteInventoryItems.mutate(selectedIds)
       → inventoryItemsDeleteBulk(input: { ids })
       → { deletedIds, notFoundIds, deletedCount, requestedCount }
  → onSuccess: invalidateQueries(['inventory', spaceId]), clear selection,
    if notFoundIds.length > 0 show a partial-failure toast
```

### Item detail drawer (PR4)

```
Row click / dropdown "View detail"
  → setSelectedItemId(id)
  → useInventoryItem(id) → GetInventoryItemUseCase.execute(id)
       → InventoryGqlRepository.findById(id) → inventoryItemFindById
  → InventoryItemDetailDrawer renders full fields (brand, notes, acquiredAt,
    expiresAt, createdAt, updatedAt) not shown in the table
```

## File Changes

```
src/core/inventory/
  domain/enums/inventory-item-queryable-field.enum.ts        # new
  application/interfaces/inventory-filter.interface.ts        # new
  application/interfaces/inventory-sort.interface.ts           # new
  application/use-cases/get-inventory-items/
    get-inventory-items.use-case.ts                            # modify: accept {filters, sorts, pagination}
    get-inventory-items.use-case.spec.ts                        # modify
  application/ports/inventory.repository.port.ts               # modify: findByCriteria(criteria) signature
  infrastructure/repositories/graphql/
    queries/inventory-items-find-by-criteria.query.ts           # no shape change (already generic)
    inventory.gql.repository.ts                                 # modify: forward filters/sorts/pagination, drop hardcoded {page:1, perPage:100}
    inventory.gql.repository.spec.ts                             # modify
  presentation/
    hooks/
      use-paginated-inventory-items/                            # new (mirrors use-paginated-plants)
      use-inventory-item/                                       # new (wraps existing GetInventoryItemUseCase)
      use-delete-inventory-item-confirm/                         # new (mirrors use-delete-plant-confirm)
      use-bulk-delete-inventory-items/                            # new
      use-inventory-filters/                                     # modify: debounce + emit InventoryFilter[]
    components/
      inventory-table/inventory-table.tsx                        # modify: dropdown actions, controlled sorting/pagination/selection
      inventory-columns.tsx                                       # modify: actions column → DropdownMenu, SortableHeader on name/quantity/expiresAt
      inventory-item-detail-drawer/                               # new
      inventory-bulk-actions-bar/                                 # new
      inventory-filters/inventory-filters.tsx                     # modify: ActiveFilterChips row
    screens/inventory-list/inventory-list.screen.tsx              # modify: useUrlPage, ConfirmDialog, detail drawer, bulk bar wiring
    i18n/{en,es}.ts                                               # modify: new copy; i18n-parity test stays green
```

## Interfaces / Contracts

```ts
// domain/enums/inventory-item-queryable-field.enum.ts
export enum InventoryItemQueryableField {
  ITEM_TYPE = 'itemType',
  NAME = 'name',
  QUANTITY = 'quantity',
  LOW_STOCK = 'low_stock',       // virtual — mirrors API's low_stock filter
  EXPIRES_AT = 'expiresAt',
}

// application/interfaces/inventory-filter.interface.ts
import type { Filter } from '@/shared/domain/interfaces/filter.interface';
export type InventoryFilter = Filter<InventoryItemQueryableField>;

// application/interfaces/inventory-sort.interface.ts
import type { Sort } from '@/shared/domain/interfaces/sort.interface'; // same shape used by plants, if present — else mirror Filter's pattern
export type InventorySort = Sort<InventoryItemQueryableField>;

// application/ports/inventory.repository.port.ts (modified)
export interface IInventoryRepository {
  findByCriteria(criteria: {
    filters?: InventoryFilter[];
    sorts?: InventorySort[];
    pagination?: { page: number; perPage: number };
  }): Promise<{ items: InventoryItem[]; total: number; page: number; perPage: number; totalPages: number }>;
  findById(id: string): Promise<InventoryItem | null>;
  // create/update/delete/adjustQuantity unchanged
  deleteBulk(ids: string[]): Promise<{ deletedIds: string[]; notFoundIds: string[]; deletedCount: number; requestedCount: number }>; // PR5
}
```

`usePaginatedInventoryItems` mirrors `usePaginatedPlants` verbatim in shape:

```ts
export interface UsePaginatedInventoryItemsOptions {
  page?: number;
  perPage?: number;
  filters?: InventoryFilter[];
  sorts?: InventorySort[];
}
export function usePaginatedInventoryItems(spaceId: string | null, options?: UsePaginatedInventoryItemsOptions) { /* useQuery, queryKey ['inventory', spaceId, 'paginated', page, perPage, filters, sorts] */ }
```

`useInventoryFilters` (modified): keeps raw `search` state updating
immediately; derives `filters: InventoryFilter[]` from `useDebouncedValue(search)`
plus the existing type/low-stock/expiring-soon toggles — same structure as
`usePlantFilters` but with more than one non-text filter, so the memo builds an
array of up to 4 entries instead of 0-or-1.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `use-paginated-inventory-items.hook.spec.ts` — forwards page/perPage/filters/sorts; query key shape | Vitest, mock use-case |
| Unit | `use-inventory-filters.hook.spec.ts` — debounced search only reflects in `filters` after the delay; type/low-stock/expiring toggles produce correct `Filter` entries; combining multiple filters | Vitest + fake timers |
| Unit | `inventory.gql.repository.spec.ts` — `findByCriteria` forwards `{filters, sorts, pagination}` as the GraphQL input variable verbatim (no hardcoded page/perPage) | `vi.mock('apolloClient')`, mirrors `plants.gql.repository.spec.ts` |
| Unit | `use-delete-inventory-item-confirm.hook.spec.ts` — request/confirm/cancel flow, mirrors `useDeletePlantConfirm` tests | Vitest |
| Unit | `use-bulk-delete-inventory-items.hook.spec.ts` — happy path, partial-failure response handling | Vitest |
| Unit | `use-inventory-item.hook.spec.ts` — wraps `GetInventoryItemUseCase`, `enabled: !!id` | Vitest |
| Component | `inventory-table.spec.tsx` — update: dropdown renders 4 actions incl. "View detail"; `enableRowSelection` now conditionally true (PR5); sorting header click calls `onSortingChange` | RTL |
| Component | `inventory-list.screen.spec.tsx` — update: delete now requires confirm step (was: fires immediately); pagination footer renders when `totalPages > 1`; page resets to 1 on filter change (mirrors the ref-based fix in `plants-list.screen.tsx:39-56`) | RTL |
| Component | `inventory-item-detail-drawer.spec.tsx` — new; renders all fields, closed state | RTL |
| Component | `inventory-bulk-actions-bar.spec.tsx` — new; shows count, disabled at 0 selected, confirm-then-mutate flow | RTL |
| i18n | `i18n-parity.test.ts` — extended keys still parity-checked | Vitest |

## Migration / Rollout

No server contract change in PR1–PR4 beyond calling the already-existing
`InventoryItemFindByCriteria`/`InventoryItemFindById` with real arguments
instead of hardcoded ones — safe to ship independently of the API. PR5
requires the companion gardenia-api change `inventory-bulk-delete` to be merged
and deployed first (new `inventoryItemsDeleteBulk` mutation) — sequenced last
in tasks.md for this reason.

## Open Questions

- Exact wording/threshold for the "partial failure" bulk-delete toast (e.g.
  "3 of 5 deleted, 2 no longer existed") — copy to be finalized during PR5
  i18n, not blocking earlier PRs.
