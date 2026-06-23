import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import type { CreatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/create-planting-spot-input.interface';
import type { UpdatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/update-planting-spot-input.interface';
import type { PaginatedResult } from '@/shared/domain/interfaces/paginated-result.interface';

export interface IPlantingSpotsRepository {
  list(page: number, perPage: number): Promise<PaginatedResult<PlantingSpot>>;
  findById(id: string): Promise<PlantingSpot>;
  create(input: CreatePlantingSpotInput): Promise<PlantingSpot>;
  update(input: UpdatePlantingSpotInput): Promise<PlantingSpot>;
  delete(id: string): Promise<void>;
}
