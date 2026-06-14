import { useQuery } from '@tanstack/react-query';
import { GetPlantingSpotsUseCase } from '@/core/planting-spots/application/use-cases/get-planting-spots/get-planting-spots.use-case';
import { PlantingSpotsGqlRepository } from '@/core/planting-spots/infrastructure/repositories/graphql/planting-spots.gql.repository';

const getPlantingSpotsUseCase = new GetPlantingSpotsUseCase(new PlantingSpotsGqlRepository());

export function usePlantingSpots() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['planting-spots'],
    queryFn: () => getPlantingSpotsUseCase.execute(),
  });

  return { spots: data ?? [], isLoading, error };
}
