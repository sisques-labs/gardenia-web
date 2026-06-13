import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateHarvestUseCase } from '@/core/harvests/application/use-cases/create-harvest/create-harvest.use-case';
import { HarvestsGqlRepository } from '@/core/harvests/infrastructure/repositories/graphql/harvests.gql.repository';
import type { CreateHarvestInput } from '@/core/harvests/application/interfaces/create-harvest-input.interface';

const createHarvestUseCase = new CreateHarvestUseCase(new HarvestsGqlRepository());

export function useCreateHarvest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateHarvestInput) => createHarvestUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['harvests'] });
    },
  });
}
