import type { PlantingSpotType } from '@/core/planting-spots/domain/types/planting-spot-type.type';

export interface CreatePlantingSpotInput {
  name: string;
  type: PlantingSpotType;
  description?: string | null;
}
