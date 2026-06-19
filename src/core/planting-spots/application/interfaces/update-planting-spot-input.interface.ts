import type { PlantingSpotType } from '@/core/planting-spots/domain/types/planting-spot-type.type';

export interface UpdatePlantingSpotInput {
  id: string;
  name?: string;
  type?: PlantingSpotType;
  description?: string | null;
  capacity?: number | null;
  row?: number | null;
  column?: number | null;
  dimensions?: string | null;
  soilType?: string | null;
}
