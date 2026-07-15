# Tasks: plant-identification-web

## Review Workload Forecast

| Campo | Valor |
|-------|-------|
| Líneas estimadas | ~1200-1500 líneas (nuevo módulo completo: 4 componentes + 1 pantalla + hooks + repos duales + i18n + stories) |
| Riesgo presupuesto 400 líneas | Alto — se entrega en varias fases/commits sobre una sola rama de desarrollo, dividir en PRs encadenados si el equipo lo pide |
| Estrategia de entrega | ask-on-risk |
| Depende de | `gardenia-api`'s paired `plant-identification` change (endpoints must exist before this is testable end-to-end; UI/unit work can proceed against a mocked repository in the meantime) |

---

## Phase 1: Domain

- [ ] 1.1 Crear `src/core/plant-identification/domain/interfaces/plant-identification.interface.ts` — `PlantIdentification`, `PlantIdentificationPhoto`, `PlantIdentificationCandidate`. Satisface: diseño §2.
- [ ] 1.2 Crear `src/core/plant-identification/domain/interfaces/plant-identification-organ.type.ts`. Satisface: diseño §2.

## Phase 2: Application

- [ ] 2.1 Crear `application/ports/plant-identifications.repository.port.ts` — `IPlantIdentificationsRepository`. Satisface: diseño §3.
- [ ] 2.2 Crear `application/interfaces/identify-plant-input.interface.ts` y `create-plant-from-identification-input.interface.ts`. Satisface: diseño §3.
- [ ] 2.3 RED+GREEN: `identify-plant.use-case.spec.ts` + `.ts`. Satisface: TDD.
- [ ] 2.4 RED+GREEN: `get-plant-identifications.use-case.spec.ts` + `.ts`. Satisface: TDD.
- [ ] 2.5 RED+GREEN: `create-plant-from-identification.use-case.spec.ts` + `.ts`. Satisface: TDD.

## Phase 3: Infrastructure

- [ ] 3.1 Crear `infrastructure/repositories/graphql/queries/plant-identifications.query.ts` — `gql` document, paginated criteria input.
- [ ] 3.2 Crear `infrastructure/repositories/graphql/mutations/create-plant-from-identification.mutation.ts` — `gql` document, `CreatedEntity`-shaped response.
- [ ] 3.3 RED+GREEN: `plant-identification.gql.repository.spec.ts` + `.ts` — `findByCriteria`/`createPlantFromIdentification` via mocked `apolloClient`; `identify` via mocked `http` (multipart `FormData`, per ADR-002/design §4). Satisface: diseño §4.

## Phase 4: i18n + Dict Registration

- [ ] 4.1 Crear `presentation/i18n/en.ts` / `es.ts` del módulo `plant-identification` (claves de diseño §6). Satisface: diseño §6.
- [ ] 4.2 RED+GREEN: `i18n-parity.test.ts`. Satisface: convención i18n.
- [ ] 4.3 Actualizar `src/shared/presentation/i18n/get-dictionary.ts` — registrar `plantIdentification`.

## Phase 5: Presentation Hooks

- [ ] 5.1 RED+GREEN: `use-identify-plant.hook.spec.ts` + `.ts`. Satisface: diseño §5.
- [ ] 5.2 RED+GREEN: `use-plant-identifications.hook.spec.ts` + `.ts`. Satisface: diseño §5.
- [ ] 5.3 RED+GREEN: `use-create-plant-from-identification.hook.spec.ts` + `.ts` — verifica invalidación de `['plants', spaceId]` y `['plant-identifications', spaceId]`. Satisface: diseño §5.

## Phase 6: Schema

- [ ] 6.1 Crear `presentation/schemas/create-plant-from-identification.schema.ts` — Zod, `name: min(1).max(100)`.

## Phase 7: Components

- [ ] 7.1 RED+GREEN+Story: `photo-organ-picker.tsx` — añadir/quitar fotos (máx. 5, guardia client-side), selector de órgano por foto, preview de miniatura.
- [ ] 7.2 RED+GREEN+Story: `identification-result-panel.tsx` — 3 estados (resuelto/no-match/error) per ADR-004, barra de confianza por candidato, disclosure "ver otras posibilidades".
- [ ] 7.3 RED+GREEN+Story: `create-plant-from-identification-modal.tsx` — RHF+Zod, solo campo nombre, imagen prellenada desde la primera foto (no editable).
- [ ] 7.4 RED+GREEN+Story: `recent-identifications-list.tsx` — lista compacta, miniatura + especie resuelta o "no reconocida" + fecha + enlace a la planta si `convertedToPlantId`.

## Phase 8: Screen & Route

- [ ] 8.1 RED: `identify-plant.screen.spec.tsx` — flujo completo: añadir fotos → enviar → ver resultado resuelto → abrir modal → crear planta → redirección; y flujo no-match sin CTA; y flujo de error de proveedor.
- [ ] 8.2 GREEN: `identify-plant.screen.tsx` — orquesta `PhotoOrganPicker` + `useIdentifyPlant` + `IdentificationResultPanel` + `CreatePlantFromIdentificationModal` + `RecentIdentificationsList` per diseño §5.
- [ ] 8.3 Story: `identify-plant.screen.stories.tsx` — seed de TanStack Query con fixtures (resuelto, no-match, vacío), sin mockear los hooks.
- [ ] 8.4 Crear `app/[lang]/(protected)/plants/identify/page.tsx` — server component, `getDictionary(lang)`, `dict.plantIdentification`.

## Phase 9: Entry Point

- [ ] 9.1 Actualizar `plants-list.screen.tsx` (+ spec) — botón "Identificar planta" junto a "Crear planta", enlaza a `/[lang]/plants/identify`.

## Phase 10: Verification

- [ ] 10.1 `pnpm test` verde.
- [ ] 10.2 `pnpm lint` limpio.
- [ ] 10.3 `pnpm tsc --noEmit` limpio.
- [ ] 10.4 Storybook build limpio (todas las stories nuevas).
- [ ] 10.5 Verificación manual en navegador contra la api real (o mock local si la api aún no está desplegada): identificar con 1 y varias fotos, ver resultado resuelto, crear planta y llegar a su detalle, ver historial reciente actualizado.
