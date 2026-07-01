# Technical Design: care-schedule-web

## 0. Context & Constraints

- Stack: Next.js 16 (App Router), TypeScript strict, React 19, Apollo Client v4, TanStack Query v5, React Hook Form + Zod, Vitest + Testing Library.
- Arquitectura: DDD + Hexagonal bajo `src/core/{context}/{layer}/`.
- Strict TDD: **true** — RED antes que GREEN en todos los archivos nuevos.
- Referencia principal: `src/core/harvests/` — CRUD completo (create/update/delete + form + modal + row), patrón a seguir exactamente.
- Referencia secundaria: `src/core/care-log/` — cómo un contexto ajeno (`care-schedule`) se integra en `plant-detail.screen.tsx` sin acoplar capas.
- API: `gardenia-api` `src/contexts/care-schedule/` (ver su `README.md`). GraphQL ya expone todo lo necesario, sin cambios en la API.

### ADR-001 — `care-schedule` es un módulo propio en `src/core/`, no una extensión de `calendar` ni `plants`

En la API, `care-schedule` es un bounded context standalone que solo referencia `plantId` en bruto. La web replica esa separación: `src/core/care-schedule/` no importa de `src/core/plants/` ni `src/core/calendar/` salvo en la capa de presentación (los screens de esos módulos importan componentes de `care-schedule`, nunca al revés).

### ADR-002 — Un solo hook de lectura parametrizable: `useCareSchedules(filters)`

A diferencia de `harvests` (`useHarvests()` sin filtros) o `care-log` (`usePlantCareLogs(plantId)` fijo a un plantId), este módulo necesita dos formas de consulta:
- Por planta (tab del detalle de planta): `{ plantId }`.
- Por vencimiento en el espacio (panel del día): `{ active: true, dueBefore: selectedDate }`.

En vez de dos hooks, `useCareSchedules(filters: CareScheduleFilters)` acepta `{ plantId?, activityType?, active?, dueBefore? }` y los traduce a filtros de `Criteria` dentro del repositorio GQL. La query key incluye `spaceId` (vía `useSpacesStore`) + los filtros serializados, igual que el resto de módulos con TanStack Query.

### ADR-003 — Traducción camelCase → snake_case confinada al repositorio GQL

La API espera nombres de columna en los filtros (`plant_id`, `activity_type`, `active`, `due_before` — este último un filtro virtual mapeado a `next_due_at <=` en el backend, no un campo real). Esta traducción vive únicamente en `CareScheduleGqlRepository.findByCriteria()`; el resto de capas (dominio, aplicación, presentación) solo conocen `CareScheduleFilters` en camelCase.

### ADR-004 — `careScheduleDelete` no envuelve el id en un input

Los demás mutations (`careScheduleCreate`, `careScheduleUpdate`, `careScheduleComplete`) reciben `input: { ... }`. `careScheduleDelete` es la excepción: el resolver declara `@Args('id') id: string` directamente (ver `care-schedule-mutations.resolver.ts` en la API), así que la mutation GQL en web es:

```graphql
mutation CareScheduleDelete($id: String!) {
  careScheduleDelete(id: $id) { id success message }
}
```

Copiar el patrón de `harvestDelete` (que sí usa `input: { id }`) sería un bug — anotarlo en el propio archivo de mutation con un comentario corto si hace falta.

### ADR-005 — Formulario único para creación y edición, "recurrente" como toggle derivado

`intervalDays` es `number | null` en el dominio: presente = recurrente, `null`/ausente = puntual. El form (`useCareScheduleForm`) expone un booleano derivado `isRecurring` (checkbox) que, si es `false`, fuerza `intervalDays: null` al enviar, sin pedir el número. Igual convención que usa la API (README: "one-time... con `intervalDays` omitido / `null`").

### ADR-006 — Reutilización de iconos de actividad

