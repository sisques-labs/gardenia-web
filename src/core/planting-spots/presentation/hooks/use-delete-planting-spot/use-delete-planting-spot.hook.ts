import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeletePlantingSpotUseCase } from '@/core/planting-spots/application/use-cases/delete-planting-spot/delete-planting-spot.use-case';
import { PlantingSpotsGqlRepository } from '@/core/planting-spots/infrastructure/repositories/graphql/planting-spots.gql.repository';

const deletePlantingSpotUseCase = new DeletePlantingSpotUseCase(new PlantingSpotsGqlRepository());

export function useDeletePlantingSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePlantingSpotUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planting-spots'] });
    },
  });
}
