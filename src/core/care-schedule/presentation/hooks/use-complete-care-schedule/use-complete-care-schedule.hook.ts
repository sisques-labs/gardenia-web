import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CompleteCareScheduleUseCase } from '@/core/care-schedule/application/use-cases/complete-care-schedule/complete-care-schedule.use-case';
import { careScheduleGqlRepository } from '@/core/care-schedule/infrastructure/repositories/graphql/care-schedule.gql.repository';

const completeCareScheduleUseCase = new CompleteCareScheduleUseCase(careScheduleGqlRepository);

export function useCompleteCareSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completedAt }: { id: string; completedAt?: string }) =>
      completeCareScheduleUseCase.execute(id, completedAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-schedules'] });
    },
  });
}
