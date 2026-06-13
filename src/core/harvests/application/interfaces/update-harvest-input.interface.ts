import type { HarvestUnit } from '@/core/harvests/domain/interfaces/harvest.interface';

export interface UpdateHarvestInput {
  id: string;
  cropType?: string;
  quantity?: number;
  unit?: HarvestUnit;
  harvestedAt?: string;
}
