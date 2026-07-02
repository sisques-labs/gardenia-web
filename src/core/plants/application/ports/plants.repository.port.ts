import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';
import type { CreatePlantInput } from '@/core/plants/application/interfaces/create-plant-input.interface';
import type { PlantListCriteria } from '@/core/plants/application/interfaces/plant-list-criteria.interface';
import type { PaginatedResult } from '@/shared/domain/interfaces/paginated-result.interface';

export type { CreatePlantInput };

export interface IPlantsRepository {
  list(criteria?: PlantListCriteria): Promise<PaginatedResult<Plant>>;
  getById(id: string): Promise<Plant>;
  create(input: CreatePlantInput): Promise<Plant>;
  delete(id: string): Promise<void>;
}
