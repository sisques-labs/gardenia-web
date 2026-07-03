# Inventory Table Redesign — Specification

## Purpose

Define the behavioral requirements for redesigning the inventory screen from a
client-filtered, unconfirmed-delete list into a server-paginated/sorted/filtered
table with confirmed single/bulk delete, a row actions menu, and an item detail
view — delivered across five sequential PRs.

---

## PR1 — Row Actions Menu & Delete Confirmation

### Requirement: R1.1 Dropdown Row Actions

Each row MUST render a single "⋯" trigger opening a `DropdownMenu` with items,
in order: View detail, Adjust, Edit, a separator, Delete (styled destructive).
The three previously-inline buttons MUST be removed.

#### Scenario: Dropdown renders all actions

- GIVEN a rendered inventory row
- WHEN the "⋯" trigger is clicked
- THEN a menu opens containing "View detail", "Adjust", "Edit", and "Delete" items

#### Scenario: Delete item is visually destructive

- GIVEN the row actions menu is open
- WHEN the "Delete" item is inspected
- THEN it carries the destructive styling variant, distinct from the other items

### Requirement: R1.2 Delete Requires Confirmation

Clicking "Delete" MUST NOT call the delete mutation directly. It MUST open the
shared `ConfirmDialog` with the item's name in the description. The mutation
MUST only fire when the dialog is confirmed.

#### Scenario: Delete opens confirmation dialog

- GIVEN a rendered inventory row
- WHEN "Delete" is clicked from the row's dropdown
- THEN a `ConfirmDialog` opens and the delete mutation has NOT been called

#### Scenario: Confirming deletes the item

- GIVEN the confirmation dialog is open for an item
- WHEN the user confirms
- THEN the delete mutation is called with that item's id and the dialog closes

#### Scenario: Cancelling does not delete

- GIVEN the confirmation dialog is open for an item
- WHEN the user cancels or dismisses the dialog
- THEN the delete mutation is NOT called

---

## PR2 — Server-Side Pagination & Sorting

### Requirement: R2.1 Server-Side Pagination

The list MUST fetch pages from `InventoryItemFindByCriteria` using the real
`page`/`perPage` the user is on (via `useUrlPage`), replacing the hardcoded
`{ page: 1, perPage: 100 }`. The `DataTable`'s `pagination` prop MUST be wired
using the response's `total`/`page`/`perPage`.

#### Scenario: Fetching page 2

- GIVEN a space with 45 inventory items and `perPage=20`
- WHEN the user navigates to page 2
- THEN `usePaginatedInventoryItems` is called with `page=2` and the query variable reflects it

#### Scenario: No artificial item ceiling

- GIVEN a space with 150 inventory items
- WHEN the list is viewed across pages
- THEN all 150 items are reachable via pagination (not capped at 100)

### Requirement: R2.2 Server-Side Sorting

Name, Quantity, and Expires-at columns MUST use `SortableHeader` and drive
`DataTable`'s controlled `sorting` state, translated into
`InventoryItemSortInput[]` sent to the API.

#### Scenario: Sorting by name

- GIVEN the inventory table is rendered
- WHEN the user clicks the Name column header
- THEN the query is re-issued with a sort on `name` and the header shows the active sort direction

### Requirement: R2.3 Filter Change Resets to Page 1

Changing any filter MUST reset pagination to page 1, using the ref-based
pattern already proven in `plants-list.screen.tsx` (reading the page-change
callback via a ref, not as a `useEffect` dependency, to avoid bouncing the user
back to page 1 right after a page navigation).

#### Scenario: Changing the type filter resets the page

- GIVEN the user is on page 3 of the inventory list
- WHEN they change the type filter
- THEN the list re-fetches at page 1

---

## PR3 — Server-Side Filtering & Quick Filter Chips

### Requirement: R3.1 Debounced Server-Side Search

The free-text search input MUST debounce via `useDebouncedValue` (default
300ms) before it drives the `name` `LIKE` filter sent to the API.

#### Scenario: Typing does not fire a request per keystroke

