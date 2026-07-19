import type { PlantIdentificationDict } from './en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';

type PlantIdentificationDictTranslated = WidenStringLiterals<PlantIdentificationDict>;

const dict = {
  title: 'Identificar una planta',
  addPhoto: 'Añadir foto',
  removePhoto: 'Quitar foto',
  photosHint: 'Añade entre 1 y 5 fotos en JPG o PNG y elige qué parte de la planta muestra cada una.',
  maxPhotosReached: 'Puedes añadir hasta 5 fotos',
  unsupportedFormat: 'Solo se admiten fotos en JPG y PNG — se han omitido algunos archivos.',
  organLabel: 'Parte de la planta',
  organ: {
    leaf: 'Hoja',
    flower: 'Flor',
    fruit: 'Fruto',
    bark: 'Corteza',
    habit: 'Planta entera',
    other: 'Otro',
  },
  submit: 'Identificar planta',
  submitting: 'Identificando…',
  submitError: 'Ha ocurrido un error al identificar la planta. Inténtalo de nuevo.',
  resolved: {
    title: 'Creemos que es:',
    confidence: 'Confianza',
    createPlantCta: 'Crear planta con esta especie',
    viewOtherCandidates: 'Ver otras posibilidades',
  },
  noMatch: {
    title: 'No hemos podido identificar esta planta con confianza',
    fallbackToManual: 'Aún puedes crear la planta manualmente y buscar su especie.',
    candidatesTitle: 'Coincidencias más cercanas encontradas',
  },
  error: {
    title: 'La identificación no está disponible',
    provider: 'El servicio de identificación no está disponible en este momento. Inténtalo de nuevo en un rato.',
    quota: 'Se ha alcanzado el límite de identificaciones por ahora. Inténtalo de nuevo más tarde.',
    retry: 'Inténtalo de nuevo',
  },
  createModal: {
    title: 'Crear planta',
    nameLabel: 'Nombre',
    namePlaceholder: 'p. ej. Mi Monstera',
    nameRequired: 'El nombre es obligatorio',
    nameMax: 'Máximo 100 caracteres',
    submit: 'Crear planta',
    submitting: 'Creando…',
    cancel: 'Cancelar',
    error: 'No se pudo crear la planta. Inténtalo de nuevo.',
  },
  recent: {
    title: 'Identificaciones recientes',
    empty: 'Aún no hay identificaciones',
    resolvedLabel: 'Identificada',
    noMatchLabel: 'No reconocida',
    convertedBadge: 'Convertida en planta',
    viewPlant: 'Ver planta',
  },
} as const satisfies PlantIdentificationDictTranslated;

export default dict;
