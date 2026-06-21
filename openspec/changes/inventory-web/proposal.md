# Proposal: inventory-web

## Intent

### Problem
`gardenia-api` ya tiene un bounded context `inventory` completo (mergeado en PR #262) que permite gestionar el **stock de suministros consumibles** de un espacio: semillas, fertilizantes, sustratos, fitosanitarios y otros. Expone operaciones GraphQL para crear, actualizar, borrar, ajustar cantidad (consumir/reponer) y listar artículos. Sin embargo, `gardenia-web` **no expone nada de esto**: el usuario no puede saber qué semillas le quedan, si están a punto de caducar, ni cuánto fertilizante tiene antes de que importe.

### Why now
El contexto `inventory` de la API está completo y disponible vía GraphQL. La web ya tiene establecida toda la infraestructura necesaria (Apollo Client con headers JWT + `X-Space-ID`, patrón DDD + Hexagonal por módulo, i18n es/en, sidebar de navegación) y un módulo de referencia directo y muy similar: `harvests` (CRUD tenant-scoped vía GraphQL). Portar `inventory` es replicar ese patrón.

### Success looks like
- Una nueva sección **Inventario** en el sidebar (`/[lang]/inventory`) lista los artículos del espacio activo.
- El usuario puede **crear, editar y borrar** artículos, y **ajustar la cantidad** (consumir/reponer con un motivo) sin pasar por la edición normal.
- El usuario puede **filtrar** la lista por tipo, buscar por nombre, ver solo los de **bajo stock** y los que **caducan pronto**.
- Cada fila muestra tipo, nombre, marca, cantidad + unidad, y avisos visuales de bajo stock / caducidad.
- El módulo sigue exactamente el patrón del módulo `harvests`: dominio → aplicación → infraestructura → presentación, con tests en TDD estricto y paridad i18n es/en.

---

## Scope (v1 — este cambio)

### In scope
- **Dominio**: tipos `InventoryItem`, `InventoryItemType` (SEEDS, FERTILIZER, SUBSTRATE, PHYTOSANITARY, OTHER) y `InventoryUnit` (UNITS, G, KG, ML, L, PACKETS).
- **Aplicación**: use-cases `GetInventoryItems`, `GetInventoryItem`, `CreateInventoryItem`, `UpdateInventoryItem`, `AdjustInventoryItemQuantity`, `DeleteInventoryItem`; interfaces de input; puerto `IInventoryRepository`.
- **Infraestructura**: `InventoryGqlRepository` con las queries/mutations GraphQL (`inventoryItemsFindByCriteria`, `inventoryItemFindById`, `inventoryItemCreate`, `inventoryItemUpdate`, `inventoryItemAdjustQuantity`, `inventoryItemDelete`).
- **Presentación**:
  - Pantalla `inventory-list` con cabecera, lista, estado de carga (skeleton) y estado vacío.
  - Filtros (tipo, búsqueda por nombre, bajo stock, caduca pronto) — aplicados **en cliente**.
  - Modal de crear/editar artículo (sin cantidad en edición — la cantidad solo cambia vía ajuste).
  - Modal de ajustar cantidad (delta + motivo).
  - Fila de artículo con avisos de bajo stock / caducidad.
  - Hooks TanStack Query (listar, crear, editar, borrar, ajustar) + hooks de formulario.
  - i18n `es.ts` + `en.ts` + parity test.
  - Entrada de navegación en el sidebar.

### Out of scope (cambios posteriores)
- Paginación / scroll infinito server-side (v1 trae una página amplia y filtra en cliente).
- Filtros server-side por criteria (operadores genéricos de la API).
- Integraciones con care-log / sowing (decremento automático de stock).
- Notificaciones de bajo stock / caducidad y panel de "atención" del dashboard.
- Vista de detalle dedicada por artículo (se gestiona todo desde la lista + modales).

---

## Approach

### Option A — Nuevo bounded context `inventory` con DDD completo (seleccionado)

Crea `src/core/inventory/` con las cuatro capas, replicando exactamente el módulo `harvests`:

1. `domain/types/inventory-item.interface.ts` — tipos puros + constantes de enums.
2. `application/ports/inventory.repository.port.ts` + `application/interfaces/*` + `application/use-cases/*`.
3. `infrastructure/repositories/graphql/` — `InventoryGqlRepository` (queries + mutations + responses).
4. `presentation/` — schema Zod, hooks, componentes (fila, modal, modal de ajuste, filtros), pantalla, i18n.

Se añade la ruta `app/[lang]/(protected)/inventory/page.tsx` y la entrada en el sidebar.

**Rationale**: mantiene el bounded context aislado igual que en la API, maximiza la reutilización del patrón ya probado en `harvests`, y deja espacio para crecer (paginación, integraciones) sin tocar otros módulos.

### Rejected alternatives
- **Meter el inventario dentro de `plants`**: mezcla responsabilidades; en la API son contextos separados. Rechazado.
- **Filtrado server-side vía criteria genérica**: la API expone `InventoryItemCriteriaInput` (filters/sorts/pagination genéricos de `nestjs-kit`) cuyos operadores exactos (LIKE, LTE, el filtro especial `low_stock`) no están verificados desde el cliente. Para v1 se traen los artículos y se filtra en cliente (listas pequeñas). Rechazado para v1, candidato a iteración.

---

## Delivery

Un módulo nuevo entregado en la rama de feature. La capa de datos (dominio + aplicación + infraestructura + i18n) y la de presentación (hooks + componentes + pantalla + ruta + sidebar) se construyen en fases secuenciales (ver `tasks.md`). El volumen supera la guía de 400 líneas por PR; si se abriera PR, se dividiría en: (1) datos + i18n, (2) presentación + navegación.

---

## Risks

1. **Forma de paginación de la API**: `inventoryItemsFindByCriteria` acepta `pagination: { page, perPage }`. Se pide una página amplia (`perPage: 100`). Si un espacio supera ese tamaño, faltarían artículos hasta implementar paginación real (out of scope v1).
2. **Escalar de fechas (Date)**: `acquiredAt` / `expiresAt` son `Date` en la API. Se envían como string de fecha del input `type="date"` y se reciben como ISO string. Verificado contra el patrón de `harvests.harvestedAt`.
3. **Colisión de nombre en el sidebar**: la entrada actual `inventory` (label "Inventario") apunta a `/plants`. Se renombra esa entrada a `plants` (label "Plantas") y se reutiliza `inventory` para el módulo real → `/inventory`. Afecta a `shell` i18n, `NAV_ITEMS` y al test del sidebar.

---

## Affected Areas

- `src/core/inventory/` — nuevo bounded context (todas las capas).
- `app/[lang]/(protected)/inventory/page.tsx` — nueva ruta.
- `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` — renombrar `inventory`→`plants`, añadir `inventory`→`/inventory`.
- `src/shared/presentation/i18n/shell/en.ts` + `es.ts` — renombrar clave `nav.inventory`→`nav.plants`, añadir `nav.inventory`.
- `src/shared/presentation/components/sidebar/sidebar.test.tsx` — ajustar al nuevo set de labels.
- `src/shared/presentation/i18n/get-dictionary.ts` — registrar `InventoryDict` en `AppDict`.
