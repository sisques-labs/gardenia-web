import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdatePlantUseCase } from '@/core/plants/application/use-cases/update-plant/update-plant.use-case';
import { plantsGqlRepository } from '@/core/plants/infrastructure/repositories/graphql/plants.gql.repository';
import type { UpdatePlantInput } from '@/core/plants/application/interfaces/update-plant-input.interface';

const updatePlantUseCase = new UpdatePlantUseCase(plantsGqlRepository);

export function useUpdatePlant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePlantInput) => updatePlantUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      queryClient.invalidateQueries({ queryKey: ['plant'] });
      queryClient.invalidateQueries({ queryKey: ['planting-spots'] });
      queryClient.invalidateQueries({ queryKey: ['planting-spot'] });
    },
  });
}
