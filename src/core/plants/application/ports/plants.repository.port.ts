import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

export interface CreatePlantInput {
  name: string;
  plantSpeciesId?: string;
  imageUrl?: string;
}

export interface IPlantsRepository {
  list(): Promise<Plant[]>;
  getById(id: string): Promise<Plant>;
  create(input: CreatePlantInput): Promise<Plant>;
}