`CareScheduleActivityTypeEnum` tiene los mismos 9 valores que `CareLogActivityType` (`WATERING`...`OTHER`). Se replica el mismo mapa `ACTIVITY_ICONS` (lucide-react) que ya existe en `care-log-summary.tsx`, como constante propia de `care-schedule` (sin import cruzado — cada módulo es dueño de su propio mapa, tal como ya hace `care-log` respecto a otros contextos).

---

## 1. Estructura del módulo

```
src/core/care-schedule/
  domain/
    types/
      care-schedule.interface.ts        # CareSchedule, CARE_SCHEDULE_ACTIVITY_TYPES, CARE_SCHEDULE_UNITS
  application/
    ports/
      care-schedule.repository.port.ts  # ICareScheduleRepository
    interfaces/
      create-care-schedule-input.interface.ts
      update-care-schedule-input.interface.ts
      care-schedule-filters.interface.ts
    use-cases/
      get-care-schedules/{.ts,.spec.ts}
      get-care-schedule/{.ts,.spec.ts}
      create-care-schedule/{.ts,.spec.ts}
      update-care-schedule/{.ts,.spec.ts}
      complete-care-schedule/{.ts,.spec.ts}
      delete-care-schedule/{.ts,.spec.ts}
  infrastructure/
    repositories/graphql/
      queries/
        care-schedule-find-by-criteria.query.ts
        care-schedule-find-by-id.query.ts
      mutations/
        care-schedule-create.mutation.ts
        care-schedule-update.mutation.ts
        care-schedule-complete.mutation.ts
        care-schedule-delete.mutation.ts
      responses/
        care-schedule-find-by-criteria.response.ts
        care-schedule-find-by-id.response.ts
        care-schedule-create.response.ts
        care-schedule-update.response.ts
        care-schedule-complete.response.ts
        care-schedule-delete.response.ts
      care-schedule.gql.repository.ts
      care-schedule.gql.repository.spec.ts
  presentation/
    schemas/
      care-schedule.schema.ts            # Zod + tipo inferido
    hooks/
      use-care-schedules/{.ts,.spec.ts}       # lectura (filtros)
      use-create-care-schedule/{.ts,.spec.ts}
      use-update-care-schedule/{.ts,.spec.ts}
      use-complete-care-schedule/{.ts,.spec.ts}
      use-delete-care-schedule/{.ts,.spec.ts}
      use-care-schedule-form/{.ts,.spec.ts}
    components/
      care-schedule-row/{.tsx,.test.tsx}
      care-schedule-modal/{.tsx,.test.tsx}
    i18n/
      en.ts
      es.ts
      i18n-parity.test.ts
```

---

## 2. Domain Layer

### `domain/types/care-schedule.interface.ts`

```ts
export const CARE_SCHEDULE_ACTIVITY_TYPES = [
  'WATERING', 'FERTILIZING', 'PRUNING', 'REPOTTING', 'TRANSPLANTING',
  'PEST_TREATMENT', 'MISTING', 'ROTATION', 'OTHER',
] as const;
export type CareScheduleActivityType = (typeof CARE_SCHEDULE_ACTIVITY_TYPES)[number];

export const CARE_SCHEDULE_UNITS = ['ML', 'L', 'G', 'KG'] as const;
export type CareScheduleUnit = (typeof CARE_SCHEDULE_UNITS)[number];

export interface CareSchedule {
  id: string;
  plantId: string;
  activityType: CareScheduleActivityType;
  intervalDays: number | null;
  quantity: number | null;
  unit: CareScheduleUnit | null;
  notes: string | null;
  nextDueAt: string;
  lastCompletedAt: string | null;
  active: boolean;
  userId: string;
  spaceId: string;
  createdAt: string;
  updatedAt: string;
}
```

Sigue exactamente el shape de `CareScheduleResponseDto` en la API — sin adaptar nombres.

---

## 3. Application Layer

### `application/interfaces/care-schedule-filters.interface.ts`

```ts
export interface CareScheduleFilters {
  plantId?: string;
  activityType?: CareScheduleActivityType;
  active?: boolean;
  dueBefore?: string; // ISO date
}
```

