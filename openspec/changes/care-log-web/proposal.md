# Proposal: care-log-web

## Intent

### Problem
`gardenia-api` ya tiene un módulo `care-log` completo con endpoints GraphQL para registrar y consultar actividades de cuidado de plantas (riego, fertilización, poda, etc.). Sin embargo, `gardenia-web` no expone ninguna de esta información: el detalle de planta muestra datos estáticos hardcodeados (frecuencia de riego, sol, suelo, poda) pero **no muestra cuándo se realizó cada cuidado por última vez**. El usuario no sabe si regó su planta ayer o hace dos semanas.

### Why now
El módulo `care-log` en la API está completo y disponible vía GraphQL. La pantalla de detalle de planta (`plant-detail.screen.tsx`) ya tiene una pestaña "Cuidados" con tarjetas estáticas — el sitio natural para añadir el historial real. La infraestructura GraphQL (Apollo Client con headers JWT + X-Space-ID) y el patrón DDD + Hexagonal ya están establecidos, con `plants-module` como referencia directa.

### Success looks like
- En la pestaña "Cuidados" del detalle de planta aparece una sección "Últimos cuidados" con una fila por cada tipo de actividad realizada (riego, fertilización, poda, etc.).
- Cada fila muestra el icono del tipo, el nombre localizado y cuánto tiempo hace que se realizó (ej. "Riego · hace 3 días").
- Si no hay registros para un tipo, no aparece esa fila.
- Si la planta no tiene ningún registro, se muestra un estado vacío honesto.
- El módulo `care-log` sigue exactamente el patrón del módulo `plants`: dominio → aplicación → infraestructura → presentación, con tests en TDD estricto.

---

## Scope (v1 — este cambio)

### In scope
- **Dominio**: interfaces `CareLogEntry`, enum `CareLogActivityType`, tipo `LastCareByType`.
- **Aplicación**: `GetPlantCareLogsUseCase` — recupera los registros de care log de una planta (últimos N, ordenados por `performedAt` desc) y los reduce al último por tipo.
- **Infraestructura**: `CareLogGqlRepository` con `findByPlantId(plantId, limit)` usando `careLogFindByCriteria` de la API.
- **Presentación**:
  - Hook `use-plant-care-logs` (TanStack Query, cacheado por `spaceId + plantId`).
  - Componente `care-log-summary.tsx` — lista de filas con icono + nombre de actividad + tiempo relativo ("hace N días").
  - Integración en `plant-detail.screen.tsx`: sección "Últimos cuidados" dentro de la pestaña "Cuidados", encima de los CareCards estáticos.
  - i18n en `es.ts` y `en.ts`: nombres de actividades y textos de la sección.

### Out of scope (cambios posteriores)
- Formulario para registrar nuevos cuidados (el botón "Marcar regado" ya existe pero queda disabled).
- Historial completo paginado de care logs.
- Filtros por tipo de actividad.
- Gráficas / frecuencia de cuidado.

---

## Approach

### Option A — Nuevo bounded context `care-log` con DDD completo (seleccionado)

Crea `src/core/care-log/` con las cuatro capas:

1. `domain/interfaces/care-log-entry.interface.ts` — tipos puros (`CareLogEntry`, `CareLogActivityType` enum, `LastCareByType`).
2. `application/ports/care-log.repository.port.ts` — interfaz `ICareLogRepository`.
3. `application/use-cases/get-plant-care-logs/` — `GetPlantCareLogsUseCase` + spec.
4. `infrastructure/repositories/graphql/care-log.gql.repository.ts` — `CareLogGqlRepository` implementando el port vía Apollo.
5. `presentation/hooks/use-plant-care-logs/` — TanStack Query wrapper.
6. `presentation/components/care-log-summary/care-log-summary.tsx` — componente de UI.
7. `presentation/i18n/en.ts` + `es.ts` + parity test.

El componente `care-log-summary` se integra en la pestaña "Cuidados" de `plant-detail.screen.tsx` (sin mover ni modificar el resto de esa pestaña).

**Rationale**: mantiene el bounded context aislado (`care-log` no es responsabilidad del módulo `plants`), facilita la testabilidad y permite expandir (crear registros, historial completo) sin tocar el módulo de plantas.

### Rejected alternatives
- **Option B — Añadir todo dentro de `src/core/plants/`**: mezcla responsabilidades. `care-log` es un dominio propio en la API; web debe reflejarlo igual. Rechazado.
- **Option C — Fetch directo en el screen sin capa de dominio**: imposible de testear y rompe la arquitectura hexagonal. Rechazado.

---

## Delivery

Un único **PR** hacia `main` (estimado ~320 líneas), dividido en fases secuenciales:

- **Phase 1** (dominio + aplicación + infraestructura + i18n) — capa de datos.
- **Phase 2** (hook + componente + integración en plant-detail) — capa de presentación.

---

## Risks

1. **Nombre del campo GraphQL**: el resolver usa `careLogFindByCriteria` con `input.plantId`. Si la API cambia el nombre, solo hay que actualizar el query document.
2. **Tiempo relativo (relative time)**: se implementa con la Intl API nativa del navegador (`Intl.RelativeTimeFormat`) para evitar dependencias externas.
3. **Strict TDD overhead**: añade ~30% de esfuerzo pero es obligatorio por convención del proyecto.

---

## Affected Areas

- `src/core/care-log/` — nuevo bounded context (todas las capas).
- `src/core/plants/presentation/screens/plant-detail/plant-detail.screen.tsx` — añade `CareLogSummary` en la pestaña "Cuidados".
- `src/core/plants/presentation/i18n/en.ts` + `es.ts` — nuevas claves para la sección de care log.
- `src/shared/presentation/i18n/get-dictionary.ts` — añadir `careLog` a `AppDict`.
