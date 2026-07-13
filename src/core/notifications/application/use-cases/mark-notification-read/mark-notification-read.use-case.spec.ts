import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarkNotificationReadUseCase } from './mark-notification-read.use-case';
import type { INotificationRepository } from '@/core/notifications/application/ports/notification.repository.port';

const mockRepository: INotificationRepository = {
  findByCriteria: vi.fn(),
  unreadCount: vi.fn(),
  markRead: vi.fn(),
  markAllRead: vi.fn(),
};

describe('MarkNotificationReadUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repo markRead with the given id', async () => {
    vi.mocked(mockRepository.markRead).mockResolvedValue(undefined);
    const useCase = new MarkNotificationReadUseCase(mockRepository);

    await useCase.execute('notification-1');

    expect(mockRepository.markRead).toHaveBeenCalledWith('notification-1');
  });
});
