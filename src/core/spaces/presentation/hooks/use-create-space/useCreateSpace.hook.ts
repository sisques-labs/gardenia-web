import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateSpaceUseCase } from '@/core/spaces/application/use-cases/create-space/create-space.use-case';
import { spacesGqlRepository as spacesHttpRepository } from '@/core/spaces/infrastructure/repositories/graphql/spaces.gql.repository';

const createSpaceUseCase = new CreateSpaceUseCase(spacesHttpRepository);

export function useCreateSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createSpaceUseCase.execute(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spaces'] }),
  });
}
