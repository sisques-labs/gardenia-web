import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateTemplateUseCase } from '@/core/tasks/application/use-cases/create-template/create-template.use-case';
import { tasksGqlRepository } from '@/core/tasks/infrastructure/repositories/graphql/tasks.gql.repository';
import type { CreateTemplateInput } from '@/core/tasks/application/interfaces/tasks.interfaces';

const createTemplateUseCase = new CreateTemplateUseCase(tasksGqlRepository);

export function useCreateTaskTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTemplateInput) => createTemplateUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-templates'] });
    },
  });
}
