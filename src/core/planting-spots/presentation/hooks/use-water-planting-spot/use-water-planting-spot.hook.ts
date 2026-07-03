import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WaterPlantingSpotUseCase } from '@/core/planting-spots/application/use-cases/water-planting-spot/water-planting-spot.use-case';
import { PlantingSpotsGqlRepository } from '@/core/planting-spots/infrastructure/repositories/graphql/planting-spots.gql.repository';

const waterPlantingSpotUseCase = new WaterPlantingSpotUseCase(new PlantingSpotsGqlRepository());

export function useWaterPlantingSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, performedAt }: { id: string; performedAt?: string }) =>
      waterPlantingSpotUseCase.execute(id, performedAt),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['planting-spot', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['care-schedules'] });
    },
  });
}
