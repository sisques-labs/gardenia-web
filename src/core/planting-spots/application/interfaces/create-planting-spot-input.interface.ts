import type { PlantingSpotType } from '@/core/planting-spots/domain/types/planting-spot-type.type';

export interface CreatePlantingSpotInput {
  name: string;
  type: PlantingSpotType;
  description?: string | null;
  capacity?: number | null;
  row?: number | null;
  column?: number | null;
  dimensionsWidth?: number | null;
  dimensionsHeight?: number | null;
  dimensionsLength?: number | null;
  soilType?: string | null;
}
