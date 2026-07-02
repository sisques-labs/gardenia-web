import { useQuery } from '@tanstack/react-query';
import { GetPlantsUseCase } from '@/core/plants/application/use-cases/get-plants/get-plants.use-case';
import { PlantsGqlRepository } from '@/core/plants/infrastructure/repositories/graphql/plants.gql.repository';

const plantsUseCase = new GetPlantsUseCase(new PlantsGqlRepository());

export function usePlants(spaceId: string | null) {
  const query = useQuery({
    queryKey: ['plants', spaceId],
    queryFn: () => plantsUseCase.execute(),
    enabled: !!spaceId,
  });

  const speciesCount = query.data
    ? query.data.reduce((ids, plant) => {
        if (plant.plantSpeciesId) ids.add(plant.plantSpeciesId);
        return ids;
      }, new Set<string>()).size
    : 0;

  return { ...query, speciesCount };
}
