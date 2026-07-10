# Tasks: plant-photo-timeline

## Review Workload Forecast

| Campo | Valor |
|-------|-------|
| Líneas estimadas | ~120-160 líneas |
| Riesgo presupuesto 400 líneas | Bajo — cambio pequeño, un único PR |
| Estrategia de entrega | single-PR |

---

## Phase 1: Shared UI — Lightbox

- [ ] 1.1 RED: `lightbox.spec.tsx` — nuevo caso "renders the caption when the current photo has one" (y otro que confirma que no se renderiza nada si `caption` está ausente, para no romper los casos existentes). Satisface: diseño §2.
- [ ] 1.2 GREEN: `lightbox.tsx` — añadir `caption?: string` a `LightboxPhoto` y su render condicional bajo la imagen. Satisface: diseño §2.
- [ ] 1.3 (Opcional) Añadir variante `WithCaption` en `lightbox.stories.tsx`.

## Phase 2: i18n

- [ ] 2.1 Añadir clave `uploadedOn` a `en.ts` y `es.ts` del módulo `plant-photos`. Satisface: diseño §4.
- [ ] 2.2 `pnpm test` sobre `i18n-parity.spec.ts` sigue en verde sin cambios (ya cubre claves nuevas automáticamente).

## Phase 3: PlantPhotoGallery — conectar el Lightbox

- [ ] 3.1 RED: `plant-photo-gallery.spec.tsx` — casos nuevos:
  - click en una miniatura abre el Lightbox con esa foto seleccionada (`initialIndex` correcto).
  - el Lightbox recibe un `caption` con `dict.uploadedOn` + fecha formateada (`formatShortDate`).
  - cerrar el Lightbox (`onClose`) vuelve a `selectedIndex === null` (Lightbox no se renderiza / `open=false`).
  - el botón de borrar dentro de una miniatura sigue funcionando sin también abrir el Lightbox (evitar propagación de click).
  Satisface: diseño §3.
- [ ] 3.2 GREEN: `plant-photo-gallery.tsx` — prop `lang` nueva, estado `selectedIndex`, mapeo a `LightboxPhoto[]` con `caption`, render de `<Lightbox>`, click-to-open en cada miniatura sin romper el botón de borrar existente. Satisface: diseño §3.

## Phase 4: Integration

- [ ] 4.1 Actualizar `plant-detail.screen.tsx` — pasar `lang={lang}` a `<PlantPhotoGallery>`. Satisface: diseño §5.
- [ ] 4.2 Revisar `plant-detail.screen.spec.tsx` — actualizar el mock/render de `PlantPhotoGallery` si el test verifica sus props exactas; si no, no requiere cambios.

## Phase 5: Verificación

- [ ] 5.1 `pnpm test` verde.
- [ ] 5.2 `pnpm lint` limpio.
- [ ] 5.3 `pnpm tsc --noEmit` limpio.
- [ ] 5.4 Verificación manual en navegador: abrir una foto desde la tira, ver su fecha, navegar con flechas/teclado entre fotos, cerrar con Escape/backdrop/botón X, confirmar que borrar una foto sigue funcionando sin abrir el Lightbox por error.
