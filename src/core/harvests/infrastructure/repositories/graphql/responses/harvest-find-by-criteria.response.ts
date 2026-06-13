import type { Harvest } from '@/core/harvests/domain/types/harvest.interface';

export interface HarvestsFindByCriteriaResponse {
  harvestsFindByCriteria: { items: Harvest[] };
}
