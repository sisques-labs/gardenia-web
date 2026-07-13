import type { Notification } from '@/core/notifications/domain/types/notification.interface';

export interface NotificationsFindByCriteriaResponse {
  notificationsFindByCriteria: { items: Notification[] };
}
