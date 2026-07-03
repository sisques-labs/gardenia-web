/**
 * Mirrors gardenia-api's `InventoryItemQueryableFieldEnum` GraphQL enum.
 * Values match the GraphQL wire representation (the enum member names
 * registered via `registerEnumType`, e.g. `"NAME"`) — not the camelCase
 * entity field name used internally on the API side (`"name"`). Kept in sync
 * by hand (no GraphQL codegen in this repo); update both sides if the API
 * enum changes.
 *
 * Covers every scalar field on the API's `InventoryItemViewModel`, plus the
 * virtual `LOW_STOCK` filter. Only `NAME`, `ITEM_TYPE`, `QUANTITY`,
 * `LOW_STOCK` and `EXPIRES_AT` are wired to UI today (search, type filter,
 * quantity/name sort, low-stock and expiring-soon filters) — the rest exist
 * for parity and are ready to use once matching filter/sort UI exists.
 */
export enum InventoryItemQueryableField {
  ID = 'ID',
  ITEM_TYPE = 'ITEM_TYPE',
  NAME = 'NAME',
  BRAND = 'BRAND',
  NOTES = 'NOTES',
  QUANTITY = 'QUANTITY',
  UNIT = 'UNIT',
  LOW_STOCK_THRESHOLD = 'LOW_STOCK_THRESHOLD',
  ACQUIRED_AT = 'ACQUIRED_AT',
  EXPIRES_AT = 'EXPIRES_AT',
  USER_ID = 'USER_ID',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  LOW_STOCK = 'LOW_STOCK',
}
