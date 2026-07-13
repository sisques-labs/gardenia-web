import type { NotificationStatus, NotificationType } from '@/core/notifications/domain/types/notification.interface';

export interface NotificationFilters {
  status?: NotificationStatus;
  type?: NotificationType;
}
