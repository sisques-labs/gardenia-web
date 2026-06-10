import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ScheduleTaskUseCase } from '@/core/tasks/application/use-cases/schedule-task/schedule-task.use-case';
import { tasksGqlRepository } from '@/core/tasks/infrastructure/repositories/graphql/tasks.gql.repository';
import type { ScheduleTaskInput } from '@/core/tasks/application/interfaces/tasks.interfaces';

const scheduleTaskUseCase = new ScheduleTaskUseCase(tasksGqlRepository);

export function useScheduleTask(spaceId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ScheduleTaskInput) => scheduleTaskUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', spaceId] });
    },
  });
}
