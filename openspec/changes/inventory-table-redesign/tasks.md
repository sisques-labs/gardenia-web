# Tasks: inventory-table-redesign

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 900 – 1200 total across all PRs |
| 400-line budget risk | High if done as one PR |
| Chained PRs recommended | Yes — 5 PRs |
| Chain strategy | PR1 → PR2 → PR3 → PR4 (parallel-safe with PR2/PR3) → PR5 (blocked on gardenia-api `inventory-bulk-delete`) |

### Suggested Work Units

| PR | Goal | Depends on |
|----|------|------------|
| 1 | Row actions dropdown + delete confirmation | — |
| 2 | Server-side pagination + sorting | PR1 (touches same columns file) |
| 3 | Server-side filtering + quick filter chips | PR2 (shares query-variables shape) |
| 4 | Item detail drawer | PR1 |
| 5 | Bulk selection + bulk delete | PR3, and gardenia-api `inventory-bulk-delete` merged |

---

## PR1: Row Actions Menu & Delete Confirmation

- [x] 1.1 RED+GREEN: `presentation/hooks/use-delete-inventory-item-confirm/use-delete-inventory-item-confirm.hook.spec.ts` + `.hook.ts` — mirrors `use-delete-plant-confirm.hook.ts`: `requestDelete(item)`, `confirmDelete()`, `cancelDelete()`, `isError`
- [x] 1.2 Modify `presentation/components/inventory-table/inventory-columns.tsx` — replace 3 inline buttons with `DropdownMenu`/`DropdownMenuTrigger`/`DropdownMenuContent`/`DropdownMenuItem` (Adjust, Edit, separator, Delete destructive). Deviation: "View detail" is NOT stubbed here — added directly in PR4 once the drawer exists, to avoid shipping a dead menu item. `onDelete` prop changed from `(id: string) => void` to `(item: InventoryItem) => void` to match `requestDelete`'s signature.
- [x] 1.3 RED+GREEN: update `inventory-table.spec.tsx` — dropdown opened via `userEvent` + `getByLabelText('Open actions menu')`; menu items fire adjust/edit/delete callbacks with the full item; clicking Delete does NOT call the mutation (only notifies the caller)
- [x] 1.4 Modify `presentation/screens/inventory-list/inventory-list.screen.tsx` — wire `useDeleteInventoryItemConfirm`, render `ConfirmDialog` (mirrors `plants-list.screen.tsx:170-180`) and an `Alert` on `isError` (mirrors `plants-list.screen.tsx:127-129`), `onDelete` prop now is `requestDelete`
- [x] 1.5 RED+GREEN: update `inventory-list.screen.spec.tsx` — mocks `useDeleteInventoryItemConfirm` directly (mirrors `plants-list.screen.spec.tsx`); covers request-without-mutating, confirm-dialog visibility, confirm calling `confirmDelete`, error alert
- [x] 1.6 Modify `presentation/i18n/{en,es}.ts` — add `dict.row.actionsMenu`, `dict.delete.{confirmTitle,confirmDescription,confirm,cancel,error}`; remove the now-superseded unused `dict.list.deleteConfirm` and `dict.errors.deleteFailed` keys
- [x] 1.7 `pnpm test` (inventory) + `pnpm lint` + `pnpm tsc --noEmit` green

## PR2: Server-Side Pagination & Sorting

