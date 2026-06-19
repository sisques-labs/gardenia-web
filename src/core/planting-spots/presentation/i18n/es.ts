import type { PlantingSpotsDict } from './en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';

type PlantingSpotsDictTranslated = WidenStringLiterals<PlantingSpotsDict>;

const dict = {
  list: {
    title: 'Zonas de cultivo',
    empty: 'Todavía no hay zonas de cultivo en este espacio.',
    new: 'Nueva zona de cultivo',
    available: 'Disponible',
    full: 'Lleno',
    overCapacity: 'Sobre capacidad',
    plants: 'plantas',
    noCapacity: 'Sin límite',
  },
  form: {
    titleCreate: 'Nueva zona de cultivo',
    titleEdit: 'Editar zona de cultivo',
    name: 'Nombre',
    type: 'Tipo',
    description: 'Descripción (opcional)',
    capacity: 'Capacidad máxima (opcional)',
    capacityHint: 'Dejar vacío para no establecer límite de capacidad',
    row: 'Fila (opcional)',
    column: 'Columna (opcional)',
    dimensionsWidth: 'Ancho (opcional)',
    dimensionsHeight: 'Alto (opcional)',
    dimensionsLength: 'Largo (opcional)',
    soilType: 'Tipo de suelo (opcional)',
    save: 'Guardar',
    saving: 'Guardando…',
    delete: 'Eliminar',
    deleteConfirm: '¿Estás seguro de que quieres eliminar esta zona de cultivo?',
    cancel: 'Cancelar',
  },
  detail: {
    tabActivePlants: 'Plantas activas',
    tabRotationHistory: 'Historial de rotación',
    tabInfo: 'Info del espacio',
    editSpot: 'Editar espacio',
    addPlant: 'Añadir planta',
    noActivePlants: 'No hay plantas asignadas actualmente a este espacio.',
    rotationHistoryEmpty: 'No hay historial de rotación todavía.',
    infoCapacity: 'Capacidad',
    infoRow: 'Fila',
    infoColumn: 'Columna',
    infoDimensionsWidth: 'Ancho',
    infoDimensionsHeight: 'Alto',
    infoDimensionsLength: 'Largo',
    infoSoilType: 'Tipo de suelo',
    infoType: 'Tipo',
    infoDescription: 'Descripción',
    noLimit: 'Sin límite',
    notSet: 'No establecido',
    plantsCount: 'plantas',
    position: 'Posición',
  },
  types: {
    RAISED_BED: 'Bancal',
    POT: 'Maceta',
    CONTAINER: 'Contenedor',
    FIELD_SECTION: 'Sección de campo',
    OTHER: 'Otro',
  },
} as const satisfies PlantingSpotsDictTranslated;

export default dict;