### Port — `application/ports/care-schedule.repository.port.ts`

```ts
export interface ICareScheduleRepository {
  findByCriteria(filters?: CareScheduleFilters): Promise<CareSchedule[]>;
  findById(id: string): Promise<CareSchedule>;
  create(input: CreateCareScheduleInput): Promise<CareSchedule>;
  update(input: UpdateCareScheduleInput): Promise<CareSchedule>;
  complete(id: string, completedAt?: string): Promise<CareSchedule>;
  delete(id: string): Promise<void>;
}
```

`CreateCareScheduleInput` = `{ plantId, activityType, intervalDays?, quantity?, unit?, notes?, nextDueAt? }`.
`UpdateCareScheduleInput` = `{ id, activityType?, intervalDays?, quantity?, unit?, notes?, active? }` (mismo shape que `UpdateCareScheduleGraphQLDto`).

### Use-cases

Uno por operación, mismo patrón de una línea que `CreateHarvestUseCase`: recibe el repo por constructor, delega. `GetCareSchedulesUseCase.execute(filters?)` delega en `findByCriteria(filters)`. `CompleteCareScheduleUseCase.execute(id, completedAt?)` delega en `complete`.

Tests (`.spec.ts`): mock del repo, assert de que cada use-case llama al método correcto del puerto con los argumentos recibidos — igual que `create-harvest.use-case.spec.ts`.

---

## 4. Infrastructure Layer — GraphQL

### Queries

`care-schedule-find-by-criteria.query.ts`:

```graphql
query CareSchedulesFindByCriteria($input: CareScheduleCriteriaInput) {
  careSchedulesFindByCriteria(input: $input) {
    items {
      id plantId activityType intervalDays quantity unit notes
      nextDueAt lastCompletedAt active userId spaceId createdAt updatedAt
    }
  }
}
```

`care-schedule-find-by-id.query.ts`: mismo set de campos, `careScheduleFindById(input: CareScheduleFindByIdInput!)`.

### Mutations

`care-schedule-create.mutation.ts` / `-update` / `-complete`: `input: CreateCareScheduleInput!` / `UpdateCareScheduleInput!` / `CompleteCareScheduleInput!` respectivamente, todas retornan `{ id success message }` (mismo patrón que `harvestCreate`/`harvestUpdate`).

`care-schedule-delete.mutation.ts`: **ver ADR-004** — `$id: String!`, `careScheduleDelete(id: $id)`, sin wrapper `input`.

### `care-schedule.gql.repository.ts`

```ts
export class CareScheduleGqlRepository implements ICareScheduleRepository {
  async findByCriteria(filters: CareScheduleFilters = {}): Promise<CareSchedule[]> {
    const apiFilters = [];
    if (filters.plantId) apiFilters.push({ field: 'plant_id', operator: 'EQUALS', value: filters.plantId });
    if (filters.activityType) apiFilters.push({ field: 'activity_type', operator: 'EQUALS', value: filters.activityType });
    if (filters.active !== undefined) apiFilters.push({ field: 'active', operator: 'EQUALS', value: filters.active });
    if (filters.dueBefore) apiFilters.push({ field: 'due_before', operator: 'LESS_THAN_OR_EQUAL', value: filters.dueBefore });

    const res = await apolloClient.query<CareSchedulesFindByCriteriaResponse>({
      query: CARE_SCHEDULES_FIND_BY_CRITERIA,
      variables: { input: apiFilters.length ? { filters: apiFilters } : undefined },
      fetchPolicy: 'network-only',
    });
    return res.data?.careSchedulesFindByCriteria?.items ?? [];
  }

  // findById / create / update / complete / delete — mismo patrón que HarvestsGqlRepository:
  // create/update/complete devuelven { success, id } → refetch vía findById(id).
  // delete no hace refetch.
}

export const careScheduleGqlRepository = new CareScheduleGqlRepository();
```

