import type { Harvest } from '@/core/harvests/domain/interfaces/harvest.interface';

export interface HarvestsFindByCriteriaResponse {
  harvestsFindByCriteria: { items: Harvest[] };
}
