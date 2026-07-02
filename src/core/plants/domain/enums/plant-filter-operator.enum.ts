/**
 * Mirrors the `FilterOperator` GraphQL enum (`@sisques-labs/nestjs-kit`)
 * values actually usable for plant filters today. Values match the GraphQL
 * wire representation (enum member names, e.g. `"LIKE"`), not the operator's
 * internal string ('like') used server-side.
 */
export enum PlantFilterOperator {
  EQUALS = 'EQUALS',
  LIKE = 'LIKE',
}
