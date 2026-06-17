import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeletePlantUseCase } from '@/core/plants/application/use-cases/delete-plant/delete-plant.use-case';
import { PlantsGqlRepository } from '@/core/plants/infrastructure/repositories/graphql/plants.gql.repository';

const deletePlantUseCase = new DeletePlantUseCase(new PlantsGqlRepository());

export function useDeletePlant(spaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePlantUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants', spaceId] });
    },
  });
}
