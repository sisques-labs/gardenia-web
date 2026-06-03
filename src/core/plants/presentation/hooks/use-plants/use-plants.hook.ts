import { useQuery } from '@tanstack/react-query';
import { GetPlantsUseCase } from '@/core/plants/application/use-cases/get-plants/get-plants.use-case';
import { PlantsGqlRepository } from '@/core/plants/infrastructure/repositories/graphql/plants.gql.repository';

const plantsUseCase = new GetPlantsUseCase(new PlantsGqlRepository());

export function usePlants(spaceId: string | null) {
  return useQuery({
    queryKey: ['plants', spaceId],
    queryFn: () => plantsUseCase.execute(),
    enabled: !!spaceId,
  });
}
