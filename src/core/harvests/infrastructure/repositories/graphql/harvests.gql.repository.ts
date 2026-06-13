import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import type { IHarvestsRepository } from '@/core/harvests/application/ports/harvests.repository.port';
import type { CreateHarvestInput } from '@/core/harvests/application/interfaces/create-harvest-input.interface';
import type { UpdateHarvestInput } from '@/core/harvests/application/interfaces/update-harvest-input.interface';
import type { Harvest } from '@/core/harvests/domain/types/harvest.interface';
import { HARVESTS_FIND_BY_CRITERIA } from './queries/harvest-find-by-criteria.query';
import { HARVEST_FIND_BY_ID } from './queries/harvest-find-by-id.query';
import { HARVEST_CREATE } from './mutations/harvest-create.mutation';
import { HARVEST_UPDATE } from './mutations/harvest-update.mutation';
import { HARVEST_DELETE } from './mutations/harvest-delete.mutation';
import type { HarvestsFindByCriteriaResponse } from './responses/harvest-find-by-criteria.response';
import type { HarvestFindByIdResponse } from './responses/harvest-find-by-id.response';
import type { HarvestCreateResponse } from './responses/harvest-create.response';
import type { HarvestUpdateResponse } from './responses/harvest-update.response';
import type { HarvestDeleteResponse } from './responses/harvest-delete.response';

export class HarvestsGqlRepository implements IHarvestsRepository {
  async findByCriteria(): Promise<Harvest[]> {
    const res = await apolloClient.query<HarvestsFindByCriteriaResponse>({ query: HARVESTS_FIND_BY_CRITERIA, fetchPolicy: 'network-only' });
    return res.data?.harvestsFindByCriteria?.items ?? [];
  }

  async findById(id: string): Promise<Harvest> {
    const res = await apolloClient.query<HarvestFindByIdResponse>({
      query: HARVEST_FIND_BY_ID,
      variables: { input: { id } },
      fetchPolicy: 'network-only',
    });
    if (!res.data?.harvestFindById) throw new Error(`Harvest not found: ${id}`);
    return res.data.harvestFindById;
  }

  async create(input: CreateHarvestInput): Promise<Harvest> {
    const res = await apolloClient.mutate<HarvestCreateResponse>({
      mutation: HARVEST_CREATE,
      variables: { input },
    });
    if (!res.data?.harvestCreate?.success) throw new Error('harvestCreate mutation failed');
    return this.findById(res.data.harvestCreate.id);
  }

  async update(input: UpdateHarvestInput): Promise<Harvest> {
    const res = await apolloClient.mutate<HarvestUpdateResponse>({
      mutation: HARVEST_UPDATE,
      variables: { input },
    });
    if (!res.data?.harvestUpdate?.success) throw new Error('harvestUpdate mutation failed');
    return this.findById(res.data.harvestUpdate.id);
  }

  async delete(id: string): Promise<void> {
    await apolloClient.mutate<HarvestDeleteResponse>({
      mutation: HARVEST_DELETE,
      variables: { input: { id } },
    });
  }
}

export const harvestsGqlRepository = new HarvestsGqlRepository();