`operator` se pasa como string literal (`'EQUALS'`, `'LESS_THAN_OR_EQUAL'`) — no hay enum compartido en web para `FilterOperator`; se sigue el mismo patrón string-literal que ya usa `care-log.gql.repository.ts` (`operator: 'EQUALS'`).

Tests: mock `apolloClient` (`vi.mock`), igual que `harvests.gql.repository.spec.ts` / `care-log.gql.repository.spec.ts` — assert de variables enviadas y mapeo de la respuesta, incluyendo un caso con `dueBefore` para confirmar el filtro `due_before`.

---

## 5. Presentation Layer — Hooks

### `use-care-schedules/use-care-schedules.hook.ts`

```ts
export function useCareSchedules(filters: CareScheduleFilters = {}) {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const { data, isLoading, error } = useQuery({
    queryKey: ['care-schedules', spaceId, filters],
    queryFn: () => careSchedulesUseCase.execute(filters),
    enabled: !!spaceId,
  });
  return { careSchedules: data ?? [], isLoading, error };
}
```

### `use-create-care-schedule`, `use-update-care-schedule`, `use-complete-care-schedule`, `use-delete-care-schedule`

`useMutation` + `queryClient.invalidateQueries({ queryKey: ['care-schedules'] })` en `onSuccess` (invalidación parcial por prefijo, igual que `useCreateHarvest` invalida `['harvests']`).

### `use-care-schedule-form/use-care-schedule-form.hook.ts`

Mismo patrón que `useHarvestForm`: `useForm` + `zodResolver(careScheduleSchema)`, decide `create` vs `update` según si recibe una `careSchedule` existente. Expone `isRecurring` derivado (ver ADR-005) vía `watch`/`setValue`, y `activityType`/`unit` seleccionados para los `<Select>`.

`presentation/schemas/care-schedule.schema.ts`:

```ts
export const careScheduleSchema = z.object({
  plantId: z.string().uuid(),
  activityType: z.enum(CARE_SCHEDULE_ACTIVITY_TYPES),
  isRecurring: z.boolean(),
  intervalDays: z.coerce.number().int().min(1).optional(),
  quantity: z.coerce.number().min(0.001).optional(),
  unit: z.enum(CARE_SCHEDULE_UNITS).optional(),
  notes: z.string().max(2000).optional(),
});
```

El envío transforma `isRecurring` en `intervalDays: isRecurring ? intervalDays : null` antes de llamar a create/update — la transformación vive en el hook de form, no en el schema.

---

## 6. Presentation Layer — Components

### `care-schedule-row/care-schedule-row.tsx`

Fila reutilizable: icono de actividad (ADR-006) + label de actividad + `nextDueAt` formateado + badge "vencida" si `nextDueAt < hoy` + botones completar/editar/eliminar. Props: `careSchedule`, `dict`, `onComplete`, `onEdit`, `onDelete`, y un `plantName?` opcional (solo se pasa desde el panel del día, donde hace falta desambiguar planta; se omite en el tab de detalle de planta, donde ya se sabe la planta).

### `care-schedule-modal/care-schedule-modal.tsx`

Mismo layout que `HarvestModal`: `Dialog` + inputs controlados por `useCareScheduleForm`. Si recibe `plantId` fijo (prop `lockedPlantId`), no muestra el selector de planta; si no, muestra un `<Select>` poblado por `usePlants(spaceId)` (para el flujo desde Calendario).

---

## 7. i18n

`careSchedule` dict: `row.{activityTypes,dueLabel,overdueLabel,complete,edit,delete}`, `form.{title,editTitle,plant,activityType,recurring,intervalDays,quantity,unit,notes,submit,submitting,cancel}`, `panel.empty` (para cuando no hay tareas ese día), `tab.empty` (para el tab de planta sin schedules). Registro en `get-dictionary.ts` como `careSchedule`.

---

## 8. Integración — `day-tasks-panel.tsx`

