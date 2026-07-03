import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MarkPlantingSpotFallowUseCase } from '@/core/planting-spots/application/use-cases/mark-planting-spot-fallow/mark-planting-spot-fallow.use-case';
import { PlantingSpotsGqlRepository } from '@/core/planting-spots/infrastructure/repositories/graphql/planting-spots.gql.repository';

const markPlantingSpotFallowUseCase = new MarkPlantingSpotFallowUseCase(new PlantingSpotsGqlRepository());

export function useMarkPlantingSpotFallow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markPlantingSpotFallowUseCase.execute(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['planting-spots'] });
      queryClient.invalidateQueries({ queryKey: ['planting-spot', id] });
    },
  });
}
