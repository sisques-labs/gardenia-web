import { useQuery } from '@tanstack/react-query';
import { ListTaskRunsUseCase } from '@/core/tasks/application/use-cases/list-task-runs/list-task-runs.use-case';
import { tasksGqlRepository } from '@/core/tasks/infrastructure/repositories/graphql/tasks.gql.repository';

const listTaskRunsUseCase = new ListTaskRunsUseCase(tasksGqlRepository);

export interface UseTaskRunsInput {
  taskId: string | undefined;
  page: number;
  pageSize: number;
}

export function useTaskRuns({ taskId, page, pageSize }: UseTaskRunsInput) {
  return useQuery({
    queryKey: ['task-runs', taskId, page, pageSize],
    queryFn: () => listTaskRunsUseCase.execute({ taskId: taskId!, page, pageSize }),
    enabled: !!taskId,
  });
}
