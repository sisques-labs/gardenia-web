import { useQuery } from '@tanstack/react-query';
import { GetPlantsUseCase } from '@/core/plants/application/use-cases/get-plants/get-plants.use-case';
import { PlantsGqlRepository } from '@/core/plants/infrastructure/repositories/graphql/plants.gql.repository';
import type { PlantFilter } from '@/core/plants/application/interfaces/plant-filter.interface';

const plantsUseCase = new GetPlantsUseCase(new PlantsGqlRepository());

const DEFAULT_PAGE_SIZE = 20;

export interface UsePaginatedPlantsOptions {
  page?: number;
  perPage?: number;
  filters?: PlantFilter[];
}

/**
 * Server-side paginated + filtered plants, for screens with a filter UI
 * (e.g. the plants list). For a flat, unpaginated list (e.g. a plant picker),
 * use {@link usePlants} instead.
 */
export function usePaginatedPlants(spaceId: string | null, options?: UsePaginatedPlantsOptions) {
  const page = options?.page ?? 1;
  const perPage = options?.perPage ?? DEFAULT_PAGE_SIZE;
  const filters = options?.filters ?? [];

  const query = useQuery({
    queryKey: ['plants', 'paginated', spaceId, page, perPage, filters],
    queryFn: () => plantsUseCase.execute({ filters, pagination: { page, perPage } }),
    enabled: !!spaceId,
  });

  const speciesCount = query.data
    ? query.data.items.reduce((ids, plant) => {
        if (plant.plantSpeciesId) ids.add(plant.plantSpeciesId);
        return ids;
      }, new Set<string>()).size
    : 0;

  return { ...query, speciesCount };
}
