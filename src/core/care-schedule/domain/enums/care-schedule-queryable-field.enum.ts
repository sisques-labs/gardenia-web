/**
 * Mirrors gardenia-api's `CareScheduleQueryableFieldEnum` GraphQL enum.
 * Values match the GraphQL wire representation (the enum member names
 * registered via `registerEnumType`, e.g. `"PLANT_ID"`) — not the camelCase
 * entity field name used internally on the API side (`"plantId"`). Kept in
 * sync by hand (no GraphQL codegen in this repo); update both sides if the
 * API enum changes.
 *
 * `DUE_BEFORE` is a virtual filter (not a real column) the API's read
 * repository maps to `nextDueAt <= value`. `spaceId` is deliberately absent
 * on the API side (every query is already scoped to the active space), so
 * it has no entry here either.
 */
export enum CareScheduleQueryableField {
  ID = 'ID',
  PLANT_ID = 'PLANT_ID',
  ACTIVITY_TYPE = 'ACTIVITY_TYPE',
  INTERVAL_DAYS = 'INTERVAL_DAYS',
  QUANTITY = 'QUANTITY',
  UNIT = 'UNIT',
  NOTES = 'NOTES',
  NEXT_DUE_AT = 'NEXT_DUE_AT',
  LAST_COMPLETED_AT = 'LAST_COMPLETED_AT',
  ACTIVE = 'ACTIVE',
  USER_ID = 'USER_ID',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  DUE_BEFORE = 'DUE_BEFORE',
}
