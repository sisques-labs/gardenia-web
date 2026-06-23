import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import type { PaginatedResult } from '@/shared/domain/interfaces/paginated-result.interface';

export interface PlantingSpotsFindByCriteriaResponse {
  plantingSpotsFindByCriteria: PaginatedResult<PlantingSpot>;
}
