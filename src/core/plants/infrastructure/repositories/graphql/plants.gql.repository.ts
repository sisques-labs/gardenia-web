import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';
import type { CreatePlantInput } from '@/core/plants/application/interfaces/create-plant-input.interface';
import type { UpdatePlantInput } from '@/core/plants/application/interfaces/update-plant-input.interface';
import type { PlantListCriteria } from '@/core/plants/application/interfaces/plant-list-criteria.interface';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';
import type { PaginatedResult } from '@/shared/domain/interfaces/paginated-result.interface';
import { PLANTS_FIND_BY_CRITERIA } from './queries/plants-find-by-criteria.query';
import { PLANT_FIND_BY_ID } from './queries/plant-find-by-id.query';
import { PLANT_CREATE } from './mutations/plant-create.mutation';
import { PLANT_UPDATE } from './mutations/plant-update.mutation';
import { PLANT_DELETE } from './mutations/plant-delete.mutation';
import type { PlantsFindByCriteriaResponse } from './responses/plants-find-by-criteria.response';
import type { PlantFindByIdResponse } from './responses/plant-find-by-id.response';
import type { PlantCreateResponse } from './responses/plant-create.response';
import type { PlantUpdateResponse } from './responses/plant-update.response';

export class PlantsGqlRepository implements IPlantsRepository {
  async list(criteria?: PlantListCriteria): Promise<PaginatedResult<Plant>> {
    const res = await apolloClient.query<PlantsFindByCriteriaResponse>({
      query: PLANTS_FIND_BY_CRITERIA,
      variables: { input: criteria },
      fetchPolicy: 'network-only',
    });
    const data = res.data?.plantsFindByCriteria;
    const page = criteria?.pagination?.page ?? 1;
    const perPage = criteria?.pagination?.perPage ?? 10;
    return {
      items: data?.items ?? [],
      total: data?.total ?? 0,
      page: data?.page ?? page,
      perPage: data?.perPage ?? perPage,
      totalPages: data?.totalPages ?? 1,
    };
  }

  async getById(id: string): Promise<Plant> {
    const res = await apolloClient.query<PlantFindByIdResponse>({
      query: PLANT_FIND_BY_ID,
      variables: { input: { id } },
    });
    if (!res.data?.plantFindById) throw new Error(`Plant not found: ${id}`);
    return res.data.plantFindById;
  }

  async create(input: CreatePlantInput): Promise<CreatedEntity> {
    const res = await apolloClient.mutate<PlantCreateResponse>({
      mutation: PLANT_CREATE,
      variables: { input },
    });
    if (!res.data?.plantCreate?.success) throw new Error('plantCreate mutation failed');
    return { id: res.data.plantCreate.id };
  }

  async update(input: UpdatePlantInput): Promise<CreatedEntity> {
    const res = await apolloClient.mutate<PlantUpdateResponse>({
      mutation: PLANT_UPDATE,
      variables: { input },
    });
    if (!res.data?.plantUpdate?.success) throw new Error('plantUpdate mutation failed');
    return { id: res.data.plantUpdate.id };
  }

  async delete(id: string): Promise<void> {
    const res = await apolloClient.mutate<{ plantDelete: { id: string; success: boolean; message: string } }>({
      mutation: PLANT_DELETE,
      variables: { input: { id } },
    });
    if (!res.data?.plantDelete?.success) throw new Error('plantDelete mutation failed');
  }
}

export const plantsGqlRepository = new PlantsGqlRepository();
