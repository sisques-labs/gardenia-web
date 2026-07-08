# Technical Design: plant-photo-upload

## 0. Context & Constraints

- Stack: Next.js 16 (App Router), TypeScript strict, React 19, Axios (cliente `http` compartido), TanStack Query v5, Vitest + Testing Library.
- Arquitectura: DDD + Hexagonal bajo `src/core/{context}/{layer}/`.
- TDD estricto: **true** — tests antes que implementación.
- Referencia directa: `gardenia-api`'s `plant-photos` context (PR #321) para la forma exacta de la API.
- La API expone: `POST /api/plant-photos` (multipart, `file` + `plantId`), `GET /api/plant-photos?plantId=` (paginado), `DELETE /api/plant-photos/:id` (solo autor, 403 si no).

### ADR-001 — `plant-photos` es un bounded context propio en la web, espejo del de la API

Igual que `care-log`: no es una extensión de `plants`. `src/core/plant-photos/` es independiente; el componente `PlantPhotoGallery` se importa en `plant-detail.screen.tsx` cruzando contextos solo en la capa de presentación (patrón ya aceptado para `CareLogSummary`/`CareScheduleList`).

### ADR-002 — Todo el módulo va por REST (axios), no por GraphQL

La API no expone subida de fichero por GraphQL (igual que `files`, por diseño). Para no partir un módulo tan pequeño entre dos transportes, `PlantPhotosHttpRepository` usa el cliente `http` compartido para las tres operaciones (subir, listar, borrar) en vez de mezclar Apollo para lectura/borrado y axios solo para subida.

### ADR-003 — Invalidar también la query `plant` tras subir/borrar

Subir o borrar una foto puede cambiar `plants.imageUrl` en el backend (sync al más reciente). El hook de mutación invalida `['plant-photos', spaceId, plantId]` **y** `['plant', spaceId, plantId]` para que la imagen de cabecera del detalle (y las tarjetas del listado, si están montadas) reflejen el cambio sin recargar.

### ADR-004 — Subida secuencial de múltiples ficheros

El input de fichero acepta `multiple`. Cada fichero se sube con una llamada `POST /api/plant-photos` independiente (la API no soporta batch). El componente las lanza secuencialmente (no en paralelo) para que la barra de progreso/mensajes de error sean deterministas y para no saturar el input file de Multer; el fallo de una no cancela las demás.

### ADR-005 — Borrado solo visible para el autor

El backend ya rechaza con 403 el borrado de una foto que no subiste. La UI evita la llamada inútil: el botón de borrar en cada miniatura solo se renderiza cuando `photo.userId === currentUser.userId` (de `useAuthStore`).

---

## 1. Module Structure

```
src/core/plant-photos/
  domain/
    interfaces/
      plant-photo.interface.ts        # PlantPhoto
  application/
    ports/
      plant-photos.repository.port.ts # IPlantPhotosRepository
    use-cases/
      get-plant-photos/
        get-plant-photos.use-case.ts
        get-plant-photos.use-case.spec.ts
      upload-plant-photo/
        upload-plant-photo.use-case.ts
        upload-plant-photo.use-case.spec.ts
      delete-plant-photo/
        delete-plant-photo.use-case.ts
        delete-plant-photo.use-case.spec.ts
  infrastructure/
    repositories/
      http/
        plant-photos-http.repository.ts
        plant-photos-http.repository.spec.ts
  presentation/
    hooks/
      use-plant-photos/
        use-plant-photos.hook.ts
        use-plant-photos.hook.spec.ts
      use-upload-plant-photo/
        use-upload-plant-photo.hook.ts
        use-upload-plant-photo.hook.spec.ts
      use-delete-plant-photo/
        use-delete-plant-photo.hook.ts
        use-delete-plant-photo.hook.spec.ts
    components/
      plant-photo-gallery/
        plant-photo-gallery.tsx
        plant-photo-gallery.spec.tsx
    i18n/
      en.ts
      es.ts
      i18n-parity.spec.ts
```

Touch-points en módulos existentes:
```
src/core/plants/presentation/screens/plant-detail/plant-detail.screen.tsx  # botón + galería
src/core/plants/presentation/screens/plant-detail/plant-detail.screen.spec.tsx  # actualizar aserción de btn-add-photo
src/shared/presentation/i18n/get-dictionary.ts  # registrar PlantPhotosDict
app/[lang]/(protected)/plants/[id]/page.tsx  # pasar photosDict
```