```tsx
export function DayTasksPanel({ selectedDate, dict }: Props) {
  const { careSchedules, isLoading } = useCareSchedules({ active: true, dueBefore: selectedDate });
  const { data: plants } = usePlants(spaceId);
  const { mutate: complete } = useCompleteCareSchedule();
  const { mutate: remove } = useDeleteCareSchedule();
  // ...header sin cambios...
  // body: loading skeleton | empty state | lista de CareScheduleRow con plantName resuelto por plantId
}
```

El botón "+ Añadir tarea" del `PageHeader` en `calendar.screen.tsx` sube un `isCreateOpen` a nivel de `CalendarScreen` (mismo patrón que `isCreateOpen` en `harvests-list.screen.tsx`) y renderiza `<CareScheduleModal onClose={...} />` sin `lockedPlantId` (selector de planta visible).

## 9. Integración — `plant-detail.screen.tsx`, tab "calendar"

Reemplaza `<InDevelopment />` en `TabsContent value="calendar"` por un mini `CareSchedulesList` inline (no hace falta un componente de screen aparte — la lista de filas + botón "+ nueva tarea" + modal, todo con `lockedPlantId={plantId}`), igual estructura que la sección `care` ya usa con `CareLogSummary`.

---

## 10. Test Strategy

- Unit: dominio (constantes), use-cases (mock de puerto), repositorio GQL (mock `apolloClient`), hooks (mock de use-cases o `apolloClient` según corresponda, mismo nivel que `use-create-harvest.hook.spec.ts`), componentes (`care-schedule-row.test.tsx`, `care-schedule-modal.test.tsx`), i18n parity.
- Manual/E2E no automatizado: `pnpm dev`, verificar en el navegador que el panel del día y el tab de planta funcionan (crear, completar, editar, borrar) antes de dar la tarea por cerrada — no hay Playwright configurado aún en este repo (`e2e_command` pendiente).

## 11. Open Questions

- ¿El panel del día debería incluir schedules **vencidos antes** de la fecha seleccionada (no solo los que vencen ese día exacto)? Se optó inicialmente por sí (`dueBefore` acumulativo) — **revertido tras feedback de usuario** (ver Amendment 1): al navegar a otro día, seguían apareciendo tareas de días anteriores. El panel del día ahora filtra por el día exacto (`dueOnDay`).

## Amendment 1 — `dueOnDay` reemplaza a `dueBefore` (post-implementación)

Tras probar la feature, se reportó que cambiar de día en el calendario seguía mostrando tareas de días previos, porque `dueBefore` era acumulativo por diseño ("todo lo pendiente hasta esa fecha"). Se cambia a filtrado por día exacto:

- `CareScheduleFilters.dueBefore?: string` → `CareScheduleFilters.dueOnDay?: string` (mismo formato `'YYYY-MM-DD'`).
- En `CareScheduleGqlRepository`, en vez del filtro virtual `due_before` (`next_due_at <=`), se envían dos filtros directos sobre la columna real `next_due_at` (la API soporta `GREATER_THAN_OR_EQUAL`/`LESS_THAN_OR_EQUAL` genéricamente sobre cualquier columna, no solo vía el virtual `due_before`):
  ```ts
  { field: 'next_due_at', operator: 'GREATER_THAN_OR_EQUAL', value: `${dueOnDay}T00:00:00.000` }
  { field: 'next_due_at', operator: 'LESS_THAN_OR_EQUAL', value: `${dueOnDay}T23:59:59.999` }
  ```
- `calendar.screen.tsx`: `useCareSchedules({ active: true, dueBefore: selectedDate })` → `useCareSchedules({ active: true, dueOnDay: selectedDate })`.
- **Trade-off aceptado**: un schedule activo cuyo `nextDueAt` quedó en el pasado sin completarse (p. ej. el usuario nunca abrió esa fecha) ya no aparece al navegar a "hoy" — solo aparece si se visita exactamente el día en que venció. No hay, de momento, una vista de "atrasadas" agregada; queda fuera de alcance de este cambio.
