# Technical Design: plant-photo-timeline

## 0. Context & Constraints

- Stack: Next.js 16 (App Router), TypeScript strict, React 19, TanStack Query v5, Vitest + Testing Library.
- Arquitectura: DDD + Hexagonal bajo `src/core/{context}/{layer}/`. Este cambio toca solo la capa `presentation` de `plant-photos` y un componente `shared/`.
- TDD estricto: **true** — tests antes que implementación.
- Punto de partida: `plant-photo-upload` (GDN-37), ya en `main`. No se toca dominio/aplicación/infraestructura de `plant-photos` — el dato (`createdAt`) ya viaja en `PlantPhoto`.
- Componente reutilizable ya existente y sin usar: `src/shared/presentation/components/ui/lightbox/lightbox.tsx` (`LightboxPhoto { src, alt }`, props `photos`, `initialIndex`, `open`, `onClose`, navegación por teclado/flechas).

### ADR-001 — Extender `Lightbox` con un `caption` opcional genérico, no una prop específica de fecha

`Lightbox` es un átomo de `shared/presentation/components/ui/` — no debe saber nada de "fotos de planta". Se añade `caption?: string` a `LightboxPhoto`, renderizado como texto bajo la imagen ampliada (solo si está presente). `PlantPhotoGallery` es quien construye ese `caption` con la fecha formateada; otros futuros usos del `Lightbox` pueden pasar cualquier otro texto o ninguno. No se crea un componente nuevo.

### ADR-002 — Selección de foto abierta es estado local del componente, no Zustand

Solo `PlantPhotoGallery` necesita saber qué foto está ampliada. Se añade `const [selectedIndex, setSelectedIndex] = useState<number | null>(null)` dentro del propio componente (regla de "State local a un único componente" de `AGENTS.md`). Click en una miniatura → `setSelectedIndex(i)`; `onClose` del `Lightbox` → `setSelectedIndex(null)`.

### ADR-003 — Formateo de fecha reutiliza `formatShortDate(iso, lang)`, no una utilidad nueva

`plant-detail.screen.tsx` ya formatea `plant.createdAt` con `formatShortDate` (`shared/presentation/utils/format-short-date.util.ts`). Se usa la misma utilidad para `photo.createdAt`, evitando una tercera forma de formatear fechas en el módulo. Esto requiere que `PlantPhotoGallery` reciba `lang: string` como prop nueva — el mismo valor que la pantalla ya tiene y pasa a otros subcomponentes (`CareLogSummary`, `CareScheduleList`).

### ADR-004 — La tira de miniaturas no cambia de layout

Por decisión de producto, se descarta sustituir la tira horizontal (`overflow-x-auto`) por `PhotoGrid`. Cada miniatura existente gana un `onClick` que abre el `Lightbox`; el resto de su render (imagen, botón de borrar) no cambia.

---

## 1. Files Touched

```
src/shared/presentation/components/ui/lightbox/
  lightbox.tsx              # + LightboxPhoto.caption?, render bajo la imagen
  lightbox.spec.tsx         # + caso: renderiza el caption cuando está presente
  lightbox.stories.tsx      # + variante con caption (opcional, no bloqueante)

src/core/plant-photos/presentation/components/plant-photo-gallery/
  plant-photo-gallery.tsx   # + selectedIndex, click en miniatura, <Lightbox>
  plant-photo-gallery.spec.tsx  # + casos de apertura/cierre/navegación/fecha

src/core/plant-photos/presentation/i18n/
  en.ts / es.ts             # + clave para el prefijo de fecha en el Lightbox
  i18n-parity.spec.ts       # ya existe, cubre la clave nueva automáticamente

src/core/plants/presentation/screens/plant-detail/
  plant-detail.screen.tsx        # pasa lang a <PlantPhotoGallery>
  plant-detail.screen.spec.tsx   # actualizar mocks si el spec valida props exactas
```

No se toca dominio, aplicación ni infraestructura de `plant-photos` (el dato ya existe), ni el backend.

---

## 2. `Lightbox` — cambio de shared UI

```ts
export interface LightboxPhoto {
  src: string;
  alt: string;
  caption?: string;
}
```

Render: bajo la imagen ampliada (dentro del mismo contenedor `relative`, debajo de `<Image>`), solo si `photo.caption` está definido:

```tsx
{photo.caption && (
  <p className="mt-2 text-center text-sm text-white/80">{photo.caption}</p>
)}
```

No cambia ninguna otra prop ni comportamiento (navegación, Escape, cierre por backdrop siguen igual) — los tests existentes de `lightbox.spec.tsx` no deben requerir cambios, solo se añade un caso nuevo.

---

## 3. `PlantPhotoGallery` — conectar el Lightbox

```tsx
type Props = {
  plantId: string;
  lang: string;
  dict: AppDict['plantPhotos'];
};

export function PlantPhotoGallery({ plantId, lang, dict }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // ...hooks existentes sin cambios (usePlantPhotos, usePlantPhotoUpload, useDeletePlantPhoto)

  const lightboxPhotos = photos.map((photo) => ({
    src: getAuthenticatedImageUrl(photo.url, accessToken, currentSpaceId) ?? photo.url,
    alt: '',
    caption: `${dict.uploadedOn} ${formatShortDate(photo.createdAt, lang)}`,
  }));

  // cada miniatura: onClick={() => setSelectedIndex(i)} añadido al <div> existente
  // (o envolviendo su contenido en un <button type="button">, ver nota de accesibilidad abajo)

  return (
    <div className="flex flex-col gap-2">
      {/* ...botón añadir foto, alerts, tira de miniaturas (sin cambios de layout) */}

      <Lightbox
        photos={lightboxPhotos}
        initialIndex={selectedIndex ?? 0}
        open={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
      />
    </div>
  );
}
```

Notas:
- **Accesibilidad**: la miniatura ya es un `<div>` con un botón de borrar superpuesto (`absolute`); para no anidar `<button>` dentro de `<button>`, el `onClick` de apertura va en el `<div data-testid="plant-photo-{id}">` (rol implícito de contenedor clicable) o se convierte ese `<div>` en `<button type="button">` y el botón de borrar pasa a `stopPropagation()` en su click — se decide en implementación según lo que mantenga los tests existentes (`plant-photo-{id}`, `btn-delete-photo-{id}`) más simples.
- `initialIndex ?? 0` evita pasar `null`/`undefined` al `Lightbox` cuando está cerrado (su prop `open={false}` ya evita el render, así que el valor es irrelevante mientras esté cerrado, pero se mantiene el tipo `number`).
- El orden de `lightboxPhotos` es el mismo que el de `photos` (ya viene `createdAt DESC` del backend) — la navegación del `Lightbox` respeta ese orden sin necesidad de reordenar nada en el front.

---

## 4. i18n

```ts
// en.ts — nueva clave
uploadedOn: 'Uploaded on',
```
```ts
// es.ts — nueva clave
uploadedOn: 'Subida el',
```

El resto del diccionario `plantPhotos` no cambia. `i18n-parity.spec.ts` ya existente valida automáticamente que ambas claves coincidan.

---

## 5. Integration

`plant-detail.screen.tsx` ya recibe `lang: string` como prop de pantalla — solo hay que añadirlo al `<PlantPhotoGallery plantId={plantId} dict={photosDict} />` existente:

```tsx
<PlantPhotoGallery plantId={plantId} lang={lang} dict={photosDict} />
```

No hace falta tocar `app/[lang]/(protected)/plants/[id]/page.tsx` (ya pasa `photosDict`; `lang` ya se resuelve en la propia screen).
