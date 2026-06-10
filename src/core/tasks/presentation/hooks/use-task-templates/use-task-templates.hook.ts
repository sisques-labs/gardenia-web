import { useQuery } from '@tanstack/react-query';
import { ListTemplatesUseCase } from '@/core/tasks/application/use-cases/list-templates/list-templates.use-case';
import { tasksGqlRepository } from '@/core/tasks/infrastructure/repositories/graphql/tasks.gql.repository';

const listTemplatesUseCase = new ListTemplatesUseCase(tasksGqlRepository);

export interface UseTaskTemplatesInput {
  spaceId: string | null;
  page: number;
  pageSize: number;
}

export function useTaskTemplates({ spaceId, page, pageSize }: UseTaskTemplatesInput) {
  return useQuery({
    queryKey: ['task-templates', spaceId, page, pageSize],
    queryFn: () => listTemplatesUseCase.execute({ spaceId: spaceId!, page, pageSize }),
    enabled: !!spaceId,
  });
}
