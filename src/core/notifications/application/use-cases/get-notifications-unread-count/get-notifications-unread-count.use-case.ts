import type { INotificationRepository } from '@/core/notifications/application/ports/notification.repository.port';

export class GetNotificationsUnreadCountUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(): Promise<number> {
    return this.notificationRepository.unreadCount();
  }
}
