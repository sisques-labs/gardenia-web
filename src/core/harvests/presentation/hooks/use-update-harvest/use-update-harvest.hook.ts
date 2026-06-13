import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateHarvestUseCase } from '@/core/harvests/application/use-cases/update-harvest/update-harvest.use-case';
import { HarvestsGqlRepository } from '@/core/harvests/infrastructure/repositories/graphql/harvests.gql.repository';
import type { UpdateHarvestInput } from '@/core/harvests/application/interfaces/update-harvest-input.interface';

const updateHarvestUseCase = new UpdateHarvestUseCase(new HarvestsGqlRepository());

export function useUpdateHarvest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateHarvestInput) => updateHarvestUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['harvests'] });
    },
  });
}
