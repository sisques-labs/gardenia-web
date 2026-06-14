import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { CreatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/create-planting-spot-input.interface';
import type { UpdatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/update-planting-spot-input.interface';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import { PLANTING_SPOTS_FIND_BY_CRITERIA } from './queries/planting-spots-find-by-criteria.query';
import { PLANTING_SPOT_FIND_BY_ID } from './queries/planting-spot-find-by-id.query';
import { PLANTING_SPOT_CREATE } from './mutations/planting-spot-create.mutation';
import { PLANTING_SPOT_UPDATE } from './mutations/planting-spot-update.mutation';
import { PLANTING_SPOT_DELETE } from './mutations/planting-spot-delete.mutation';
import type { PlantingSpotsFindByCriteriaResponse } from './responses/planting-spots-find-by-criteria.response';
import type { PlantingSpotFindByIdResponse } from './responses/planting-spot-find-by-id.response';
import type { PlantingSpotCreateResponse } from './responses/planting-spot-create.response';
import type { PlantingSpotUpdateResponse } from './responses/planting-spot-update.response';
import type { PlantingSpotDeleteResponse } from './responses/planting-spot-delete.response';

export class PlantingSpotsGqlRepository implements IPlantingSpotsRepository {
  async list(): Promise<PlantingSpot[]> {
    const res = await apolloClient.query<PlantingSpotsFindByCriteriaResponse>({
      query: PLANTING_SPOTS_FIND_BY_CRITERIA,
      fetchPolicy: 'network-only',
    });
    return res.data?.plantingSpotsFindByCriteria?.items ?? [];
  }

  async findById(id: string): Promise<PlantingSpot> {
    const res = await apolloClient.query<PlantingSpotFindByIdResponse>({
      query: PLANTING_SPOT_FIND_BY_ID,
      variables: { input: { id } },
      fetchPolicy: 'network-only',
    });
    if (!res.data?.plantingSpotFindById) throw new Error(`PlantingSpot not found: ${id}`);
    return res.data.plantingSpotFindById;
  }

  async create(input: CreatePlantingSpotInput): Promise<PlantingSpot> {
    const res = await apolloClient.mutate<PlantingSpotCreateResponse>({
      mutation: PLANTING_SPOT_CREATE,
      variables: { input },
    });
    if (!res.data?.plantingSpotCreate?.success) throw new Error('plantingSpotCreate mutation failed');
    return this.findById(res.data.plantingSpotCreate.id);
  }

  async update(input: UpdatePlantingSpotInput): Promise<PlantingSpot> {
    const res = await apolloClient.mutate<PlantingSpotUpdateResponse>({
      mutation: PLANTING_SPOT_UPDATE,
      variables: { input },
    });
    if (!res.data?.plantingSpotUpdate?.success) throw new Error('plantingSpotUpdate mutation failed');
    return this.findById(res.data.plantingSpotUpdate.id);
  }

  async delete(id: string): Promise<void> {
    await apolloClient.mutate<PlantingSpotDeleteResponse>({
      mutation: PLANTING_SPOT_DELETE,
      variables: { input: { id } },
    });
  }
}

export const plantingSpotsGqlRepository = new PlantingSpotsGqlRepository();
