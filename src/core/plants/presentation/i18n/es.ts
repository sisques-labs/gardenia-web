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
    statsPlants: 'plantas',
    statsSpecies: 'especies',
    inProgress: 'Próximamente',
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
  detail: {
    breadcrumbList: 'Inventario',
    qrPrint: 'Imprimir QR',
    noImage: 'Sin imagen',
    noSpecies: 'Especie desconocida',
    actions: {
      markWatered: 'Marcar regado',
      addPhoto: 'Añadir foto',
      newNote: 'Nueva nota',
    },
    qr: {
      label: 'Etiqueta · QR',
      hint: 'Imprime y pega en la maceta',
      download: 'Descargar PDF',
    },
    tabs: {
      care: 'Cuidados',
      calendar: 'Calendario',
      diary: 'Diario',
      harvests: 'Cosechas',
      pests: 'Plagas',
      associations: 'Asociaciones',
    },
    sections: {
      care: { title: 'Cuidados', inProgress: 'Próximamente' },
      cycle: { title: 'Ciclo de crecimiento', inProgress: 'Próximamente' },
      photoHistory: { title: 'Historial fotográfico', inProgress: 'Próximamente' },
      pests: { title: 'Control de plagas', inProgress: 'Próximamente' },
    },
    care: {
      wateringLabel: 'RIEGO',
      wateringTitle: 'Cada día · 250 ml',
      wateringDesc: 'Reduce a 200ml en floración. Profundo, raras veces.',
      sunLabel: 'SOL',
      sunTitle: '6–8 h directo',
      sunDesc: 'Orienta hacia el sur. Tolerante a calor pero pajas a 35°C.',
      soilLabel: 'SUELO',
      soilTitle: 'Rico, drenado · pH 6.0–6.8',
      soilDesc: 'Aporta compost cada 3 semanas. Tutorear desde el día 21.',
      pruningLabel: 'PODA',
      pruningTitle: 'Quitar chupones',
      pruningDesc: 'Una vez por semana. Hojas bajas tras primera floración.',
    },
    cycle: {
      title: 'CICLO · 64 DÍAS',
      seedStage: 'Semilla',
      seedlingStage: 'Plántula',
      vegetativeStage: 'Vegetativa',
      fruitingStage: 'Fructificación',
    },
  },
} as const satisfies PlantsDictTranslated;

export default dict;
