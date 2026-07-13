import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarkAllNotificationsReadUseCase } from './mark-all-notifications-read.use-case';
import type { INotificationRepository } from '@/core/notifications/application/ports/notification.repository.port';

const mockRepository: INotificationRepository = {
  findByCriteria: vi.fn(),
  unreadCount: vi.fn(),
  markRead: vi.fn(),
  markAllRead: vi.fn(),
};

describe('MarkAllNotificationsReadUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repo markAllRead', async () => {
    vi.mocked(mockRepository.markAllRead).mockResolvedValue(undefined);
    const useCase = new MarkAllNotificationsReadUseCase(mockRepository);

    await useCase.execute();

    expect(mockRepository.markAllRead).toHaveBeenCalled();
  });
});
