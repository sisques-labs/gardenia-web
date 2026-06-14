import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

export interface PlantingSpotsFindByCriteriaResponse {
  plantingSpotsFindByCriteria: { items: PlantingSpot[] };
}
