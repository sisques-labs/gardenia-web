# Tasks: care-schedule-web

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~950 (domain+application ~120, GQL infra ~200, hooks ~150, components ~250, i18n ~80, integration in calendar+plant-detail ~150) |
| 400-line budget risk | High — split into chained PRs |
| Chained PRs recommended | Yes |
| Delivery strategy | PR 1: module (domain/application/infrastructure/hooks) + i18n. PR 2: components (row/modal) + Calendar day-panel integration. PR 3: plant-detail "calendar" tab integration. |

---

## Phase 1: Domain + Application Layer

- [ ] 1.1 **[RED]** No aplica (constantes/tipos puros, sin lógica a testear directamente); en su lugar, escribir primero los specs de use-cases (paso 1.4) que fuerzan la existencia de estos tipos.
- [ ] 1.2 Crear `src/core/care-schedule/domain/types/care-schedule.interface.ts` — `CARE_SCHEDULE_ACTIVITY_TYPES`, `CareScheduleActivityType`, `CARE_SCHEDULE_UNITS`, `CareScheduleUnit`, `CareSchedule`. Ver diseño §2.
- [ ] 1.3 Crear interfaces de aplicación: `application/interfaces/care-schedule-filters.interface.ts`, `create-care-schedule-input.interface.ts`, `update-care-schedule-input.interface.ts`. Ver diseño §3.
- [ ] 1.4 **[RED]** Escribir specs de los 6 use-cases (`get-care-schedules`, `get-care-schedule`, `create-care-schedule`, `update-care-schedule`, `complete-care-schedule`, `delete-care-schedule`), mock del puerto `ICareScheduleRepository`. Assert: cada use-case delega en el método correcto del repo con los argumentos recibidos.
- [ ] 1.5 **[GREEN]** Crear `application/ports/care-schedule.repository.port.ts` (`ICareScheduleRepository`) y los 6 use-cases (una clase por archivo, patrón `CreateHarvestUseCase`).
- [ ] 1.6 **[REFACTOR]** Confirmar que ningún archivo de esta fase importa de React, Zustand, Apollo, ni de `src/core/plants` o `src/core/calendar`.

---

## Phase 2: Infraestructura GraphQL

- [ ] 2.1 Crear queries: `care-schedule-find-by-criteria.query.ts`, `care-schedule-find-by-id.query.ts`. Ver diseño §4.
- [ ] 2.2 Crear mutations: `care-schedule-create.mutation.ts`, `care-schedule-update.mutation.ts`, `care-schedule-complete.mutation.ts`, `care-schedule-delete.mutation.ts`. **Ojo con `care-schedule-delete.mutation.ts`: `$id: String!` sin wrapper `input`** (diseño ADR-004) — no copiar el patrón de `harvest-delete.mutation.ts`.
- [ ] 2.3 Crear tipos de respuesta en `responses/` para cada query/mutation (mismo patrón que `harvest-find-by-criteria.response.ts`).
- [ ] 2.4 **[RED]** Escribir `care-schedule.gql.repository.spec.ts` — mock `apolloClient` (`vi.mock`). Casos: `findByCriteria()` sin filtros, `findByCriteria({ plantId })` → filtro `plant_id`/`EQUALS`, `findByCriteria({ active: true, dueBefore })` → filtros `active`/`EQUALS` y `due_before`/`LESS_THAN_OR_EQUAL`, `findById`, `create` (refetch tras `success`), `update` (refetch), `complete` (refetch), `delete` (sin refetch, variables = `{ id }` plano, no `{ input: { id } }`).
- [ ] 2.5 **[GREEN]** Crear `care-schedule.gql.repository.ts` implementando `ICareScheduleRepository`. Ver diseño §4. Exportar singleton `careScheduleGqlRepository`.
- [ ] 2.6 **[REFACTOR]** Confirmar que la traducción camelCase→snake_case de filtros vive solo aquí (ADR-003).

---

## Phase 3: Hooks de presentación

- [ ] 3.1 **[RED]** Escribir specs de `use-care-schedules`, `use-create-care-schedule`, `use-update-care-schedule`, `use-complete-care-schedule`, `use-delete-care-schedule` (mock de use-cases, patrón `use-create-harvest.hook.spec.ts`). Cubrir: `useCareSchedules` respeta `enabled: !!spaceId` y usa `filters` en la query key; las mutaciones invalidan `['care-schedules']` en éxito.
- [ ] 3.2 **[GREEN]** Crear los 5 hooks. Ver diseño §5.
- [ ] 3.3 **[RED]** Escribir `use-care-schedule-form.hook.spec.ts` — casos: modo creación (valores por defecto, `isRecurring: true`), modo edición (precarga desde `careSchedule`), envío con `isRecurring: false` fuerza `intervalDays: null`, envío en modo edición llama a `update` con `id`.
- [ ] 3.4 **[GREEN]** Crear `presentation/schemas/care-schedule.schema.ts` (Zod) y `use-care-schedule-form.hook.ts`. Ver diseño §5, ADR-005.

---

## Phase 4: i18n

