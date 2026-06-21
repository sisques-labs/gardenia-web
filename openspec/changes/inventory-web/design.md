# Technical Design: inventory-web

## 0. Context & Constraints

- Stack: Next.js 16 (App Router), TypeScript strict, React 19, Apollo Client v4, TanStack Query v5, React Hook Form + Zod, Vitest + Testing Library.
- Arquitectura: DDD + Hexagonal bajo `src/core/{context}/{layer}/`.
- Strict TDD: **true** — tests RED antes que la implementación.
- Referencia directa: `src/core/harvests/` — patrón a replicar exactamente (CRUD tenant-scoped vía GraphQL).
- `X-Space-ID` lo inyecta Apollo automáticamente; el repositorio no recibe `spaceId`.

### ADR-001 — `inventory` es un bounded context propio
Igual que en la API. `src/core/inventory/` es independiente de `plants` y `harvests`. Se replica la estructura de `harvests`.

### ADR-002 — Filtrado en cliente para v1
`inventoryItemsFindByCriteria` acepta una criteria genérica (`filters`/`sorts`/`pagination`) cuyos operadores exactos no están verificados desde el cliente (LIKE para nombre, LTE para fechas, el filtro especial `low_stock` cross-column). Para v1 se piden los artículos del espacio (`pagination: { page: 1, perPage: 100 }`) y se filtra/busca **en cliente**: por `itemType`, por substring de `name`, por bajo stock (`quantity <= lowStockThreshold`) y por caducidad (`expiresAt <= hoy + N días`). Las listas de inventario son pequeñas; esto evita acoplarse a la semántica genérica del servidor.

### ADR-003 — La cantidad solo cambia vía ajuste
La API NO permite cambiar `quantity` en `inventoryItemUpdate`; el stock se modifica con `inventoryItemAdjustQuantity(delta, reason)` (clamp a 0). La web refleja esto: el modal de crear pide `quantity`; el modal de editar **no** la incluye; existe un modal separado de "ajustar cantidad" (consumir/reponer con motivo).

### ADR-004 — Las mutaciones re-consultan por id
Como en `harvests`: create/update devuelven `MutationResponseDto { id, success, message }`; el repositorio re-consulta `inventoryItemFindById` para devolver el `InventoryItem` completo. `adjustQuantity` hace lo mismo. `delete` resuelve void.

### ADR-005 — Fechas como ISO string en el dominio
`acquiredAt`/`expiresAt`/`createdAt`/`updatedAt` se modelan como `string | null` (ISO) para evitar problemas de hidratación servidor/cliente, igual que `harvests.harvestedAt`.

### ADR-006 — Reutilizar la clave `inventory` del sidebar
La entrada actual `nav.inventory` ("Inventario") apunta a `/plants`. Se renombra a `nav.plants` ("Plantas"/"Plants", icono `Leaf`, href `/plants`) y se crea `nav.inventory` ("Inventario"/"Inventory", icono `Boxes`, href `/inventory`) para el módulo real.

---

## 1. Module Structure

```
src/core/inventory/
  domain/
    types/
      inventory-item.interface.ts        # InventoryItem, InventoryItemType, InventoryUnit, INVENTORY_ITEM_TYPES, INVENTORY_UNITS
  application/
    ports/
      inventory.repository.port.ts        # IInventoryRepository
    interfaces/
      create-inventory-item-input.interface.ts
      update-inventory-item-input.interface.ts
      adjust-inventory-item-quantity-input.interface.ts
    use-cases/
      get-inventory-items/                # GetInventoryItemsUseCase (+spec)
      get-inventory-item/                 # GetInventoryItemUseCase (+spec)
      create-inventory-item/              # CreateInventoryItemUseCase (+spec)
      update-inventory-item/              # UpdateInventoryItemUseCase (+spec)
      adjust-inventory-item-quantity/     # AdjustInventoryItemQuantityUseCase (+spec)
      delete-inventory-item/              # DeleteInventoryItemUseCase (+spec)
  infrastructure/
    repositories/
      graphql/
        queries/
          inventory-items-find-by-criteria.query.ts
          inventory-item-find-by-id.query.ts
        mutations/
          inventory-item-create.mutation.ts
          inventory-item-update.mutation.ts
          inventory-item-adjust-quantity.mutation.ts
          inventory-item-delete.mutation.ts
        responses/
          inventory-items-find-by-criteria.response.ts
          inventory-item-find-by-id.response.ts
          inventory-item-mutation.response.ts        # { id, success, message }
          inventory-item-delete.response.ts           # { success, message }
        inventory.gql.repository.ts
        inventory.gql.repository.spec.ts
  presentation/
    schemas/
      inventory-item.schema.ts            # Zod create/edit schema
      adjust-quantity.schema.ts           # Zod adjust schema
    hooks/
      use-inventory-items/                # list (+spec)
      use-create-inventory-item/
      use-update-inventory-item/
      use-delete-inventory-item/
      use-adjust-inventory-item-quantity/
      use-inventory-item-form/            # RHF create/edit
      use-adjust-quantity-form/           # RHF adjust
      use-inventory-filters/              # client-side filtering (+spec)
    components/
      inventory-item-row/                 # (+test)
      inventory-item-modal/               # create/edit (+test optional)
      adjust-quantity-modal/              # adjust (+test optional)
      inventory-filters/                  # filter bar (+test)
    screens/
      inventory-list/                     # InventoryListScreen
    i18n/
      en.ts
      es.ts
      i18n-parity.test.ts
```

