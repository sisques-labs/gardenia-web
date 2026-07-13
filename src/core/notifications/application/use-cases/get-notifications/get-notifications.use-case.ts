import type { INotificationRepository } from '@/core/notifications/application/ports/notification.repository.port';
import type { NotificationFilters } from '@/core/notifications/application/interfaces/notification-filters.interface';
import type { Notification } from '@/core/notifications/domain/types/notification.interface';

export class GetNotificationsUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(filters?: NotificationFilters): Promise<Notification[]> {
    return this.notificationRepository.findByCriteria(filters);
  }
}
