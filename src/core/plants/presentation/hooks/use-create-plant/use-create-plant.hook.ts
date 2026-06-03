import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreatePlantUseCase } from '@/core/plants/application/use-cases/create-plant/create-plant.use-case';
import { plantsGqlRepository } from '@/core/plants/infrastructure/repositories/graphql/plants.gql.repository';
import type { CreatePlantInput } from '@/core/plants/application/ports/plants.repository.port';

const createPlantUseCase = new CreatePlantUseCase(plantsGqlRepository);

export function useCreatePlant(spaceId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlantInput) => createPlantUseCase.execute(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plants', spaceId] }),
  });
}
