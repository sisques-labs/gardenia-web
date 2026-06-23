import { useQuery } from '@tanstack/react-query';
import { GetPlantingSpotsUseCase } from '@/core/planting-spots/application/use-cases/get-planting-spots/get-planting-spots.use-case';
import { PlantingSpotsGqlRepository } from '@/core/planting-spots/infrastructure/repositories/graphql/planting-spots.gql.repository';

const DEFAULT_PAGE_SIZE = 20;

const getPlantingSpotsUseCase = new GetPlantingSpotsUseCase(new PlantingSpotsGqlRepository());

export function usePlantingSpots(page = 1, perPage = DEFAULT_PAGE_SIZE) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['planting-spots', page, perPage],
    queryFn: () => getPlantingSpotsUseCase.execute(page, perPage),
  });

  return {
    spots: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    currentPage: data?.page ?? page,
    isLoading,
    error,
  };
}
