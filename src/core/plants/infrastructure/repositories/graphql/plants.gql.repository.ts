import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';
import { PLANTS_FIND_BY_CRITERIA } from './queries/plants-find-by-criteria.query';
import { PLANT_FIND_BY_ID } from './queries/plant-find-by-id.query';

interface PlantsFindByCriteriaData {
  plantsFindByCriteria: { items: Plant[] };
}

interface PlantFindByIdData {
  plantFindById: Plant;
}

export class PlantsGqlRepository implements IPlantsRepository {
  async list(): Promise<Plant[]> {
    const res = await apolloClient.query<PlantsFindByCriteriaData>({ query: PLANTS_FIND_BY_CRITERIA });
    return res.data?.plantsFindByCriteria?.items ?? [];
  }

  async getById(id: string): Promise<Plant> {
    const res = await apolloClient.query<PlantFindByIdData>({
      query: PLANT_FIND_BY_ID,
      variables: { input: { id } },
    });
    if (!res.data?.plantFindById) throw new Error(`Plant not found: ${id}`);
    return res.data.plantFindById;
  }
}

export const plantsGqlRepository = new PlantsGqlRepository();
