import type { CareScheduleDict } from './en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';

type CareScheduleDictTranslated = WidenStringLiterals<CareScheduleDict>;

const dict = {
  row: {
    activityTypes: {
      WATERING: 'Riego',
      FERTILIZING: 'Abonado',
      PRUNING: 'Poda',
      REPOTTING: 'Trasplante de maceta',
      TRANSPLANTING: 'Trasplante',
      PEST_TREATMENT: 'Tratamiento de plagas',
      MISTING: 'Nebulización',
      ROTATION: 'Rotación',
      OTHER: 'Otro',
    },
    dueLabel: 'Vence',
    overdueLabel: 'Vencida',
    complete: 'Completar',
    edit: 'Editar',
    delete: 'Eliminar',
  },
  form: {
    title: 'Nueva tarea',
    editTitle: 'Editar tarea',
    plant: 'Planta',
    plantPlaceholder: 'Selecciona una planta',
    activityType: 'Actividad',
    nextDueAt: 'Fecha de vencimiento',
    recurring: 'Se repite',
    intervalDays: 'Cada (días)',
    quantity: 'Cantidad',
    unit: 'Unidad',
    notes: 'Notas',
    submit: 'Guardar',
    submitting: 'Guardando...',
    cancel: 'Cancelar',
  },
  units: {
    ML: 'ml',
    L: 'l',
    G: 'g',
    KG: 'kg',
  },
  panel: {
    empty: 'No hay tareas pendientes para este día.',
  },
  tab: {
    empty: 'Todavía no hay planes de cuidado para esta planta.',
    newTask: 'Nueva tarea',
  },
  errors: {
    loadFailed: 'No se pudieron cargar los planes de cuidado. Inténtalo de nuevo.',
    saveFailed: 'No se pudo guardar el plan de cuidado. Inténtalo de nuevo.',
    completeFailed: 'No se pudo completar el plan de cuidado. Inténtalo de nuevo.',
    deleteFailed: 'No se pudo eliminar el plan de cuidado. Inténtalo de nuevo.',
  },
} as const satisfies CareScheduleDictTranslated;

export default dict;
