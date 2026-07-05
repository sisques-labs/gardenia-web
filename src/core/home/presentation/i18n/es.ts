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
  },
} as const satisfies HomeDictTranslated;

export default dict;
