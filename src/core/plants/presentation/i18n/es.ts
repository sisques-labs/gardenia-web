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
    inProgress: 'Próximamente',
  },
  detail: {
    breadcrumbList: 'Inventario',
    qrPrint: 'Imprimir QR',
    noImage: 'Sin imagen',
    noSpecies: 'Especie desconocida',
    tabs: {
      care: 'Cuidados',
      calendar: 'Calendario',
      associations: 'Asociaciones',
    },
    sections: {
      care: { title: 'Cuidados', inProgress: 'Próximamente' },
      cycle: { title: 'Ciclo de crecimiento', inProgress: 'Próximamente' },
      photoHistory: { title: 'Historial fotográfico', inProgress: 'Próximamente' },
      pests: { title: 'Control de plagas', inProgress: 'Próximamente' },
    },
  },
} as const satisfies PlantsDictTranslated;

export default dict;
