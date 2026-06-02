import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

export interface IPlantsRepository {
  list(): Promise<Plant[]>;
  getById(id: string): Promise<Plant>;
}
