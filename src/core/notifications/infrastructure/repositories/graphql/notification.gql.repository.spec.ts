import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentNode } from '@apollo/client';

vi.mock('@/shared/infrastructure/http/apollo.client', () => ({
  apolloClient: {
    query: vi.fn(),
    mutate: vi.fn(),
  },
}));

import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import { NotificationGqlRepository } from './notification.gql.repository';
import { NOTIFICATIONS_FIND_BY_CRITERIA } from './queries/notifications-find-by-criteria.query';
import { NOTIFICATIONS_UNREAD_COUNT } from './queries/notifications-unread-count.query';
import { NOTIFICATION_MARK_READ } from './mutations/notification-mark-read.mutation';
import { NOTIFICATIONS_MARK_ALL_READ } from './mutations/notifications-mark-all-read.mutation';
import type { Notification } from '@/core/notifications/domain/types/notification.interface';

const mockNotification: Notification = {
  id: 'notif-1',
  type: 'CARE_SCHEDULE_DUE',
  referenceType: 'CARE_SCHEDULE',
  referenceId: 'cs-1',
  payload: { plantName: 'Ficus' },
  status: 'UNREAD',
  readAt: null,
  resolvedAt: null,
  userId: 'user-1',
  spaceId: 'space-1',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-01T00:00:00.000Z',
};

describe('NotificationGqlRepository', () => {
  let repository: NotificationGqlRepository;

  beforeEach(() => {
    repository = new NotificationGqlRepository();
    vi.clearAllMocks();
  });

  describe('GQL document constants', () => {
    it.each([
      ['NOTIFICATIONS_FIND_BY_CRITERIA', NOTIFICATIONS_FIND_BY_CRITERIA],
      ['NOTIFICATIONS_UNREAD_COUNT', NOTIFICATIONS_UNREAD_COUNT],
      ['NOTIFICATION_MARK_READ', NOTIFICATION_MARK_READ],
      ['NOTIFICATIONS_MARK_ALL_READ', NOTIFICATIONS_MARK_ALL_READ],
    ])('%s is a valid GQL document', (_name, doc) => {
      expect(doc).toBeDefined();
      expect((doc as DocumentNode).kind).toBe('Document');
    });
  });

  describe('findByCriteria()', () => {
    it('calls apolloClient.query with no filters when none are given', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { notificationsFindByCriteria: { items: [mockNotification] } },
      } as never);

      const result = await repository.findByCriteria();

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: NOTIFICATIONS_FIND_BY_CRITERIA,
        variables: { input: undefined },
        fetchPolicy: 'network-only',
      });
      expect(result).toEqual([mockNotification]);
    });

    it('translates status to a STATUS EQUALS filter', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { notificationsFindByCriteria: { items: [] } },
      } as never);

      await repository.findByCriteria({ status: 'UNREAD' });

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: NOTIFICATIONS_FIND_BY_CRITERIA,
        variables: {
          input: { filters: [{ field: 'STATUS', operator: 'EQUALS', value: 'UNREAD' }] },
        },
        fetchPolicy: 'network-only',
      });
    });

    it('translates type to a TYPE EQUALS filter', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { notificationsFindByCriteria: { items: [] } },
      } as never);

      await repository.findByCriteria({ type: 'INVENTORY_LOW_STOCK' });

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: NOTIFICATIONS_FIND_BY_CRITERIA,
        variables: {
          input: { filters: [{ field: 'TYPE', operator: 'EQUALS', value: 'INVENTORY_LOW_STOCK' }] },
        },
        fetchPolicy: 'network-only',
      });
    });

    it('combines status and type filters', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { notificationsFindByCriteria: { items: [] } },
      } as never);

      await repository.findByCriteria({ status: 'READ', type: 'CARE_SCHEDULE_DUE' });

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: NOTIFICATIONS_FIND_BY_CRITERIA,
        variables: {
          input: {
            filters: [
              { field: 'STATUS', operator: 'EQUALS', value: 'READ' },
              { field: 'TYPE', operator: 'EQUALS', value: 'CARE_SCHEDULE_DUE' },
            ],
          },
        },
        fetchPolicy: 'network-only',
      });
    });

    it('returns empty array when items is empty', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { notificationsFindByCriteria: { items: [] } },
      } as never);

      const result = await repository.findByCriteria();
      expect(result).toEqual([]);
    });
  });

  describe('unreadCount()', () => {
    it('calls apolloClient.query with NOTIFICATIONS_UNREAD_COUNT and returns the count', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { notificationsUnreadCount: 5 },
      } as never);

      const result = await repository.unreadCount();

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: NOTIFICATIONS_UNREAD_COUNT,
        fetchPolicy: 'network-only',
      });
      expect(result).toBe(5);
    });
  });

  describe('markRead()', () => {
    it('calls apolloClient.mutate with NOTIFICATION_MARK_READ and a bare id variable', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { notificationMarkRead: { success: true, message: 'Notification marked as read' } },
      } as never);

      const result = await repository.markRead('notif-1');

      expect(result).toBeUndefined();
      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: NOTIFICATION_MARK_READ,
        variables: { id: 'notif-1' },
      });
    });
  });

  describe('markAllRead()', () => {
    it('calls apolloClient.mutate with NOTIFICATIONS_MARK_ALL_READ', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { notificationsMarkAllRead: { success: true, message: 'All notifications marked as read' } },
      } as never);

      const result = await repository.markAllRead();

      expect(result).toBeUndefined();
      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: NOTIFICATIONS_MARK_ALL_READ,
      });
    });
  });
});
