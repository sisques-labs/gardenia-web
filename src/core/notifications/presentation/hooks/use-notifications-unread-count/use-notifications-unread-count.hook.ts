import { useQuery } from '@tanstack/react-query';
import { GetNotificationsUnreadCountUseCase } from '@/core/notifications/application/use-cases/get-notifications-unread-count/get-notifications-unread-count.use-case';
import { notificationGqlRepository } from '@/core/notifications/infrastructure/repositories/graphql/notification.gql.repository';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

// Safety-net polling only — SSE (NotificationsProvider) is the primary freshness path.
const FALLBACK_POLL_INTERVAL_MS = 5 * 60_000;

const getNotificationsUnreadCountUseCase = new GetNotificationsUnreadCountUseCase(notificationGqlRepository);

export function useNotificationsUnreadCount() {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);

  const { data } = useQuery({
    queryKey: ['notifications-unread-count', spaceId],
    queryFn: () => getNotificationsUnreadCountUseCase.execute(),
    enabled: !!spaceId,
    refetchInterval: FALLBACK_POLL_INTERVAL_MS,
  });

  return { unreadCount: data ?? 0 };
}
