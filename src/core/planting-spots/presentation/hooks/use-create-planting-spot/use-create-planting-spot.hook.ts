import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreatePlantingSpotUseCase } from '@/core/planting-spots/application/use-cases/create-planting-spot/create-planting-spot.use-case';
import { PlantingSpotsGqlRepository } from '@/core/planting-spots/infrastructure/repositories/graphql/planting-spots.gql.repository';
import type { CreatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/create-planting-spot-input.interface';

const createPlantingSpotUseCase = new CreatePlantingSpotUseCase(new PlantingSpotsGqlRepository());

export function useCreatePlantingSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePlantingSpotInput) => createPlantingSpotUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planting-spots'] });
    },
  });
}