Touch-points:
```
app/[lang]/(protected)/inventory/page.tsx                       # nueva ruta
src/shared/presentation/components/sidebar-nav-items/nav-items.ts
src/shared/presentation/i18n/shell/en.ts + es.ts
src/shared/presentation/components/sidebar/sidebar.test.tsx
src/shared/presentation/i18n/get-dictionary.ts
```

---

## 2. Domain Layer

`domain/types/inventory-item.interface.ts`:
```ts
export const INVENTORY_ITEM_TYPES = ['SEEDS', 'FERTILIZER', 'SUBSTRATE', 'PHYTOSANITARY', 'OTHER'] as const;
export type InventoryItemType = (typeof INVENTORY_ITEM_TYPES)[number];

export const INVENTORY_UNITS = ['UNITS', 'G', 'KG', 'ML', 'L', 'PACKETS'] as const;
export type InventoryUnit = (typeof INVENTORY_UNITS)[number];

export interface InventoryItem {
  id: string;
  itemType: InventoryItemType;
  name: string;
  brand: string | null;
  notes: string | null;
  quantity: number;
  unit: InventoryUnit;
  lowStockThreshold: number | null;
  acquiredAt: string | null;
  expiresAt: string | null;
  userId: string;
  spaceId: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 3. Application Layer

### Inputs
```ts
// create-inventory-item-input.interface.ts
export interface CreateInventoryItemInput {
  itemType: InventoryItemType;
  name: string;
  brand?: string;
  notes?: string;
  quantity: number;
  unit: InventoryUnit;
  lowStockThreshold?: number;
  acquiredAt?: string;
  expiresAt?: string;
}

// update-inventory-item-input.interface.ts  (sin quantity)
export interface UpdateInventoryItemInput {
  id: string;
  itemType?: InventoryItemType;
  name?: string;
  brand?: string | null;
  notes?: string | null;
  unit?: InventoryUnit;
  lowStockThreshold?: number | null;
  acquiredAt?: string | null;
  expiresAt?: string | null;
}

