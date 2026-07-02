/**
 * Mirrors gardenia-api's `PlantQueryableFieldEnum` GraphQL enum. Values match
 * the GraphQL wire representation (the enum member names registered via
 * `registerEnumType`, e.g. `"NAME"`) — not the camelCase entity field name
 * used internally on the API side (`"name"`). Kept in sync by hand (no
 * GraphQL codegen in this repo); update both sides if the API enum changes.
 */
export enum PlantQueryableField {
  NAME = 'NAME',
  PLANT_SPECIES_ID = 'PLANT_SPECIES_ID',
  PLANTING_SPOT_ID = 'PLANTING_SPOT_ID',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}
