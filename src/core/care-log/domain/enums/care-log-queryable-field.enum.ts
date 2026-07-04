/**
 * Mirrors gardenia-api's `CareLogQueryableFieldEnum` GraphQL enum. Values
 * match the GraphQL wire representation (the enum member names registered
 * via `registerEnumType`, e.g. `"PLANT_ID"`) — not the camelCase entity
 * field name used internally on the API side (`"plantId"`). Kept in sync by
 * hand (no GraphQL codegen in this repo); update both sides if the API enum
 * changes.
 */
export enum CareLogQueryableField {
  ID = 'ID',
  PLANT_ID = 'PLANT_ID',
  USER_ID = 'USER_ID',
  ACTIVITY_TYPE = 'ACTIVITY_TYPE',
  PERFORMED_AT = 'PERFORMED_AT',
  NOTES = 'NOTES',
  QUANTITY = 'QUANTITY',
  UNIT = 'UNIT',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}
