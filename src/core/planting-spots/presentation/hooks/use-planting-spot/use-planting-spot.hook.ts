import { useQuery } from '@tanstack/react-query';
import { GetPlantingSpotUseCase } from '@/core/planting-spots/application/use-cases/get-planting-spot/get-planting-spot.use-case';
import { PlantingSpotsGqlRepository } from '@/core/planting-spots/infrastructure/repositories/graphql/planting-spots.gql.repository';

const getPlantingSpotUseCase = new GetPlantingSpotUseCase(new PlantingSpotsGqlRepository());

export function usePlantingSpot(id: string, resolve = false) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['planting-spot', id, { resolve }],
    queryFn: () => getPlantingSpotUseCase.execute(id, resolve),
    enabled: !!id,
  });

  return { spot: data ?? null, isLoading, error };
}
