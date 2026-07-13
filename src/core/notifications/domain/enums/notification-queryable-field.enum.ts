/**
 * Mirrors gardenia-api's `NotificationQueryableFieldEnum` GraphQL enum.
 * Values match the GraphQL wire representation (the enum member names
 * registered via `registerEnumType`, e.g. `"STATUS"`) — not the camelCase
 * entity field name used internally on the API side. Kept in sync by hand
 * (no GraphQL codegen in this repo); update both sides if the API enum
 * changes.
 *
 * `userId` and `spaceId` are deliberately absent on the API side (every
 * query is already scoped to the current user + active space), so they have
 * no entry here either.
 */
export enum NotificationQueryableField {
  ID = 'ID',
  TYPE = 'TYPE',
  REFERENCE_TYPE = 'REFERENCE_TYPE',
  REFERENCE_ID = 'REFERENCE_ID',
  STATUS = 'STATUS',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}
