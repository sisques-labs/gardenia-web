import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import type { ICareLogRepository } from '@/core/care-log/application/ports/care-log.repository.port';
import type { CareLogEntry } from '@/core/care-log/domain/interfaces/care-log-entry.interface';
import { CARE_LOG_FIND_BY_PLANT } from './queries/care-log-find-by-plant.query';
import type { CareLogFindByPlantResponse } from './responses/care-log-find-by-plant.response';

export class CareLogGqlRepository implements ICareLogRepository {
  async findByPlantId(plantId: string, limit = 50): Promise<CareLogEntry[]> {
    const res = await apolloClient.query<CareLogFindByPlantResponse>({
      query: CARE_LOG_FIND_BY_PLANT,
      variables: { input: { plantId, page: 1, limit } },
    });
    return res.data?.careLogFindByCriteria?.items ?? [];
  }
}

export const careLogGqlRepository = new CareLogGqlRepository();
