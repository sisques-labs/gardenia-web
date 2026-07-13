import type { INotificationRepository } from '@/core/notifications/application/ports/notification.repository.port';

export class MarkAllNotificationsReadUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(): Promise<void> {
    return this.notificationRepository.markAllRead();
  }
}
