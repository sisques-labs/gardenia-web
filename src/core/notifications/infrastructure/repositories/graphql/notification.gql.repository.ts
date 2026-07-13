import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import type { INotificationRepository } from '@/core/notifications/application/ports/notification.repository.port';
import type { NotificationFilters } from '@/core/notifications/application/interfaces/notification-filters.interface';
import type { Notification } from '@/core/notifications/domain/types/notification.interface';
import { NotificationQueryableField } from '@/core/notifications/domain/enums/notification-queryable-field.enum';
import { FilterOperator } from '@/shared/domain/enums/filter-operator.enum';
import type { Filter } from '@/shared/domain/interfaces/filter.interface';
import { NOTIFICATIONS_FIND_BY_CRITERIA } from './queries/notifications-find-by-criteria.query';
import { NOTIFICATIONS_UNREAD_COUNT } from './queries/notifications-unread-count.query';
import { NOTIFICATION_MARK_READ } from './mutations/notification-mark-read.mutation';
import { NOTIFICATIONS_MARK_ALL_READ } from './mutations/notifications-mark-all-read.mutation';
import type { NotificationsFindByCriteriaResponse } from './responses/notifications-find-by-criteria.response';
import type { NotificationsUnreadCountResponse } from './responses/notifications-unread-count.response';
import type { NotificationMarkReadResponse } from './responses/notification-mark-read.response';
import type { NotificationsMarkAllReadResponse } from './responses/notifications-mark-all-read.response';

// Filters use the API's typed Criteria enum (NotificationQueryableField) and JSON-scalar
// values — this mapping is confined to this repository so callers keep the ergonomic
// NotificationFilters shape.
function toApiFilters(filters?: NotificationFilters) {
  if (!filters) return undefined;

  const apiFilters: Filter<NotificationQueryableField>[] = [];
  if (filters.status) {
    apiFilters.push({ field: NotificationQueryableField.STATUS, operator: FilterOperator.EQUALS, value: filters.status });
  }
  if (filters.type) {
    apiFilters.push({ field: NotificationQueryableField.TYPE, operator: FilterOperator.EQUALS, value: filters.type });
  }

  return apiFilters.length ? { filters: apiFilters } : undefined;
}

export class NotificationGqlRepository implements INotificationRepository {
  async findByCriteria(filters?: NotificationFilters): Promise<Notification[]> {
    const res = await apolloClient.query<NotificationsFindByCriteriaResponse>({
      query: NOTIFICATIONS_FIND_BY_CRITERIA,
      variables: { input: toApiFilters(filters) },
      fetchPolicy: 'network-only',
    });
    return res.data?.notificationsFindByCriteria?.items ?? [];
  }

  async unreadCount(): Promise<number> {
    const res = await apolloClient.query<NotificationsUnreadCountResponse>({
      query: NOTIFICATIONS_UNREAD_COUNT,
      fetchPolicy: 'network-only',
    });
    return res.data?.notificationsUnreadCount ?? 0;
  }

  async markRead(id: string): Promise<void> {
    await apolloClient.mutate<NotificationMarkReadResponse>({
      mutation: NOTIFICATION_MARK_READ,
      variables: { id },
    });
  }

  async markAllRead(): Promise<void> {
    await apolloClient.mutate<NotificationsMarkAllReadResponse>({
      mutation: NOTIFICATIONS_MARK_ALL_READ,
    });
  }
}

export const notificationGqlRepository = new NotificationGqlRepository();
