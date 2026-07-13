import type { NotificationsDict } from './en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';

type NotificationsDictTranslated = WidenStringLiterals<NotificationsDict>;

const dict = {
  messages: {
    careScheduleDue: '{activity} pendiente',
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
    inventoryLowStock: '{itemName} tiene poco stock (quedan {quantity} {unit})',
    inventoryExpiringSoon: '{itemName} caduca pronto',
    fallback: 'Notificación',
  },
  bell: {
    empty: 'No tienes nada pendiente.',
    markAllRead: 'Marcar todas como leídas',
    viewAll: 'Ver todas',
  },
  screen: {
    title: 'Notificaciones',
    tabs: {
      unread: 'No leídas',
      all: 'Todas',
    },
    empty: 'No hay notificaciones.',
    markAllRead: 'Marcar todas como leídas',
  },
} as const satisfies NotificationsDictTranslated;

export default dict;
