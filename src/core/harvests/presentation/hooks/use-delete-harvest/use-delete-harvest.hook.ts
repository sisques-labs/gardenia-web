import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteHarvestUseCase } from '@/core/harvests/application/use-cases/delete-harvest/delete-harvest.use-case';
import { HarvestsGqlRepository } from '@/core/harvests/infrastructure/repositories/graphql/harvests.gql.repository';

const deleteHarvestUseCase = new DeleteHarvestUseCase(new HarvestsGqlRepository());

export function useDeleteHarvest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHarvestUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['harvests'] });
    },
  });
}
