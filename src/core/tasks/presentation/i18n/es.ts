import type { TasksDict } from './en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';

const dict = {
  nav: 'Tareas',
  list: {
    title: 'Tareas',
    empty: 'Todavía no hay tareas',
    columns: {
      name: 'Nombre',
      status: 'Estado',
      scheduledAt: 'Fecha programada',
    },
  },
  detail: {
    title: 'Detalle de tarea',
    breadcrumbList: 'Tareas',
    payload: 'Carga útil',
    runs: 'Historial de ejecuciones',
    runsEmpty: 'Todavía no hay ejecuciones',
    columns: {
      status: 'Estado',
      startedAt: 'Iniciado',
      completedAt: 'Completado',
      error: 'Error',
    },
  },
  schedule: {
    title: 'Programar tarea',
    templateLabel: 'Plantilla',
    templatePlaceholder: 'Seleccionar una plantilla...',
    nameLabel: 'Nombre',
    namePlaceholder: 'Nombre de la tarea',
    scheduledAtLabel: 'Fecha programada',
    payloadLabel: 'Payload (JSON)',
    payloadPlaceholder: '{}',
    submitBtn: 'Programar',
    submittingBtn: 'Programando...',
    cancelBtn: 'Cancelar',
    cancelTask: 'Cancelar tarea',
    cancelTaskDescription: '¿Estás seguro de que querés cancelar esta tarea? Esta acción no se puede deshacer.',
    confirmCancelLabel: 'Sí, cancelar tarea',
    keepTaskLabel: 'Mantener tarea',
    validation: {
      templateIdRequired: 'La plantilla es obligatoria',
      templateIdInvalid: 'Plantilla inválida',
      nameRequired: 'El nombre es obligatorio',
      nameMax: 'El nombre debe tener 100 caracteres o menos',
      scheduledAtRequired: 'La fecha programada es obligatoria',
      scheduledAtInvalid: 'Fecha inválida',
      payloadInvalidJson: 'El payload debe ser JSON válido',
    },
  },
} satisfies WidenStringLiterals<TasksDict>;

export default dict;
