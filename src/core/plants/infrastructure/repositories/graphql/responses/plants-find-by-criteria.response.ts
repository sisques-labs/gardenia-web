import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

export interface PlantsFindByCriteriaResponse {
  plantsFindByCriteria: { items: Plant[] };
}
