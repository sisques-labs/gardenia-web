import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteTemplateUseCase } from '@/core/tasks/application/use-cases/delete-template/delete-template.use-case';
import { tasksGqlRepository } from '@/core/tasks/infrastructure/repositories/graphql/tasks.gql.repository';

const deleteTemplateUseCase = new DeleteTemplateUseCase(tasksGqlRepository);

export function useDeleteTaskTemplate(spaceId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => deleteTemplateUseCase.execute(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-templates', spaceId] });
    },
  });
}