- [ ] 4.1 Crear `presentation/i18n/en.ts` — `CareScheduleDict` con `row.*`, `form.*`, `panel.empty`, `tab.empty` (ver diseño §7 para el listado exacto de claves).
- [ ] 4.2 Crear `presentation/i18n/es.ts` — `satisfies WidenStringLiterals<CareScheduleDict>`, castellano de España, tuteo.
- [ ] 4.3 **[RED]+[GREEN]** Crear `presentation/i18n/i18n-parity.test.ts` (flatten recursivo + diferencia simétrica vacía, mismo patrón que otros módulos).
- [ ] 4.4 Modificar `src/shared/presentation/i18n/get-dictionary.ts` — importar `CareScheduleDict`, `enCareSchedule`, `esCareSchedule`; añadir `careSchedule` a `AppDict` y a ambos locales.

---

## Phase 5: Componentes compartidos

- [ ] 5.1 **[RED]** Escribir `care-schedule-row.test.tsx`. Assert: muestra icono + label de actividad, muestra fecha de próximo vencimiento formateada, muestra badge "vencida" cuando `nextDueAt` es pasado y `active` es `true`, no muestra badge si no está vencida o si `active` es `false`, muestra `plantName` solo si se pasa la prop, dispara `onComplete`/`onEdit`/`onDelete` con el `id` correcto al hacer click.
- [ ] 5.2 **[GREEN]** Crear `care-schedule-row.tsx`. Ver diseño §6, ADR-006 (reutilizar mapa de iconos de actividad).
- [ ] 5.3 **[RED]** Escribir `care-schedule-modal.test.tsx`. Assert: título cambia entre crear/editar, precarga valores en edición, oculta selector de planta cuando recibe `lockedPlantId`, muestra selector de planta (poblado por `usePlants`, mockeado) cuando no recibe `lockedPlantId`, checkbox "recurrente" muestra/oculta el campo `intervalDays`, envío llama a `onClose` tras éxito.
- [ ] 5.4 **[GREEN]** Crear `care-schedule-modal.tsx`. Ver diseño §6.

---

## Phase 6: Integración — Calendario (panel del día)

- [ ] 6.1 **[RED]** Actualizar `day-tasks-panel.test.tsx` (o crearlo si no existe): reemplazar el mock/expectativa de `InDevelopment` por: loading skeleton mientras `isLoading`, estado vacío (`dict.panel.empty`) cuando no hay resultados, lista de `CareScheduleRow` (mock) una por cada `careSchedule`, `plantName` resuelto vía `usePlants` (mock) y pasado a cada fila.
- [ ] 6.2 **[GREEN]** Actualizar `day-tasks-panel.tsx` — `useCareSchedules({ active: true, dueBefore: selectedDate })` + `usePlants(spaceId)` + `useCompleteCareSchedule` + `useDeleteCareSchedule`. Ver diseño §8.
- [ ] 6.3 **[RED]** Actualizar `calendar.screen.test.tsx` (si existe) o el spec que cubra el botón "+ Añadir tarea": clic abre `CareScheduleModal` (mock) sin `lockedPlantId`.
- [ ] 6.4 **[GREEN]** Actualizar `calendar.screen.tsx` — estado `isCreateOpen`, wire del botón existente, render condicional de `<CareScheduleModal onClose={...} />`.
- [ ] 6.5 **[REFACTOR]** Confirmar que `day-tasks-panel.tsx` ya no importa `InDevelopment`.

---

## Phase 7: Integración — Detalle de planta (tab "calendar")

- [ ] 7.1 **[RED]** Actualizar `plant-detail.screen.spec.tsx` (o el spec correspondiente): tab "calendar" ya no renderiza `InDevelopment`; renderiza lista de `CareScheduleRow` (mock) filtrada por `plantId` vía `useCareSchedules` (mock), botón "+ nueva tarea" abre `CareScheduleModal` con `lockedPlantId={plantId}`.
- [ ] 7.2 **[GREEN]** Modificar `plant-detail.screen.tsx` — `TabsContent value="calendar"`: `useCareSchedules({ plantId })`, estado vacío (`dict.tab.empty`), lista de filas (sin `plantName` — ya se conoce la planta), botón + modal con `lockedPlantId={plantId}`. Añadir prop `careScheduleDict: AppDict['careSchedule']`.
- [ ] 7.3 Actualizar `app/[lang]/(protected)/plants/[id]/page.tsx` — pasar `careScheduleDict={dict.careSchedule}`.
- [ ] 7.4 **[REFACTOR]** Confirmar que el tab "care" (con `CareLogSummary`) no se ve afectado.

---

## Definition of Done

- [ ] Todos los tests nuevos pasan (`pnpm test`).
- [ ] `pnpm tsc --noEmit` sin errores.
- [ ] `pnpm lint` sin errores.
- [ ] Panel del día en `/calendar` lista tareas vencidas/pendientes de esa fecha; completar y borrar funcionan y refrescan la lista.
- [ ] "+ Añadir tarea" en Calendario crea un schedule visible tras cerrar el modal.
- [ ] Tab "calendar" del detalle de planta permite crear, editar, completar y borrar schedules de esa planta.
- [ ] i18n parity test pasa para `careSchedule`.
- [ ] Verificado manualmente en navegador (`pnpm dev`) el flujo completo antes de dar la tarea por cerrada.
