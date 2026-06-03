import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';
import type { CreatePlantInput } from '@/core/plants/application/interfaces/create-plant-input.interface';

export type { CreatePlantInput };

export interface IPlantsRepository {
  list(): Promise<Plant[]>;
  getById(id: string): Promise<Plant>;
  create(input: CreatePlantInput): Promise<Plant>;
}
