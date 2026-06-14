import type { PlantingSpotType } from '../types/planting-spot-type.type';
export type { PlantingSpotType };

export interface PlantingSpot {
  id: string;
  name: string;
  type: PlantingSpotType;
  description?: string | null;
  userId: string;
  spaceId: string;
  createdAt: string;
  updatedAt: string;
}
