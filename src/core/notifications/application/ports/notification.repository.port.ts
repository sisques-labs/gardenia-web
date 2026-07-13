import type { Notification } from '@/core/notifications/domain/types/notification.interface';
import type { NotificationFilters } from '@/core/notifications/application/interfaces/notification-filters.interface';

export interface INotificationRepository {
  findByCriteria(filters?: NotificationFilters): Promise<Notification[]>;
  unreadCount(): Promise<number>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
}
