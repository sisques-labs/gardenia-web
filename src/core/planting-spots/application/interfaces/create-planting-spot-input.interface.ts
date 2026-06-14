import type { PlantingSpotType } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

export interface CreatePlantingSpotInput {
  name: string;
  type: PlantingSpotType;
  description?: string | null;
}
