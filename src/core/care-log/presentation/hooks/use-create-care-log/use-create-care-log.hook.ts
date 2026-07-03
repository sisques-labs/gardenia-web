import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateCareLogUseCase } from '@/core/care-log/application/use-cases/create-care-log/create-care-log.use-case';
import { careLogGqlRepository } from '@/core/care-log/infrastructure/repositories/graphql/care-log.gql.repository';
import type { CreateCareLogInput } from '@/core/care-log/application/interfaces/create-care-log-input.interface';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

const createCareLogUseCase = new CreateCareLogUseCase(careLogGqlRepository);

export function useCreateCareLog(plantId: string) {
  const queryClient = useQueryClient();
  const spaceId = useSpacesStore((s) => s.currentSpaceId);

  return useMutation({
    mutationFn: (input: CreateCareLogInput) => createCareLogUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-log', spaceId, plantId] });
    },
  });
}
