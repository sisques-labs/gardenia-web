import { useQuery } from '@tanstack/react-query';
import { ListTasksUseCase } from '@/core/tasks/application/use-cases/list-tasks/list-tasks.use-case';
import { tasksGqlRepository } from '@/core/tasks/infrastructure/repositories/graphql/tasks.gql.repository';
import type { TaskStatus } from '@/core/tasks/domain/interfaces/task-status.enum';

const listTasksUseCase = new ListTasksUseCase(tasksGqlRepository);

export interface UseTasksInput {
  spaceId: string | null;
  page: number;
  pageSize: number;
  status?: TaskStatus;
}

export function useTasks({ spaceId, page, pageSize, status }: UseTasksInput) {
  return useQuery({
    queryKey: ['tasks', spaceId, page, pageSize, status],
    queryFn: () => listTasksUseCase.execute({ spaceId: spaceId!, page, pageSize, status }),
    enabled: !!spaceId,
  });
}
