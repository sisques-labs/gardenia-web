import type { IPlantPhotosRepository } from '@/core/plant-photos/application/ports/plant-photos.repository.port';
import type { PlantPhoto } from '@/core/plant-photos/domain/interfaces/plant-photo.interface';

export class GetPlantPhotosUseCase {
  constructor(private readonly plantPhotosRepository: IPlantPhotosRepository) {}

  async execute(plantId: string): Promise<PlantPhoto[]> {
    return this.plantPhotosRepository.listByPlant(plantId);
  }
}
