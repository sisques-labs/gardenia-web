import { useQuery } from '@tanstack/react-query';
import { GetTemplateUseCase } from '@/core/tasks/application/use-cases/get-template/get-template.use-case';
import { tasksGqlRepository } from '@/core/tasks/infrastructure/repositories/graphql/tasks.gql.repository';

const getTemplateUseCase = new GetTemplateUseCase(tasksGqlRepository);

export function useTaskTemplate(templateId: string | null) {
  return useQuery({
    queryKey: ['task-template', templateId],
    queryFn: () => getTemplateUseCase.execute(templateId!),
    enabled: !!templateId,
  });
}
