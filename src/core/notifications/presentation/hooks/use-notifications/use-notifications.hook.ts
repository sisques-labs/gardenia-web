import { useQuery } from '@tanstack/react-query';
import { GetNotificationsUseCase } from '@/core/notifications/application/use-cases/get-notifications/get-notifications.use-case';
import { notificationGqlRepository } from '@/core/notifications/infrastructure/repositories/graphql/notification.gql.repository';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import type { NotificationFilters } from '@/core/notifications/application/interfaces/notification-filters.interface';

const getNotificationsUseCase = new GetNotificationsUseCase(notificationGqlRepository);

export function useNotifications(filters: NotificationFilters = {}) {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', spaceId, filters],
    queryFn: () => getNotificationsUseCase.execute(filters),
    enabled: !!spaceId,
  });

  return { notifications: data ?? [], isLoading, error };
}
