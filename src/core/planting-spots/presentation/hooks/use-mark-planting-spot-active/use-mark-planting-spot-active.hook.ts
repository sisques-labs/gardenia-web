import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MarkPlantingSpotActiveUseCase } from '@/core/planting-spots/application/use-cases/mark-planting-spot-active/mark-planting-spot-active.use-case';
import { PlantingSpotsGqlRepository } from '@/core/planting-spots/infrastructure/repositories/graphql/planting-spots.gql.repository';

const markPlantingSpotActiveUseCase = new MarkPlantingSpotActiveUseCase(new PlantingSpotsGqlRepository());

export function useMarkPlantingSpotActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markPlantingSpotActiveUseCase.execute(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['planting-spots'] });
      queryClient.invalidateQueries({ queryKey: ['planting-spot', id] });
    },
  });
}
