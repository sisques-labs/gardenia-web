import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import type { ICareLogRepository } from '@/core/care-log/application/ports/care-log.repository.port';
import type { CareLogEntry } from '@/core/care-log/domain/interfaces/care-log-entry.interface';
import { CareLogQueryableField } from '@/core/care-log/domain/enums/care-log-queryable-field.enum';
import type { CreateCareLogInput } from '@/core/care-log/application/interfaces/create-care-log-input.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';
import { CARE_LOG_FIND_BY_PLANT } from './queries/care-log-find-by-plant.query';
import { CARE_LOG_ENTRY_CREATE } from './mutations/care-log-entry-create.mutation';
import type { CareLogFindByPlantResponse } from './responses/care-log-find-by-plant.response';
import type { CareLogEntryCreateResponse } from './responses/care-log-entry-create.response';

export class CareLogGqlRepository implements ICareLogRepository {
  async findByPlantId(plantId: string, limit = 50): Promise<CareLogEntry[]> {
    const res = await apolloClient.query<CareLogFindByPlantResponse>({
      query: CARE_LOG_FIND_BY_PLANT,
      variables: {
        input: {
          filters: [{ field: CareLogQueryableField.PLANT_ID, operator: 'EQUALS', value: plantId }],
          pagination: { page: 1, perPage: limit },
        },
      },
      fetchPolicy: 'network-only',
    });
    return res.data?.careLogFindByCriteria?.items ?? [];
  }

  async create(input: CreateCareLogInput): Promise<CreatedEntity> {
    const res = await apolloClient.mutate<CareLogEntryCreateResponse>({
      mutation: CARE_LOG_ENTRY_CREATE,
      variables: { input },
    });
    if (!res.data?.careLogEntryCreate?.success) throw new Error('careLogEntryCreate mutation failed');
    return { id: res.data.careLogEntryCreate.id };
  }
}

export const careLogGqlRepository = new CareLogGqlRepository();