// adjust-inventory-item-quantity-input.interface.ts
export interface AdjustInventoryItemQuantityInput {
  id: string;
  delta: number;
  reason: string;
}
```

### Port
```ts
export interface IInventoryRepository {
  findByCriteria(): Promise<InventoryItem[]>;
  findById(id: string): Promise<InventoryItem>;
  create(input: CreateInventoryItemInput): Promise<InventoryItem>;
  update(input: UpdateInventoryItemInput): Promise<InventoryItem>;
  adjustQuantity(input: AdjustInventoryItemQuantityInput): Promise<InventoryItem>;
  delete(id: string): Promise<void>;
}
```

### Use-cases
Cada use-case delega en el repo (mismo patrón que `harvests`). `GetInventoryItemsUseCase.execute()` → `findByCriteria()`; el resto delega 1:1. Sin validación de dominio (la hace Zod en presentación y la API en el backend).

---

## 4. Infrastructure Layer — GraphQL

Contrato verificado contra los resolvers de la API:

```graphql
query InventoryItemsFindByCriteria($input: InventoryItemCriteriaInput) {
  inventoryItemsFindByCriteria(input: $input) { items { ...InventoryItemFields } }
}
query InventoryItemFindById($input: InventoryItemFindByIdInput!) {
  inventoryItemFindById(input: $input) { ...InventoryItemFields }
}
mutation InventoryItemCreate($input: CreateInventoryItemInput!) {
  inventoryItemCreate(input: $input) { id success message }
}
mutation InventoryItemUpdate($input: UpdateInventoryItemInput!) {
  inventoryItemUpdate(input: $input) { id success message }
}
mutation InventoryItemAdjustQuantity($input: AdjustInventoryItemQuantityInput!) {
  inventoryItemAdjustQuantity(input: $input) { id success message }
}
mutation InventoryItemDelete($id: String!) {
  inventoryItemDelete(id: $id) { id success message }
}
```

`InventoryItemFields` = `id itemType name brand notes quantity unit lowStockThreshold acquiredAt expiresAt userId spaceId createdAt updatedAt`.

`InventoryGqlRepository implements IInventoryRepository`:
- `findByCriteria()` → `query(INVENTORY_ITEMS_FIND_BY_CRITERIA, { variables: { input: { pagination: { page: 1, perPage: 100 } } }, fetchPolicy: 'network-only' })`; devuelve `items ?? []`.
- `findById(id)` → `query(..., { variables: { input: { id } }, fetchPolicy: 'network-only' })`; lanza `Inventory item not found: <id>` si null.
- `create/update/adjustQuantity` → `mutate(...)`; si `!success` lanza error; si éxito → `findById(res.id)`.
- `delete(id)` → `mutate(INVENTORY_ITEM_DELETE, { variables: { id } })` (argumento `id`, no `input`).
- Export singleton `inventoryGqlRepository`.

Spec: `vi.mock` `apolloClient`; valida documentos GQL válidos, variables correctas (incluido `delete` con `{ id }`), mapeo de respuesta y errores. Mismo estilo que `harvests.gql.repository.spec.ts`.

---

## 5. Presentation — Schemas

```ts
// inventory-item.schema.ts
export const inventoryItemSchema = z.object({
  itemType: z.enum(INVENTORY_ITEM_TYPES),
  name: z.string().min(1).max(200),
  brand: z.string().max(200).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  quantity: z.coerce.number().min(0),
  unit: z.enum(INVENTORY_UNITS),
  lowStockThreshold: z.coerce.number().min(0).optional(),
  acquiredAt: z.string().optional().or(z.literal('')),
  expiresAt: z.string().optional().or(z.literal('')),
});
// adjust-quantity.schema.ts
export const adjustQuantitySchema = z.object({
  delta: z.coerce.number().refine((n) => n !== 0),
  reason: z.string().min(1).max(500),
});
```
En edición se reutiliza el mismo schema sin `quantity` (un `editInventoryItemSchema` derivado con `.omit({ quantity: true })`).

---

## 6. Presentation — Hooks

- `useInventoryItems()` → `useQuery(['inventory'], () => getInventoryItemsUseCase.execute())`; devuelve `{ items, isLoading, error }`.
- `useCreateInventoryItem` / `useUpdateInventoryItem` / `useDeleteInventoryItem` / `useAdjustInventoryItemQuantity` → `useMutation` + `invalidateQueries(['inventory'])` en `onSuccess` (mismo patrón que harvests).
- `useInventoryItemForm({ item, onClose })` — RHF + zodResolver; `defaultValues` desde `item` o defaults (`unit: 'UNITS'`, `itemType: 'SEEDS'`); en submit crea o actualiza y cierra.
- `useAdjustQuantityForm({ item, onClose })` — RHF para `{ delta, reason }`.
- `useInventoryFilters(items)` — estado local de filtros (`type`, `query`, `lowStockOnly`, `expiringSoon`) y derivación memoizada de la lista filtrada. Lógica pura testeable: `lowStock = lowStockThreshold != null && quantity <= lowStockThreshold`; `expiringSoon = expiresAt != null && expiresAt <= hoy + 30 días`.

---

## 7. Presentation — Components & Screen

- `InventoryItemRow` — muestra nombre, marca, tipo (label i18n), cantidad + unidad, y badges de bajo stock / caduca pronto. Acciones: editar, ajustar, borrar (callbacks).
- `InventoryItemModal` — Dialog con form de crear/editar (oculta `quantity` en edición). Campos: tipo (Select), nombre, marca, notas, cantidad (solo crear), unidad (Select), umbral de bajo stock, fecha de adquisición, fecha de caducidad.
- `AdjustQuantityModal` — Dialog con `delta` (número con signo) y `reason`; muestra la cantidad actual.
- `InventoryFilters` — barra con búsqueda por nombre, Select de tipo, toggles de bajo stock y caduca pronto.
- `InventoryListScreen` — `PageHeader` + botón "Nuevo artículo"; `InventoryFilters`; skeleton durante carga; estado vacío; lista de `InventoryItemRow`; gestiona estado de modales (crear, editar, ajustar). Mismo esqueleto que `HarvestsListScreen`.

---

## 8. i18n

`inventory/presentation/i18n/en.ts` (y espejo `es.ts` con `satisfies WidenStringLiterals<InventoryDict>`), claves anidadas:
```ts
{
  list: { title, empty, newItem, lowStockBadge, expiringBadge },
  filters: { searchPlaceholder, allTypes, lowStockOnly, expiringSoon },
  form: { title, editTitle, submitting, submit, cancel, itemType, name, brand, notes, quantity, unit, lowStockThreshold, acquiredAt, expiresAt },
  adjust: { title, delta, reason, submit, submitting, cancel, currentQuantity },
  row: { edit, adjust, delete },
  types: { SEEDS, FERTILIZER, SUBSTRATE, PHYTOSANITARY, OTHER },
  units: { UNITS, G, KG, ML, L, PACKETS },
  errors: { loadFailed, createFailed, updateFailed, deleteFailed, adjustFailed },
}
```
Registrar `InventoryDict` en `get-dictionary.ts` (`AppDict.inventory`, `dictionaries.en/es.inventory`). Parity test idéntico al de `harvests`.

`shell/en.ts` + `es.ts`: renombrar `nav.inventory`→`nav.plants` (label "Plants"/"Plantas") y añadir `nav.inventory` (label "Inventory"/"Inventario").

---

## 9. Navigation & Route

`nav-items.ts`:
```ts
{ key: 'plants', href: '/[lang]/plants', icon: Leaf },        // antes 'inventory'→/plants
{ key: 'inventory', href: '/[lang]/inventory', icon: Boxes }, // nuevo módulo real
```
Orden: dejar `plants` donde estaba la antigua `inventory`; colocar la nueva `inventory` junto a `harvests` (suministros van con cosechas, ambos de gestión del huerto).

`app/[lang]/(protected)/inventory/page.tsx` — Server Component: resuelve locale, `getDictionary`, renderiza `<InventoryListScreen dict={dict.inventory} lang={locale} />` (mismo patrón que `harvests/page.tsx`).

---

## 10. Data Flow

```
page.tsx (Server)  →  InventoryListScreen ('use client')
  useInventoryItems()  →  GetInventoryItemsUseCase  →  InventoryGqlRepository.findByCriteria()
    →  apolloClient.query(INVENTORY_ITEMS_FIND_BY_CRITERIA)  (X-Space-ID inyectado)
    →  inventoryItemsFindByCriteria  →  items[]
  useInventoryFilters(items)  →  lista filtrada en cliente
  acciones  →  useCreate/Update/Delete/Adjust  →  use-case  →  repo  →  mutation  →  invalidate(['inventory'])
```

---

## 11. Test Strategy

| Capa | Archivo | Enfoque |
|------|---------|---------|
| Use-cases | `*.use-case.spec.ts` | Mock `IInventoryRepository`; assert delegación 1:1. |
| Repository | `inventory.gql.repository.spec.ts` | `vi.mock` `apolloClient`; documentos GQL válidos, variables (delete con `{ id }`), re-fetch tras mutación, errores. |
| Hook lista | `use-inventory-items.hook.spec.ts` | `renderHook` + `QueryClientProvider`; éxito, loading, vacío, error. |
| Filtros | `use-inventory-filters.hook.spec.ts` | Lógica pura: filtra por tipo, nombre, bajo stock, caducidad. |
| Componentes | `inventory-item-row.test.tsx`, `inventory-filters.test.tsx` | `render`; muestra campos, badges, dispara callbacks. |
| i18n parity | `i18n-parity.test.ts` | Diferencia simétrica de claves vacía. |

---

## 12. Open Questions
1. **`perPage` de la primera página**: se fija en 100. Suficiente para v1; paginación real queda fuera de alcance.
2. **Umbral "caduca pronto"**: se fija en 30 días en cliente. Configurable en una iteración futura.
