import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreatePlantFromIdentificationUseCase } from '@/core/plant-identification/application/use-cases/create-plant-from-identification/create-plant-from-identification.use-case';
import { plantIdentificationGqlRepository } from '@/core/plant-identification/infrastructure/repositories/graphql/plant-identification.gql.repository';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import type { CreatePlantFromIdentificationInput } from '@/core/plant-identification/application/interfaces/create-plant-from-identification-input.interface';

const createPlantFromIdentificationUseCase = new CreatePlantFromIdentificationUseCase(
  plantIdentificationGqlRepository,
);

export function useCreatePlantFromIdentification() {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePlantFromIdentificationInput) =>
      createPlantFromIdentificationUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants', spaceId] });
      queryClient.invalidateQueries({ queryKey: ['plant-identifications', spaceId] });
    },
  });
}
