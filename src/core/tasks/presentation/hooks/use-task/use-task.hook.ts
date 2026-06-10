import { useQuery } from '@tanstack/react-query';
import { GetTaskUseCase } from '@/core/tasks/application/use-cases/get-task/get-task.use-case';
import { tasksGqlRepository } from '@/core/tasks/infrastructure/repositories/graphql/tasks.gql.repository';

const getTaskUseCase = new GetTaskUseCase(tasksGqlRepository);

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => getTaskUseCase.execute(id!),
    enabled: !!id,
  });
}
