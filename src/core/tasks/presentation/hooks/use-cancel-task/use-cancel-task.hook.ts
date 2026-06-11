import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CancelTaskUseCase } from '@/core/tasks/application/use-cases/cancel-task/cancel-task.use-case';
import { tasksGqlRepository } from '@/core/tasks/infrastructure/repositories/graphql/tasks.gql.repository';

const cancelTaskUseCase = new CancelTaskUseCase(tasksGqlRepository);

export function useCancelTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => cancelTaskUseCase.execute(taskId),
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
    },
  });
}