---

## 2. Domain Layer

```ts
// domain/interfaces/plant-photo.interface.ts
export interface PlantPhoto {
  id: string;
  plantId: string;
  fileId: string;
  url: string;
  userId: string;
  spaceId: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 3. Application Layer

```ts
// application/ports/plant-photos.repository.port.ts
export interface IPlantPhotosRepository {
  listByPlant(plantId: string): Promise<PlantPhoto[]>;
  upload(plantId: string, file: File): Promise<PlantPhoto>;
  delete(id: string): Promise<void>;
}
```

Los tres use-cases son envoltorios finos (mismo patrón que `CreatePlantUseCase`/`GetPlantUseCase`), sin lógica propia — la lógica de "subir varios ficheros secuencialmente" vive en el componente/hook de presentación, no en el use-case (cada llamada de `UploadPlantPhotoUseCase.execute` sube un único fichero).

---

## 4. Infrastructure Layer

`PlantPhotosHttpRepository` usa el cliente `http` compartido:

```ts
async listByPlant(plantId: string): Promise<PlantPhoto[]> {
  const res = await http.get<{ items: PlantPhoto[] }>('/plant-photos', {
    params: { plantId, limit: 100 },
  });
  return res.data.items;
}

async upload(plantId: string, file: File): Promise<PlantPhoto> {
  const formData = new FormData();
  formData.append('plantId', plantId);
  formData.append('file', file);
  const res = await http.post<PlantPhoto>('/plant-photos', formData);
  return res.data;
}

async delete(id: string): Promise<void> {
  await http.delete(`/plant-photos/${id}`);
}
```

No hace falta fijar `Content-Type: multipart/form-data` a mano — axios lo infiere de `FormData` y añade el boundary correcto.

---

## 5. Presentation — Hooks

- `usePlantPhotos(plantId)` — `useQuery(['plant-photos', spaceId, plantId], ...)`, `enabled: !!spaceId && !!plantId`. Mismo patrón que `usePlant`.
- `useUploadPlantPhoto(plantId)` — `useMutation`, `mutationFn: (file: File) => uploadPlantPhotoUseCase.execute(plantId, file)`, `onSuccess` invalida `['plant-photos', spaceId, plantId]` y `['plant', spaceId, plantId]`.
- `useDeletePlantPhoto(plantId)` — igual, invalida las mismas dos keys.

## 6. Presentation — Component

`PlantPhotoGallery({ plantId, dict })`:
- Botón "Añadir foto" (`data-testid="btn-add-photo"`) que dispara un `<input type="file" accept="image/*" multiple hidden>`.
- Al seleccionar ficheros: sube cada uno secuencialmente vía `useUploadPlantPhoto`; si alguno falla, muestra `<Alert variant="error">` con `dict.uploadError` sin detener los siguientes.
- Lista `usePlantPhotos(plantId)`; mientras carga no bloquea el resto de la ficha (skeleton simple o `null`).
- Cada miniatura: `<Image>` + botón de borrar (`data-testid="btn-delete-photo-{id}"`) visible solo si `photo.userId === currentUser?.userId`; al pulsar, `useDeletePlantPhoto().mutate(photo.id)`.
- Estado vacío: no renderiza nada si no hay fotos (la ficha ya tiene su placeholder de "sin imagen" en la cabecera vía `plant.imageUrl`).

## 7. i18n

```ts
// en.ts
const dict = {
  addPhoto: 'Add photo',
  uploading: 'Uploading...',
  uploadError: 'Could not upload the photo. Try again.',
  deletePhoto: 'Delete photo',
  deleteError: 'Could not delete the photo. Try again.',
} as const;
```
Espejo en `es.ts` (tuteo, castellano peninsular), con `i18n-parity.spec.ts` de flatten recursivo igual que en `care-log`.

## 8. Integration

En `plant-detail.screen.tsx`:
- Prop nueva `photosDict: AppDict['plantPhotos']`.
- Sustituir el hueco que dejó el test (`btn-add-photo` ausente) por `<PlantPhotoGallery plantId={plantId} dict={photosDict} />`, colocado junto al bloque de acciones (`plant-action-bar`), sin tocar `btn-mark-watered`/`btn-edit-plant`/`btn-delete-plant`.
- `app/[lang]/(protected)/plants/[id]/page.tsx` pasa `photosDict={dict.plantPhotos}`.
