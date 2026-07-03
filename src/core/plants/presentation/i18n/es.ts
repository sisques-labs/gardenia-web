import type { PlantsDict } from './en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';

type PlantsDictTranslated = WidenStringLiterals<PlantsDict>;

const dict = {
  nav: 'Inventario',
  list: {
    title: 'Catálogo del jardín',
    newPlant: 'Nueva planta',
    empty: 'Todavía no hay plantas',
    filterAll: 'Todas',
    filters: 'Filtros',
    searchPlaceholder: 'Buscar plantas...',
    searchChipLabel: 'Búsqueda',
    statsPlants: 'plantas',
    statsSpecies: 'especies',
    inProgress: 'Próximamente',
    categories: {
      vegetable: 'Hortaliza',
      herb: 'Aromática',
      leafy: 'Hoja',
      root: 'Raíz',
      flower: 'Flor',
      tree: 'Árbol',
    },
    card: {
      delete: 'Eliminar planta',
      health: {
        good: 'Saludable',
        warn: 'Requiere atención',
        bad: 'En riesgo',
        inactive: 'Inactiva',
      },
    },
  },
  create: {
    title: 'Nueva planta',
    name: 'Nombre',
    namePlaceholder: 'ej. Monstera',
    nameRequired: 'El nombre es obligatorio',
    nameMax: 'Máximo 100 caracteres',
    imageUrl: 'URL de imagen',
    imageUrlPlaceholder: 'https://...',
    submit: 'Crear',
    submitting: 'Creando...',
    cancel: 'Cancelar',
    error: 'No se pudo crear la planta. Inténtalo de nuevo.',
  },
  delete: {
    button: 'Eliminar planta',
    confirmTitle: 'Eliminar planta',
    confirmDescription: 'Esta acción no se puede deshacer. La planta se eliminará permanentemente.',
    confirm: 'Eliminar',
    cancel: 'Cancelar',
    error: 'No se pudo eliminar la planta. Inténtalo de nuevo.',
  },
  detail: {
    breadcrumbList: 'Inventario',
    noSpecies: 'Especie desconocida',
    actions: {
      markWatered: 'Marcar regado',
      markWateredError: 'No se pudo registrar el riego. Inténtalo de nuevo.',
    },
    care: {
      lastWatered: 'Último riego',
      neverWatered: 'Todavía no hay riegos registrados',
    },
    qr: {
      label: 'Etiqueta · QR',
      hint: 'Imprime y pega en la maceta',
      download: 'Descargar PDF',
    },
    calendarTitle: 'Próximas tareas',
  },
} as const satisfies PlantsDictTranslated;

export default dict;
