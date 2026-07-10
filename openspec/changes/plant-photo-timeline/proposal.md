# Proposal: plant-photo-timeline

## Intent

### Problem

`plant-photo-upload` (GDN-37) ya dejó subida y una tira de miniaturas en el detalle de planta, pero explícitamente dejó fuera de alcance la "galería a pantalla completa / lightbox" como historia futura del epic GDN-36. GDN-38 pide exactamente eso: ver el historial de fotos de una planta como un timeline, con fecha de subida por foto, y poder abrir una foto en tamaño grande.

### Why now

GDN-38 depende de GDN-37, que ya está en `main`. El componente `PlantPhotoGallery` (`src/core/plant-photos/presentation/components/plant-photo-gallery/`) ya cumple 2 de los 4 criterios de aceptación de GDN-38:

1. ✅ Desde el detalle de planta se ve una tira con todas las fotos.
2. ✅ Orden cronológico consistente — la API (`plantPhotosFindByCriteria`) ya ordena por `createdAt DESC` por defecto y el front no reordena.
3. ❌ Cada foto debe mostrar su fecha de subida.
4. ❌ El usuario debe poder abrir/ver una foto en tamaño grande.

Además, ya existe un componente `Lightbox` (`src/shared/presentation/components/ui/lightbox/lightbox.tsx`) completo — navegación con flechas/teclado, cierre con Escape — construido pero sin usar en ningún módulo. Este cambio lo conecta.

### Success looks like

- Al hacer click en cualquier miniatura de la tira de fotos de una planta, se abre una vista ampliada (el `Lightbox` ya existente) con esa foto, mostrando su fecha de subida.
- Desde la vista ampliada, el usuario puede navegar entre todas las fotos de la planta (mismo orden que la tira) con las flechas o el teclado, sin volver a cerrar y reabrir.
- Cerrar la vista ampliada (click fuera, botón de cierre o Escape) devuelve a la ficha de planta sin recargar nada.

---

## Scope (v1 — este cambio)

### In scope

- **Presentación**: `PlantPhotoGallery` pasa a renderizar cada miniatura como un botón que abre el `Lightbox` compartido en el índice correspondiente, con estado local (`selectedIndex`).
- Adaptar `LightboxPhoto` (o extender su prop, ver `design.md`) para poder mostrar la fecha de subida (`photo.createdAt`) formateada dentro del propio `Lightbox`, sin tocar las miniaturas de la tira (la fecha **no** se añade a la tira, solo a la vista ampliada — decisión de producto).
- i18n: nueva clave para la etiqueta de fecha en el diccionario `plantPhotos` (`en.ts`/`es.ts`), cubierta por `i18n-parity.spec.ts` ya existente.
- Tests: extender `plant-photo-gallery.spec.tsx` (click en miniatura abre el Lightbox, navegación, fecha visible) y añadir `lightbox.spec.tsx` si no existe cobertura para la nueva prop de fecha.

### Out of scope

- Sustituir la tira horizontal de miniaturas por un grid (`PhotoGrid`) — se mantiene el layout actual.
- Mostrar la fecha en cada miniatura de la tira.
- Reordenar, comparar fotos lado a lado, o generar time-lapses.
- Cualquier análisis automático de la foto.
- Tocar el backend — la API ya expone todo lo necesario (`plantPhotosFindByCriteria`, orden por defecto, `createdAt` en la respuesta).

---

## Approach

Reutilizar el `Lightbox` ya construido en `shared/presentation/components/ui/lightbox/`, conectándolo desde `PlantPhotoGallery` (mismo patrón que ya usa `PhotoGrid`/`Lightbox` en sus stories: `photos: LightboxPhoto[]`, `initialIndex`, `open`, `onClose`). Se añade la fecha de subida como dato mostrado por el propio `Lightbox`, formateada con la utilidad compartida `formatShortDate` (mismo patrón que `plant-detail.screen.tsx` usa para `plant.createdAt`).
