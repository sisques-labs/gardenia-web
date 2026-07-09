import type { PlantPhoto } from '@/core/plant-photos/domain/interfaces/plant-photo.interface';

export interface IPlantPhotosRepository {
  listByPlant(plantId: string): Promise<PlantPhoto[]>;
  upload(plantId: string, file: File): Promise<PlantPhoto>;
  delete(id: string): Promise<void>;
}
