import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetNotificationsUnreadCountUseCase } from './get-notifications-unread-count.use-case';
import type { INotificationRepository } from '@/core/notifications/application/ports/notification.repository.port';

const mockRepository: INotificationRepository = {
  findByCriteria: vi.fn(),
  unreadCount: vi.fn(),
  markRead: vi.fn(),
  markAllRead: vi.fn(),
};

describe('GetNotificationsUnreadCountUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repo unreadCount and resolves the count', async () => {
    vi.mocked(mockRepository.unreadCount).mockResolvedValue(3);
    const useCase = new GetNotificationsUnreadCountUseCase(mockRepository);

    const result = await useCase.execute();

    expect(result).toBe(3);
    expect(mockRepository.unreadCount).toHaveBeenCalled();
  });
});
