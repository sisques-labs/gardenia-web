import { useQuery } from '@tanstack/react-query';
import { GetPlantUseCase } from '@/core/plants/application/use-cases/get-plant/get-plant.use-case';
import { PlantsGqlRepository } from '@/core/plants/infrastructure/repositories/graphql/plants.gql.repository';

const plantUseCase = new GetPlantUseCase(new PlantsGqlRepository());

export function usePlant(spaceId: string | null, id: string) {
  return useQuery({
    queryKey: ['plant', spaceId, id],
    queryFn: () => plantUseCase.execute(id),
    enabled: !!spaceId && !!id,
  });
}
