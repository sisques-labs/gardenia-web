import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateSpaceUseCase } from '@/core/spaces/application/use-cases/create-space/create-space.use-case';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';
import { spacesGqlRepository as spacesHttpRepository } from '@/core/spaces/infrastructure/repositories/graphql/spaces.gql.repository';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

const createSpaceUseCase = new CreateSpaceUseCase(spacesHttpRepository);

export function useCreateSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createSpaceUseCase.execute(name),
    onSuccess: (space) => {
      queryClient.setQueryData<Space[]>(['spaces'], (current = []) =>
        current.some((s) => s.id === space.id) ? current : [...current, space],
      );
      const current = useSpacesStore.getState().availableSpaces;
      useSpacesStore.getState().setSpaces([...current, space]);
      useSpacesStore.getState().setActiveSpace(space.id);
    },
  });
}
