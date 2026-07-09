import type { IPlantPhotosRepository } from '@/core/plant-photos/application/ports/plant-photos.repository.port';
import type { PlantPhoto } from '@/core/plant-photos/domain/interfaces/plant-photo.interface';

export class UploadPlantPhotoUseCase {
  constructor(private readonly plantPhotosRepository: IPlantPhotosRepository) {}

  async execute(plantId: string, file: File): Promise<PlantPhoto> {
    return this.plantPhotosRepository.upload(plantId, file);
  }
}
