export type HarvestUnit = 'KG' | 'G' | 'PIECES' | 'LITERS' | 'ML' | 'BUNCHES';

export interface Harvest {
  id: string;
  cropType: string;
  quantity: number;
  unit: HarvestUnit;
  harvestedAt: string;
  userId: string;
  spaceId: string;
  createdAt: string;
  updatedAt: string;
}
