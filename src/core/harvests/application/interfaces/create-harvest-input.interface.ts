import type { HarvestUnit } from '@/core/harvests/domain/interfaces/harvest.interface';

export interface CreateHarvestInput {
  cropType: string;
  quantity: number;
  unit: HarvestUnit;
  harvestedAt: string;
}
