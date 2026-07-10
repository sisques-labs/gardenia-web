import type { PlantPhotosDict } from './en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';

type PlantPhotosDictTranslated = WidenStringLiterals<PlantPhotosDict>;

const dict = {
  addPhoto: 'Añadir foto',
  uploading: 'Subiendo...',
  uploadError: 'No se pudo subir la foto. Inténtalo de nuevo.',
  deletePhoto: 'Eliminar foto',
  deleteError: 'No se pudo eliminar la foto. Inténtalo de nuevo.',
  uploadedOn: 'Subida el',
} as const satisfies PlantPhotosDictTranslated;

export default dict;
