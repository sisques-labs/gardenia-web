import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdatePlantingSpotUseCase } from '@/core/planting-spots/application/use-cases/update-planting-spot/update-planting-spot.use-case';
import { PlantingSpotsGqlRepository } from '@/core/planting-spots/infrastructure/repositories/graphql/planting-spots.gql.repository';
import type { UpdatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/update-planting-spot-input.interface';

const updatePlantingSpotUseCase = new UpdatePlantingSpotUseCase(new PlantingSpotsGqlRepository());

export function useUpdatePlantingSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePlantingSpotInput) => updatePlantingSpotUseCase.execute(input),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: ['planting-spots'] });
      queryClient.invalidateQueries({ queryKey: ['planting-spot', input.id] });
    },
  });
}