- [x] 2.1 Create `domain/enums/inventory-item-queryable-field.enum.ts` — `InventoryItemQueryableField`, full whitelist mirroring the API enum (SCREAMING_CASE wire values, since the API registers it via `registerEnumType` with no `valuesMap`)
- [x] 2.2 Create `application/interfaces/inventory-filter.interface.ts` — `type InventoryFilter = Filter<InventoryItemQueryableField>`
- [x] 2.3 Create `application/interfaces/inventory-sort.interface.ts` — `type InventorySort = Sort<InventoryItemQueryableField>`
- [x] 2.4 RED+GREEN: modify `application/use-cases/get-inventory-items/get-inventory-items.use-case.ts` (+spec) — accept `{ filters?, sorts?, pagination? }`, delegate to `repository.findByCriteria(criteria)`, return `PaginatedResult<InventoryItem>`
- [x] 2.5 Modify `application/ports/inventory.repository.port.ts` + `application/interfaces/inventory-list-criteria.interface.ts` (new) — `findByCriteria(criteria?: InventoryListCriteria): Promise<PaginatedResult<InventoryItem>>`
- [x] 2.6 RED+GREEN: modify `infrastructure/repositories/graphql/inventory.gql.repository.ts` (+spec) + the GQL query (add `total`/`page`/`perPage`/`totalPages` fields) + response type — forward `filters`/`sorts`/`pagination` as the GraphQL input variable; removed the hardcoded `{ page: 1, perPage: 100 }` default entirely (kept `fetchPolicy: 'network-only'`, matching `plants.gql.repository.ts`)
- [x] 2.7 Create `presentation/hooks/use-paginated-inventory-items/use-paginated-inventory-items.hook.ts` (+spec) — mirrors `use-paginated-plants.hook.ts`; `queryKey: ['inventory', 'paginated', page, perPage, filters, sorts]` (no `spaceId` segment — this module doesn't scope query keys by space today, unlike `plants`; out of scope to change here). Deleted the now-superseded `use-inventory-items` hook + spec (only consumer was this screen).
- [x] 2.8 Modify `presentation/components/inventory-table/inventory-columns.tsx` — wrap Name/Quantity headers in `SortableHeader`; `itemType` explicitly `enableSorting: false`. Deviation: no Expires-at column exists in the table (only surfaced via the Status badge) — sorting scoped to the two columns that actually render a comparable scalar value.
- [x] 2.9 Modify `presentation/components/inventory-table/inventory-table.tsx` — accept + forward `sorting`/`onSortingChange`/`pagination` props to `DataTable`
- [x] 2.10 Modify `presentation/screens/inventory-list/inventory-list.screen.tsx` — replace `useInventoryItems` with `usePaginatedInventoryItems` + `useUrlPage`; map `SortingState` → `InventorySort[]` (name/quantity only). Deferred the ref-based page-reset-on-filter-change fix to PR3: filters don't affect the query yet in PR2 (still client-side over the current page), so there's nothing to reset against.
- [x] 2.10b Extracted `presentation/components/inventory-list-skeleton/inventory-list-skeleton.tsx` (was inline in the screen) and wrapped the route in `<Suspense>` in `app/[lang]/(protected)/inventory/page.tsx` — required because `useUrlPage` calls `useSearchParams()`, which needs a Suspense boundary in the App Router (mirrors `plants`' `page.tsx`).
- [x] 2.11 RED+GREEN: update `inventory-list.screen.spec.tsx` — mocks `usePaginatedInventoryItems` + `next/navigation` (mirrors `plants-list.screen.spec.tsx`); pagination footer renders only when `totalPages > 1`
- [x] 2.12 `pnpm test` (250 suites/1218 tests) + `pnpm lint` + `pnpm tsc --noEmit` green

## PR3: Server-Side Filtering & Quick Filter Chips

- [x] 3.1 RED+GREEN: rewrote `presentation/hooks/use-inventory-filters/use-inventory-filters.hook.ts` (+spec) — debounces `query` via `useDebouncedValue`; returns `filterState` (for the UI controls, unchanged shape) + `filters: InventoryFilter[]` (name LIKE, itemType EQUALS, low_stock EQUALS true, expiresAt LESS_THAN_OR_EQUAL against a stable "now" captured once via `useState(() => Date.now())` — a raw `Date.now()` call inside the `useMemo` body tripped the `react-hooks/purity` lint rule) + `removeFilter(key)`
- [x] 3.2 Deleted `filter-inventory-items.ts` + spec — confirmed no other caller before removing; kept `is-low-stock.ts`/`is-expiring-soon.ts` (still used by the table's Status column badges, independent of the filter criteria)
- [x] 3.3 Modified `presentation/components/inventory-filters/inventory-filters.tsx` — renders `ActiveFilterChips` below the filter controls, one chip per active filter (search/type/lowStock/expiringSoon), wired to `onRemoveFilter`
- [x] 3.4 RED+GREEN: updated `inventory-filters.spec.tsx` — chips render for each active filter (queried via `getByLabelText('Remove …')` to disambiguate from the Select's own option text); removing a chip calls `onRemoveFilter` with the right key
- [x] 3.5 Modified `presentation/i18n/{en,es}.ts` — added `dict.filters.searchChipLabel` ("Search"/"Búsqueda"); type/lowStock/expiringSoon chips reuse existing `dict.types[...]`/`dict.filters.lowStockOnly`/`dict.filters.expiringSoon` labels, no new keys needed for those
- [x] 3.6 Wired `usePaginatedInventoryItems({ page, filters, sorts })` in the screen (removed the interim client-side re-filter from PR2) and ported the ref-based page-reset-on-filter-change effect from `plants-list.screen.tsx:39-56` (deferred in PR2 since filters didn't affect the query yet)
- [x] 3.7 `pnpm test` (250 suites/1227 tests) + `pnpm lint` + `pnpm tsc --noEmit` green

## PR4: Item Detail Drawer

- [x] 4.1 Deviation from plan: did NOT create a `use-inventory-item`/`GetInventoryItemUseCase` fetch. The paginated list query already selects every field (brand, notes, acquiredAt, expiresAt, createdAt, updatedAt) for each row, so a second `findById` round trip for data already in hand would violate the "no wasted network round trip" rule in AGENTS.md. The drawer receives the already-loaded `InventoryItem` object directly. `GetInventoryItemUseCase`/`findById` remain available, unused, for a future deep-link scenario (e.g. `/inventory/[id]` without the list loaded) — not needed here.
- [x] 4.2 RED+GREEN: created `presentation/components/inventory-item-detail-drawer/inventory-item-detail-drawer.tsx` (+spec, +stories) — takes `item: InventoryItem | null` directly; renders itemType/brand/quantity/lowStockThreshold/acquiredAt/expiresAt/notes/createdAt/updatedAt (dates via `formatShortDate(iso, lang)`, mirrors `plant-card.tsx`), `dict.detail.noValue` ("—") placeholder for absent optional fields, using the shared `Drawer`
- [x] 4.3 Modified `presentation/components/inventory-table/inventory-columns.tsx` + `inventory-table.tsx` — added the "View detail" dropdown item (first item, above Adjust/Edit/Delete) wired via a new `onViewDetail` prop
- [x] 4.4 Modified `presentation/screens/inventory-list/inventory-list.screen.tsx` — `viewingItem: InventoryItem | null` state (not just an id, since we already have the full object), renders `InventoryItemDetailDrawer` unconditionally (drawer itself no-ops when `item` is null); un-prefixed the `lang` prop (was `lang: _lang`, now used for date formatting)
- [x] 4.5 Modified `presentation/i18n/{en,es}.ts` — added `dict.row.viewDetail`, `dict.detail.{createdAt,updatedAt,noValue}`; reused existing `dict.form.*` labels for brand/quantity/lowStockThreshold/acquiredAt/expiresAt/notes instead of duplicating them
- [x] 4.6 `pnpm test` (251 suites/1232 tests) + `pnpm lint` + `pnpm tsc --noEmit` green

## PR5: Bulk Selection & Bulk Delete

> Do not start until `sisques-labs/gardenia-api`'s `inventory-bulk-delete` change
> is merged and `inventoryItemsDeleteBulk` is live in the GraphQL schema.

- [x] 5.1 Created `infrastructure/repositories/graphql/mutations/inventory-items-delete-bulk.mutation.ts` — `gql` document for `inventoryItemsDeleteBulk`; also added `domain/interfaces/bulk-delete-result.interface.ts` (`BulkDeleteResult`) and its response type
- [x] 5.2 RED+GREEN: modified `infrastructure/repositories/graphql/inventory.gql.repository.ts` (+spec) — added `deleteBulk(ids: string[])` returning `{ deletedIds, notFoundIds, deletedCount, requestedCount }`
- [x] 5.3 Modified `application/ports/inventory.repository.port.ts` — added `deleteBulk` to `IInventoryRepository`; updated all 6 existing use-case spec mocks to satisfy the widened interface
- [x] 5.4 RED+GREEN: created `application/use-cases/delete-inventory-items-bulk/delete-inventory-items-bulk.use-case.ts` (+spec)
- [x] 5.5 RED+GREEN: created `presentation/hooks/use-bulk-delete-inventory-items/use-bulk-delete-inventory-items.hook.ts` (+spec) — `useMutation`, invalidates `['inventory']` on success (no `spaceId` segment, consistent with this module's existing query-key convention — see PR2 5.7 note)
- [x] 5.6 RED+GREEN: created `presentation/components/inventory-bulk-actions-bar/inventory-bulk-actions-bar.tsx` (+spec) — count + "Delete selected"; renders `null` at 0 selected
- [x] 5.7 Modified `presentation/components/inventory-table/inventory-table.tsx` — `enableRowSelection` now unconditionally `true`, forwards `onSelectionChange`
- [x] 5.8 RED+GREEN: updated `inventory-table.spec.tsx` — replaced the "no selection checkbox column" case with a selection-enabled case asserting `onSelectionChange` fires with the selected item
- [x] 5.9 Modified `presentation/screens/inventory-list/inventory-list.screen.tsx` — `selectedItems: InventoryItem[]` state (not just ids), a second `ConfirmDialog` instance for bulk delete, partial-failure message built via `dict.bulk.partialSuccess.replace('{deleted}', ...).replace('{total}', ...)` (a one-off placeholder-substitution — no prior interpolation convention existed in this codebase, and building a 2-number sentence from concatenated fragments read worse)
- [x] 5.10 RED+GREEN: updated `inventory-list.screen.spec.tsx` — bulk bar visibility, confirm-dialog-before-mutate, happy path, partial-failure message, error alert
- [x] 5.11 Modified `presentation/i18n/{en,es}.ts` — new `dict.bulk.*` section (selectedSuffix, deleteSelected, confirmTitle/Description, confirm, cancel, partialSuccess, error)
- [x] 5.12 `pnpm test` (254 suites/1250 tests) + `pnpm lint` + `pnpm tsc --noEmit` green

## Final Verify (after PR5)

- [x] V.1 Full `pnpm test` run covers `src/core/inventory/` with no regressions (254/254 suites green)
- [ ] V.2 Manual smoke in a running browser not performed in this environment (no dev server / backend available here) — recommend running through: paginate past 20 items, sort by name/quantity, combine filters + chip removal, single delete with confirm, bulk-select + bulk delete with a partial-failure case, open detail drawer