- GIVEN the search input is empty
- WHEN the user types "seed" character by character within 300ms
- THEN only one query is issued, after the debounce delay, with `name LIKE "seed"`

### Requirement: R3.2 Type, Low-Stock, and Expiring-Soon Filters Sent Server-Side

Selecting a type, toggling "low stock only", or toggling "expiring soon" MUST
each translate into an `InventoryFilter` entry (`itemType` EQUALS, `low_stock`
EQUALS true, `expiresAt` LESS_THAN_OR_EQUAL respectively) sent to the API,
replacing the current in-memory filtering.

#### Scenario: Low-stock filter sent to API

- GIVEN the "low stock only" toggle is off
- WHEN the user enables it
- THEN the query is re-issued with a `low_stock=true` filter and the previously-fetched full item list is no longer relied upon client-side

### Requirement: R3.3 Active Filter Chips

Active filters (search term, type, low-stock, expiring-soon) MUST render as
removable chips via `ActiveFilterChips` above the table. Removing a chip MUST
clear that specific filter.

#### Scenario: Removing a chip clears only that filter

- GIVEN both a type filter and the low-stock toggle are active
- WHEN the user removes the type chip
- THEN the type filter clears, the low-stock filter remains active, and the query reflects only the low-stock filter

---

## PR4 — Item Detail Drawer

### Requirement: R4.1 Detail Drawer Shows Full Item Data

Clicking a row (or its dropdown's "View detail") MUST open a `Drawer` showing
all item fields not present in the table: brand, notes, acquired-at,
expires-at, created-at, updated-at, in addition to name/type/quantity/unit
already visible.

#### Scenario: Opening detail from a row

- GIVEN a rendered inventory row for an item with a brand and notes
- WHEN "View detail" is selected from its dropdown
- THEN a drawer opens showing that item's brand and notes

#### Scenario: Detail drawer for an item with no optional fields

- GIVEN an item with no brand, notes, acquiredAt, or expiresAt
- WHEN its detail drawer opens
- THEN those fields render an empty/placeholder state, not `undefined` or a crash

---

## PR5 — Bulk Selection & Bulk Delete

> Depends on the gardenia-api change `inventory-bulk-delete` (adds
> `inventoryItemsDeleteBulk`) being merged first.

### Requirement: R5.1 Row Selection

The table MUST support `enableRowSelection`. A selection toolbar MUST appear
when at least one row is selected, showing the selected count and a "Delete
selected" action.

#### Scenario: Selecting rows shows the toolbar

- GIVEN the inventory table is rendered with no selection
- WHEN the user selects 3 rows
- THEN a toolbar appears showing "3 selected" and a "Delete selected" button

#### Scenario: No selection, no toolbar

- GIVEN no rows are selected
- WHEN the table is rendered
- THEN the bulk actions toolbar is NOT in the document

### Requirement: R5.2 Bulk Delete Requires Confirmation

"Delete selected" MUST open the shared `ConfirmDialog` before calling
`inventoryItemsDeleteBulk`. On confirm, the mutation MUST be called once with
all selected ids.

#### Scenario: Bulk delete confirmation

- GIVEN 3 rows are selected
- WHEN "Delete selected" is clicked and confirmed
- THEN `inventoryItemsDeleteBulk` is called once with all 3 ids

### Requirement: R5.3 Partial Failure Reporting

If the bulk delete response's `notFoundIds` is non-empty, the UI MUST inform
the user that not all selected items were deleted, using `deletedCount`/
`requestedCount` from the response, and MUST still clear the selection and
refresh the list for whatever was actually deleted.

#### Scenario: Partial bulk delete success

- GIVEN 5 selected ids where one no longer exists (deleted concurrently by another space member)
- WHEN the bulk delete is confirmed
- THEN the response reports `deletedCount: 4`, the UI shows a "4 of 5 deleted" message, and the list reflects the 4 removals

---

## Out of Scope (this change)

- Bulk create/update/adjust.
- Column visibility/reorder controls.
- Cursor-based/infinite-scroll pagination.
- CSV/Excel export.
