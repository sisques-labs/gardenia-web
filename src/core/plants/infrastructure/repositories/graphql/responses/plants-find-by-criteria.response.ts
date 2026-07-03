import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';
import type { PaginatedResult } from '@/shared/domain/interfaces/paginated-result.interface';

export interface PlantsFindByCriteriaResponse {
  plantsFindByCriteria: PaginatedResult<Plant>;
}
