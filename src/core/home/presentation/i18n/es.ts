import type { HomeDict } from './en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';

type HomeDictTranslated = WidenStringLiterals<HomeDict>;

const dict = {
  topbar: {
    search: 'Buscar',
    newEntry: 'Nueva entrada',
    notifications: 'Notificaciones',
    createMenu: {
      label: 'Crear',
      newPlant: 'Nueva planta',
      newJournalEntry: 'Nueva entrada del diario',
    },
  },
  greeting: 'Hola',
  sections: {
    todayTasks: {
      title: 'Tareas de hoy',
      empty: 'No tienes tareas pendientes para hoy.',
    },
    growingNow: {
      title: 'Creciendo ahora',
      empty: 'Todavía no tienes plantas activas.',
      andMore: 'y {count} más',
    },
    plantingSpotsSummary: {
      title: 'Parcelas de cultivo',
      active: 'Activas',
      fallow: 'En barbecho',
      empty: 'Todavía no tienes parcelas de cultivo.',
    },
    harvestPace: {
      title: 'Ritmo de cosecha',
      inProgress: 'En desarrollo',
    },
    journal: {
      title: 'Diario',
      inProgress: 'En desarrollo',
    },
  },
} as const satisfies HomeDictTranslated;

export default dict;
