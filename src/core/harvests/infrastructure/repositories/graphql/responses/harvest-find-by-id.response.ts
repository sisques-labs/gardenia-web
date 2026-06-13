import type { Harvest } from '@/core/harvests/domain/interfaces/harvest.interface';

export interface HarvestFindByIdResponse {
  harvestFindById: Harvest | null;
}
