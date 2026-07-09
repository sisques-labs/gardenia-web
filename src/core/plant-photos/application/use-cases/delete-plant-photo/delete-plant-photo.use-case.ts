import type { IPlantPhotosRepository } from '@/core/plant-photos/application/ports/plant-photos.repository.port';

export class DeletePlantPhotoUseCase {
  constructor(private readonly plantPhotosRepository: IPlantPhotosRepository) {}

  async execute(id: string): Promise<void> {
    return this.plantPhotosRepository.delete(id);
  }
}
