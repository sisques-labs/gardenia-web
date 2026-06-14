# Tasks: care-log-web

## Review Workload Forecast

| Campo | Valor |
|-------|-------|
| Líneas estimadas | ~320 líneas |
| Riesgo presupuesto 400 líneas | Bajo |
| PRs encadenados | No (un solo PR) |
| Estrategia de entrega | ask-on-risk |

Decision needed before apply: No

---

## Phase 1: Domain

- [x] 1.1 Crear `src/core/care-log/domain/interfaces/care-log-entry.interface.ts` — enum `CareLogActivityType` (9 valores), interface `CareLogEntry`, tipo `LastCareByType = Partial<Record<CareLogActivityType, CareLogEntry>>`. Satisface: diseño §2.

---

## Phase 2: Application

- [x] 2.1 Crear `src/core/care-log/application/ports/care-log.repository.port.ts` — `ICareLogRepository { findByPlantId(plantId: string, limit?: number): Promise<CareLogEntry[]> }`. Satisface: diseño §3.
- [x] 2.2 RED: Escribir `src/core/care-log/application/use-cases/get-plant-care-logs/get-plant-care-logs.use-case.spec.ts` — tests en fallo: "returns last entry per activity type", "returns empty object when no entries", "propagates repository errors". Satisface: TDD.
- [x] 2.3 GREEN: Crear `src/core/care-log/application/use-cases/get-plant-care-logs/get-plant-care-logs.use-case.ts` — `GetPlantCareLogsUseCase.execute(plantId)` llama a `findByPlantId(plantId, 50)` y reduce al último por tipo con `reduceToLastByType`. Satisface: diseño §3.

---

## Phase 3: Infrastructure

- [x] 3.1 Crear `src/core/care-log/infrastructure/repositories/graphql/queries/care-log-find-by-plant.query.ts` — query `CareLogFindByPlant($input: CareLogFindByCriteriaGraphQLDto!)` con todos los campos de `CareLogEntry`. Satisface: diseño §4.
- [x] 3.2 Crear `src/core/care-log/infrastructure/repositories/graphql/responses/care-log-find-by-plant.response.ts` — tipo `CareLogFindByPlantResponse`. Satisface: diseño §4.
- [x] 3.3 RED: Escribir `src/core/care-log/infrastructure/repositories/graphql/care-log.gql.repository.spec.ts` — tests en fallo: "findByPlantId() llama a careLogFindByCriteria con variables correctas", "retorna items de la respuesta", "retorna [] si careLogFindByCriteria es null". Mock `apolloClient`. Satisface: TDD.
- [x] 3.4 GREEN: Crear `src/core/care-log/infrastructure/repositories/graphql/care-log.gql.repository.ts` — `CareLogGqlRepository implements ICareLogRepository`; exporta singleton `careLogGqlRepository`. Satisface: diseño §4.

---

## Phase 4: i18n + Dict Registration

- [x] 4.1 Crear `src/core/care-log/presentation/i18n/en.ts` — dict con `sectionTitle`, `empty`, `activityTypes` (los 9 tipos en inglés); exporta `CareLogDict`. Satisface: diseño §7.
- [x] 4.2 Crear `src/core/care-log/presentation/i18n/es.ts` — espejo en español (`satisfies WidenStringLiterals<CareLogDict>`); tuteo, castellano. Satisface: diseño §7.
- [x] 4.3 RED+GREEN: Crear `src/core/care-log/presentation/i18n/i18n-parity.test.ts` — flatten recursivo de ambos dicts; assert diferencia simétrica vacía. Satisface: convención i18n.
- [x] 4.4 Actualizar `src/shared/presentation/i18n/get-dictionary.ts` — importar `CareLogDict`, `enCareLog`, `esCareLog`; añadir `careLog` a `AppDict`; registrar en `dictionaries.en` y `dictionaries.es`. Satisface: diseño §7.

---

## Phase 5: Presentation Hook

- [x] 5.1 RED: Escribir `src/core/care-log/presentation/hooks/use-plant-care-logs/use-plant-care-logs.hook.spec.ts` — tests: "retorna LastCareByType en éxito", "permanece idle cuando spaceId es null", "permanece idle cuando plantId está vacío". Mock use-case + `useSpacesStore`. Satisface: TDD.
- [x] 5.2 GREEN: Crear `src/core/care-log/presentation/hooks/use-plant-care-logs/use-plant-care-logs.hook.ts` — `usePlantCareLogs(plantId)` con `useQuery(['care-log', spaceId, plantId], ...)`, `enabled: !!spaceId && !!plantId`. Satisface: diseño §5.

---

## Phase 6: Component

- [x] 6.1 RED: Escribir `src/core/care-log/presentation/components/care-log-summary/care-log-summary.test.tsx` — tests: "muestra sectionTitle", "muestra nombre localizado por tipo", "muestra estado vacío cuando no hay entradas", "no renderiza entradas para tipos ausentes". Satisface: TDD.
- [x] 6.2 GREEN: Crear `src/core/care-log/presentation/components/care-log-summary/care-log-summary.tsx` — `CareLogSummary({ lastCareByType, dict, lang })`. Incluye función `formatRelativeTime` (Intl.RelativeTimeFormat), mapa de icono por tipo (lucide-react), lista de filas con tiempo relativo o estado vacío. Satisface: diseño §6.

---

## Phase 7: Integration

- [x] 7.1 Actualizar `src/core/plants/presentation/screens/plant-detail/plant-detail.screen.tsx`:
  - Importar `usePlantCareLogs` y `CareLogSummary`.
  - Añadir prop `careLogDict: AppDict['careLog']`.
  - Llamar `usePlantCareLogs(plantId)` en el cuerpo del componente.
  - Renderizar `<CareLogSummary lastCareByType={lastCareByType ?? {}} dict={careLogDict} lang={lang} />` en `TabsContent value="care"`, encima del care-grid existente.
  Satisface: diseño §8.
- [x] 7.2 Actualizar `app/[lang]/(protected)/plants/[id]/page.tsx` — pasar `careLogDict={dict.careLog}` como prop adicional a `PlantDetailScreen`. Satisface: diseño §8.
