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

- [ ] 3.1 RED+GREEN: modify `presentation/hooks/use-inventory-filters/use-inventory-filters.hook.ts` (+spec) — debounce `search` via `useDebouncedValue`; emit `InventoryFilter[]` (name LIKE, itemType EQUALS, low_stock EQUALS true, expiresAt LESS_THAN_OR_EQUAL) instead of the pure in-memory `filterInventoryItems`
- [ ] 3.2 Delete `application/use-cases`/domain pure filter helper `filter-inventory-items.ts` (+spec) — no longer used once filtering is server-side; confirm no other caller before removing
- [ ] 3.3 Modify `presentation/components/inventory-filters/inventory-filters.tsx` — render `ActiveFilterChips` below the filter controls, one chip per active filter, wired to per-field clear
- [ ] 3.4 RED+GREEN: update `inventory-filters.spec.tsx` — chips render for each active filter; removing a chip clears only that filter; debounce timing test (fake timers)
- [ ] 3.5 Modify `presentation/i18n/{en,es}.ts` — chip labels (e.g. "Type: Seeds", "Low stock", "Expiring soon", "Search: {term}")
- [ ] 3.6 `pnpm test` + `pnpm lint` + `pnpm tsc --noEmit` green

## PR4: Item Detail Drawer

- [ ] 4.1 RED+GREEN: create `presentation/hooks/use-inventory-item/use-inventory-item.hook.ts` (+spec) — wraps the existing (currently unused) `GetInventoryItemUseCase`; `useQuery(['inventory', spaceId, id], ..., { enabled: !!id })`
- [ ] 4.2 RED+GREEN: create `presentation/components/inventory-item-detail-drawer/inventory-item-detail-drawer.tsx` (+spec) — renders brand, notes, acquiredAt, expiresAt, createdAt, updatedAt with placeholder states for absent optional fields, using the shared `Drawer`
- [ ] 4.3 Modify `presentation/components/inventory-table/inventory-columns.tsx` — wire "View detail" dropdown item (stubbed in PR1) to open the drawer
- [ ] 4.4 Modify `presentation/screens/inventory-list/inventory-list.screen.tsx` — `selectedItemId` state, render `InventoryItemDetailDrawer` conditionally
- [ ] 4.5 Modify `presentation/i18n/{en,es}.ts` — drawer field labels, empty-state copy
- [ ] 4.6 `pnpm test` + `pnpm lint` + `pnpm tsc --noEmit` green

## PR5: Bulk Selection & Bulk Delete

> Do not start until `sisques-labs/gardenia-api`'s `inventory-bulk-delete` change
> is merged and `inventoryItemsDeleteBulk` is live in the GraphQL schema.

- [ ] 5.1 Create `infrastructure/repositories/graphql/mutations/inventory-items-delete-bulk.mutation.ts` — `gql` document for `inventoryItemsDeleteBulk`
- [ ] 5.2 RED+GREEN: modify `infrastructure/repositories/graphql/inventory.gql.repository.ts` (+spec) — add `deleteBulk(ids: string[])` returning `{ deletedIds, notFoundIds, deletedCount, requestedCount }`
- [ ] 5.3 Modify `application/ports/inventory.repository.port.ts` — add `deleteBulk` to `IInventoryRepository`
- [ ] 5.4 RED+GREEN: create `application/use-cases/delete-inventory-items-bulk/delete-inventory-items-bulk.use-case.ts` (+spec)
- [ ] 5.5 RED+GREEN: create `presentation/hooks/use-bulk-delete-inventory-items/use-bulk-delete-inventory-items.hook.ts` (+spec) — `useMutation`, invalidates `['inventory', spaceId]` on settle
- [ ] 5.6 RED+GREEN: create `presentation/components/inventory-bulk-actions-bar/inventory-bulk-actions-bar.tsx` (+spec) — count + "Delete selected"; hidden at 0 selected
- [ ] 5.7 Modify `presentation/components/inventory-table/inventory-table.tsx` — flip `enableRowSelection` to `true`, forward `onSelectionChange`
- [ ] 5.8 RED+GREEN: update `inventory-table.spec.tsx` — remove/replace the existing "asserts no selection checkbox column" case with selection-enabled coverage
- [ ] 5.9 Modify `presentation/screens/inventory-list/inventory-list.screen.tsx` — selection state, bulk `ConfirmDialog`, partial-failure message using `deletedCount`/`requestedCount`
- [ ] 5.10 RED+GREEN: update `inventory-list.screen.spec.tsx` — bulk delete happy path + partial-failure message case
- [ ] 5.11 Modify `presentation/i18n/{en,es}.ts` — bulk toolbar copy, partial-failure message
- [ ] 5.12 `pnpm test` + `pnpm lint` + `pnpm tsc --noEmit` green

## Final Verify (after PR5)

- [ ] V.1 `pnpm test:coverage` — no regression in `src/core/inventory/`
- [ ] V.2 Manual smoke: paginate past 100 items, sort by name/quantity/expiresAt, combine filters + chips removal, single delete with confirm, bulk-select + bulk delete with a partial-failure case, open detail drawer
