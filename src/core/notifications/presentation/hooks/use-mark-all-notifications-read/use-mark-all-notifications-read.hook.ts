import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MarkAllNotificationsReadUseCase } from '@/core/notifications/application/use-cases/mark-all-notifications-read/mark-all-notifications-read.use-case';
import { notificationGqlRepository } from '@/core/notifications/infrastructure/repositories/graphql/notification.gql.repository';

const markAllNotificationsReadUseCase = new MarkAllNotificationsReadUseCase(notificationGqlRepository);

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsReadUseCase.execute(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}
