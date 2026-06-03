import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import type { IPlantsRepository, CreatePlantInput } from '@/core/plants/application/ports/plants.repository.port';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';
import { PLANTS_FIND_BY_CRITERIA } from './queries/plants-find-by-criteria.query';
import { PLANT_FIND_BY_ID } from './queries/plant-find-by-id.query';
import { PLANT_CREATE } from './mutations/plant-create.mutation';

interface PlantsFindByCriteriaData {
  plantsFindByCriteria: { items: Plant[] };
}

interface PlantFindByIdData {
  plantFindById: Plant;
}

interface PlantCreateData {
  plantCreate: { id: string; success: boolean; message: string };
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

  async create(input: CreatePlantInput): Promise<Plant> {
    const res = await apolloClient.mutate<PlantCreateData>({
      mutation: PLANT_CREATE,
      variables: { input },
    });
    if (!res.data?.plantCreate?.success) throw new Error('plantCreate mutation failed');
    return this.getById(res.data.plantCreate.id);
  }
}

export const plantsGqlRepository = new PlantsGqlRepository();
