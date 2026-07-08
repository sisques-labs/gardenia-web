# Tasks: plant-photo-upload

## Review Workload Forecast

| Campo | Valor |
|-------|-------|
| Líneas estimadas | ~450-500 líneas |
| Riesgo presupuesto 400 líneas | Medio — puede requerir 2 PRs, pero se entrega en una sola rama de desarrollo por instrucción explícita |
| Estrategia de entrega | ask-on-risk |

---

## Phase 1: Domain

- [ ] 1.1 Crear `src/core/plant-photos/domain/interfaces/plant-photo.interface.ts` — `PlantPhoto`. Satisface: diseño §2.

## Phase 2: Application

- [ ] 2.1 Crear `src/core/plant-photos/application/ports/plant-photos.repository.port.ts` — `IPlantPhotosRepository`. Satisface: diseño §3.
- [ ] 2.2 RED+GREEN: `get-plant-photos.use-case.spec.ts` + `.ts`. Satisface: TDD.
- [ ] 2.3 RED+GREEN: `upload-plant-photo.use-case.spec.ts` + `.ts`. Satisface: TDD.
- [ ] 2.4 RED+GREEN: `delete-plant-photo.use-case.spec.ts` + `.ts`. Satisface: TDD.

## Phase 3: Infrastructure

- [ ] 3.1 RED+GREEN: `plant-photos-http.repository.spec.ts` + `.ts` (mock del cliente `http`). Satisface: diseño §4.

## Phase 4: i18n + Dict Registration

- [ ] 4.1 Crear `en.ts` / `es.ts` del módulo `plant-photos`. Satisface: diseño §7.
- [ ] 4.2 RED+GREEN: `i18n-parity.spec.ts`. Satisface: convención i18n.
- [ ] 4.3 Actualizar `get-dictionary.ts` — registrar `plantPhotos`. Satisface: diseño §7.

## Phase 5: Presentation Hooks

- [ ] 5.1 RED+GREEN: `use-plant-photos.hook.spec.ts` + `.ts`. Satisface: diseño §5.
- [ ] 5.2 RED+GREEN: `use-upload-plant-photo.hook.spec.ts` + `.ts`. Satisface: diseño §5.
- [ ] 5.3 RED+GREEN: `use-delete-plant-photo.hook.spec.ts` + `.ts`. Satisface: diseño §5.

## Phase 6: Component

- [ ] 6.1 RED: `plant-photo-gallery.spec.tsx` — botón añadir foto, subida múltiple secuencial, error de subida, miniaturas, borrado solo-autor, feedback de error de borrado.
- [ ] 6.2 GREEN: `plant-photo-gallery.tsx`.

## Phase 7: Integration

- [ ] 7.1 Actualizar `plant-detail.screen.spec.tsx` — el test que documentaba `btn-add-photo` ausente pasa a esperarlo presente; añadir cobertura de integración de la galería.
- [ ] 7.2 Actualizar `plant-detail.screen.tsx` — prop `photosDict`, render de `PlantPhotoGallery`.
- [ ] 7.3 Actualizar `app/[lang]/(protected)/plants/[id]/page.tsx` — pasar `photosDict={dict.plantPhotos}`.

## Phase 8: Verificación

- [ ] 8.1 `pnpm test` verde.
- [ ] 8.2 `pnpm lint` limpio.
- [ ] 8.3 `pnpm tsc --noEmit` limpio.
- [ ] 8.4 Verificación manual en navegador (subir foto, ver miniatura, borrar, ver error si falla).
