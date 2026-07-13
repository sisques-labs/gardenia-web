import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MarkNotificationReadUseCase } from '@/core/notifications/application/use-cases/mark-notification-read/mark-notification-read.use-case';
import { notificationGqlRepository } from '@/core/notifications/infrastructure/repositories/graphql/notification.gql.repository';

const markNotificationReadUseCase = new MarkNotificationReadUseCase(notificationGqlRepository);

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationReadUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}
