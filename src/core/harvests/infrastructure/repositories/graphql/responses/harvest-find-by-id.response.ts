import type { Harvest } from '@/core/harvests/domain/types/harvest.interface';

export interface HarvestFindByIdResponse {
  harvestFindById: Harvest | null;
}
