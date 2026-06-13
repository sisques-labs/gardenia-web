export const HARVEST_UNITS = ['KG', 'G', 'PIECES', 'LITERS', 'ML', 'BUNCHES'] as const;

export type HarvestUnit = (typeof HARVEST_UNITS)[number];

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
