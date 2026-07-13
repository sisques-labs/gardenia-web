import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetNotificationsUseCase } from './get-notifications.use-case';
import type { INotificationRepository } from '@/core/notifications/application/ports/notification.repository.port';

const mockRepository: INotificationRepository = {
  findByCriteria: vi.fn(),
  unreadCount: vi.fn(),
  markRead: vi.fn(),
  markAllRead: vi.fn(),
};

describe('GetNotificationsUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repo findByCriteria with the given filters', async () => {
    vi.mocked(mockRepository.findByCriteria).mockResolvedValue([]);
    const useCase = new GetNotificationsUseCase(mockRepository);

    await useCase.execute({ status: 'UNREAD' });

    expect(mockRepository.findByCriteria).toHaveBeenCalledWith({ status: 'UNREAD' });
  });

  it('works with no filters', async () => {
    vi.mocked(mockRepository.findByCriteria).mockResolvedValue([]);
    const useCase = new GetNotificationsUseCase(mockRepository);

    await useCase.execute();

    expect(mockRepository.findByCriteria).toHaveBeenCalledWith(undefined);
  });
});
