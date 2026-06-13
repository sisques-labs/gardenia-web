import { useQuery } from '@tanstack/react-query';
import { GetHarvestsUseCase } from '@/core/harvests/application/use-cases/get-harvests/get-harvests.use-case';
import { HarvestsGqlRepository } from '@/core/harvests/infrastructure/repositories/graphql/harvests.gql.repository';

const harvestsUseCase = new GetHarvestsUseCase(new HarvestsGqlRepository());

export function useHarvests() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['harvests'],
    queryFn: () => harvestsUseCase.execute(),
  });

  return { harvests: data ?? [], isLoading, error };
}
