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
} satisfies WidenStringLiterals<TasksDict>;

export default dict;
