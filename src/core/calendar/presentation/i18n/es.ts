import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';
import type { CalendarDict } from './en';

const dict = {
  screenTitle: 'Calendario',
  addTask: 'Nueva tarea',
  viewSwitcher: {
    day: 'Día',
    week: 'Semana',
    month: 'Mes',
    year: 'Año',
  },
  grid: {
    weekdays: {
      mon: 'L',
      tue: 'M',
      wed: 'X',
      thu: 'J',
      fri: 'V',
      sat: 'S',
      sun: 'D',
    },
    seasons: {
      spring: 'primavera',
      summer: 'verano',
      autumn: 'otoño',
      winter: 'invierno',
    },
    months: {
      january: 'Enero',
      february: 'Febrero',
      march: 'Marzo',
      april: 'Abril',
      may: 'Mayo',
      june: 'Junio',
      july: 'Julio',
      august: 'Agosto',
      september: 'Septiembre',
      october: 'Octubre',
      november: 'Noviembre',
      december: 'Diciembre',
    },
    overflow: 'más',
    viewSwitcher: {
      day: 'Día',
      week: 'Semana',
      month: 'Mes',
      year: 'Año',
    },
  },
  panel: {
    todayPrefix: 'Hoy',
    inDevLabel: 'Tareas del día',
  },
} satisfies WidenStringLiterals<CalendarDict>;

export default dict;
