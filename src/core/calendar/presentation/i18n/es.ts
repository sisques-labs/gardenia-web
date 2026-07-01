import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';
import type { CalendarDict } from './en';

const dict = {
  screenTitle: 'Calendario',
  monthlyView: 'Vista mensual',
  addTask: 'Nueva tarea',
  navigation: {
    prevMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
  },
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
    dayAriaLabel: 'Día {day}',
    todayBadge: 'hoy',
    viewSwitcher: {
      day: 'Día',
      week: 'Semana',
      month: 'Mes',
      year: 'Año',
    },
  },
  panel: {
    todayPrefix: 'Hoy',
    monthAbbreviations: {
      january: 'ene',
      february: 'feb',
      march: 'mar',
      april: 'abr',
      may: 'may',
      june: 'jun',
      july: 'jul',
      august: 'ago',
      september: 'sep',
      october: 'oct',
      november: 'nov',
      december: 'dic',
    },
  },
} satisfies WidenStringLiterals<CalendarDict>;

export default dict;
