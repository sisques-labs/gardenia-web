# Tasks: inventory-web

## Review Workload Forecast

| Campo | Valor |
|-------|-------|
| Líneas estimadas | ~900–1000 líneas (incl. tests) |
| Riesgo presupuesto 400 líneas | Alto (módulo completo) |
| PRs encadenados | Si se abre PR: 2 (datos+i18n / presentación+nav) |
| Estrategia de entrega | Rama de feature, módulo completo |

Decision needed before apply: No

---

## Phase 1: Domain

- [ ] 1.1 Crear `src/core/inventory/domain/types/inventory-item.interface.ts` — `INVENTORY_ITEM_TYPES`, `InventoryItemType`, `INVENTORY_UNITS`, `InventoryUnit`, interface `InventoryItem`. Satisface: diseño §2.

## Phase 2: Application

- [ ] 2.1 Crear las 3 interfaces de input en `application/interfaces/` (create, update sin quantity, adjust). Satisface: diseño §3.
- [ ] 2.2 Crear `application/ports/inventory.repository.port.ts` — `IInventoryRepository` (findByCriteria, findById, create, update, adjustQuantity, delete). Satisface: diseño §3.
- [ ] 2.3 RED: specs de los 6 use-cases (`get-inventory-items`, `get-inventory-item`, `create`, `update`, `adjust-quantity`, `delete`) — mock del puerto, assert delegación. Satisface: TDD.
- [ ] 2.4 GREEN: implementar los 6 use-cases. Satisface: diseño §3.

## Phase 3: Infrastructure (GraphQL)

- [ ] 3.1 Crear queries: `inventory-items-find-by-criteria.query.ts`, `inventory-item-find-by-id.query.ts`. Satisface: diseño §4.
- [ ] 3.2 Crear mutations: create, update, adjust-quantity, delete (`inventoryItemDelete(id: String!)`). Satisface: diseño §4.
- [ ] 3.3 Crear response types en `responses/`. Satisface: diseño §4.
- [ ] 3.4 RED: `inventory.gql.repository.spec.ts` — documentos GQL válidos, variables correctas (delete con `{ id }`), re-fetch tras mutación, errores. Satisface: TDD.
- [ ] 3.5 GREEN: `inventory.gql.repository.ts` — `InventoryGqlRepository implements IInventoryRepository` + singleton. Satisface: diseño §4.

## Phase 4: i18n + Dict Registration

- [ ] 4.1 Crear `inventory/presentation/i18n/en.ts` (`InventoryDict`) y `es.ts` (`satisfies WidenStringLiterals<InventoryDict>`, castellano/tuteo). Satisface: diseño §8.
- [ ] 4.2 RED+GREEN: `i18n/i18n-parity.test.ts`. Satisface: convención i18n.
- [ ] 4.3 Actualizar `src/shared/presentation/i18n/get-dictionary.ts` — registrar `inventory` en `AppDict` y en `dictionaries.en/es`. Satisface: diseño §8.

## Phase 5: Presentation — Schemas & Hooks

- [ ] 5.1 Crear `schemas/inventory-item.schema.ts` (+ `editInventoryItemSchema`) y `schemas/adjust-quantity.schema.ts`. Satisface: diseño §5.
- [ ] 5.2 RED+GREEN: `hooks/use-inventory-items/` (+spec). Satisface: TDD + diseño §6.
- [ ] 5.3 GREEN: hooks de mutación `use-create-inventory-item`, `use-update-inventory-item`, `use-delete-inventory-item`, `use-adjust-inventory-item-quantity` (invalidate `['inventory']`). Satisface: diseño §6.
- [ ] 5.4 GREEN: `hooks/use-inventory-item-form/` y `hooks/use-adjust-quantity-form/` (RHF + zodResolver). Satisface: diseño §6.
- [ ] 5.5 RED+GREEN: `hooks/use-inventory-filters/` (+spec) — filtrado en cliente por tipo, nombre, bajo stock, caducidad. Satisface: TDD + diseño §6.

## Phase 6: Presentation — Components & Screen

- [ ] 6.1 RED+GREEN: `components/inventory-item-row/` (+test) — campos, badges de bajo stock/caducidad, callbacks edit/adjust/delete. Satisface: TDD + diseño §7.
- [ ] 6.2 GREEN: `components/inventory-item-modal/` — crear/editar (sin quantity en edición). Satisface: diseño §7.
- [ ] 6.3 GREEN: `components/adjust-quantity-modal/` — delta + reason. Satisface: diseño §7.
- [ ] 6.4 RED+GREEN: `components/inventory-filters/` (+test) — búsqueda, select de tipo, toggles. Satisface: TDD + diseño §7.
- [ ] 6.5 GREEN: `screens/inventory-list/inventory-list.screen.tsx` — cabecera, filtros, skeleton, vacío, lista, modales. Satisface: diseño §7.

## Phase 7: Navigation & Route

- [ ] 7.1 Actualizar `shell/en.ts` + `es.ts` — renombrar `nav.inventory`→`nav.plants`, añadir `nav.inventory`. Satisface: diseño §9.
- [ ] 7.2 Actualizar `sidebar-nav-items/nav-items.ts` — `plants`→/plants (Leaf), nuevo `inventory`→/inventory (Boxes). Satisface: diseño §9.
- [ ] 7.3 Actualizar `sidebar/sidebar.test.tsx` — nuevo set de labels (Plants + Inventory). Satisface: tests.
- [ ] 7.4 Crear `app/[lang]/(protected)/inventory/page.tsx` — Server Component que renderiza `InventoryListScreen`. Satisface: diseño §9.

## Phase 8: Verify

- [ ] 8.1 `pnpm test` (módulo inventory + sidebar) en verde.
- [ ] 8.2 `pnpm tsc --noEmit` sin errores.
- [ ] 8.3 `pnpm lint` sin errores nuevos.
