import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateTemplateUseCase } from '@/core/tasks/application/use-cases/update-template/update-template.use-case';
import { tasksGqlRepository } from '@/core/tasks/infrastructure/repositories/graphql/tasks.gql.repository';
import type { UpdateTemplateInput } from '@/core/tasks/application/interfaces/tasks.interfaces';

const updateTemplateUseCase = new UpdateTemplateUseCase(tasksGqlRepository);

export function useUpdateTaskTemplate(spaceId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTemplateInput) => updateTemplateUseCase.execute(input),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: ['task-templates', spaceId] });
      queryClient.invalidateQueries({ queryKey: ['task-template', input.id] });
    },
  });
}
