# Proposal: plant-photo-upload

## Intent

### Problem

`gardenia-api` acaba de incorporar el bounded context `plant-photos` (PR #321 en `gardenia-api`, GDN-37), que permite subir una o más fotos a una planta concreta y mantiene un historial real (cada foto con su propio timestamp), reutilizando el módulo `files` ya existente para el almacenamiento. En `gardenia-web`, sin embargo, la única forma de poner una imagen en una planta es pegar una URL a mano en un campo de texto ("Image URL") en los modales de crear/editar planta — no hay subida de ficheros ni historial visible.

### Why now

La API ya expone `POST /api/plant-photos` (multipart) y `plantPhotosFindByCriteria`/`plantPhotoDelete` por GraphQL. El detalle de planta (`plant-detail.screen.tsx`) ya reserva el hueco para esto: su propio test (`plant-detail.screen.spec.tsx`) documentaba explícitamente que **no** debía existir un botón `btn-add-photo` todavía — ese test es justo el marcador que esta historia viene a cumplir.

### Success looks like

- Desde el detalle de una planta, el usuario puede pulsar "Añadir foto", elegir uno o varios ficheros de imagen, y cada uno se sube y aparece asociado a la planta con su propia fecha.
- La imagen principal de la planta (`plant.imageUrl`, ya usada en la ficha y en las tarjetas del listado) se actualiza automáticamente a la foto más reciente — esto ya lo hace la API (`plants.imageUrl` sync), la web solo necesita refrescar su caché tras subir.
- El usuario ve una tira de miniaturas con el historial de fotos de la planta, puede eliminar las que él mismo subió, y recibe feedback claro de éxito/error en la subida.
- El campo de texto libre "Image URL" en crear/editar planta se mantiene tal cual (no es objeto de este cambio) — esta historia añade la vía de subida real, no sustituye la existente.

---

## Scope (v1 — este cambio)

### In scope

- **Dominio**: interfaz `PlantPhoto` (`id, plantId, fileId, url, userId, spaceId, createdAt, updatedAt`).
- **Aplicación**: `UploadPlantPhotoUseCase`, `GetPlantPhotosUseCase`, `DeletePlantPhotoUseCase` — envoltorios finos sobre el repositorio.
- **Infraestructura**: `PlantPhotosHttpRepository` sobre el cliente `http` (axios) compartido — el upload es multipart/REST (igual que en la API, que no expone subida por GraphQL); listar y borrar también van por REST para no mezclar dos transportes en un módulo tan pequeño.
- **Presentación**:
  - Hooks TanStack Query: `usePlantPhotos(plantId)`, `useUploadPlantPhoto()`, `useDeletePlantPhoto()`.
  - Componente `plant-photo-gallery.tsx`: botón "Añadir foto" (input file oculto, `multiple`), tira de miniaturas, borrado solo para el autor, alertas de éxito/error.
  - Integración en `plant-detail.screen.tsx`: sustituye el placeholder `btn-add-photo` que el test ya esperaba; invalida también la query `plant` para que la imagen principal se refresque.
  - i18n en `es.ts`/`en.ts` del nuevo módulo `plant-photos`, registrado en `get-dictionary.ts`.

### Out of scope (historias futuras del epic GDN-36)

- Galería a pantalla completa / lightbox, reordenar fotos, seleccionar portada manualmente.
- Edición, filtros o anotaciones sobre la foto.
- Análisis automático de la foto (detección de salud, etc.).
- Tocar el campo "Image URL" de los modales de crear/editar planta.

---

## Approach

Nuevo bounded context `src/core/plant-photos/`, siguiendo el patrón DDD + Hexagonal ya establecido (`plants`, `care-log`). Capa de presentación conectada a `plant-detail.screen.tsx` mediante un componente autocontenido (`PlantPhotoGallery`), igual que `CareLogSummary`/`CareScheduleList`.
