import type { INotificationRepository } from '@/core/notifications/application/ports/notification.repository.port';

export class MarkNotificationReadUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(id: string): Promise<void> {
    return this.notificationRepository.markRead(id);
  }
}
