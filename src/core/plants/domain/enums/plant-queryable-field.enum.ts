/**
 * Mirrors gardenia-api's `PlantQueryableFieldEnum` GraphQL enum. Values match
 * the GraphQL wire representation (the enum member names registered via
 * `registerEnumType`, e.g. `"NAME"`) — not the camelCase entity field name
 * used internally on the API side (`"name"`). Kept in sync by hand (no
 * GraphQL codegen in this repo); update both sides if the API enum changes.
 *
 * Covers every scalar/FK field on the API's `PlantViewModel` (mirrors
 * `PlantQueryableField` in gardenia-api). Only `NAME` is wired to UI today
 * (the plants list search box) — the rest exist for parity and are ready to
 * use once matching filter UI exists (e.g. a species/planting-spot picker).
 */
export enum PlantQueryableField {
  ID = 'ID',
  NAME = 'NAME',
  PLANT_SPECIES_ID = 'PLANT_SPECIES_ID',
  IMAGE_URL = 'IMAGE_URL',
  USER_ID = 'USER_ID',
  QR_ID = 'QR_ID',
  PLANTING_SPOT_ID = 'PLANTING_SPOT_ID',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}
