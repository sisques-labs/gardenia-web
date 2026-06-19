import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import type { CreatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/create-planting-spot-input.interface';
import type { UpdatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/update-planting-spot-input.interface';

export interface IPlantingSpotsRepository {
  list(resolve?: boolean): Promise<PlantingSpot[]>;
  findById(id: string, resolve?: boolean): Promise<PlantingSpot>;
  create(input: CreatePlantingSpotInput): Promise<PlantingSpot>;
  update(input: UpdatePlantingSpotInput): Promise<PlantingSpot>;
  delete(id: string): Promise<void>;
}
