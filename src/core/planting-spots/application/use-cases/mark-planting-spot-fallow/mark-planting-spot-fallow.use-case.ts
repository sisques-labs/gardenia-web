import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

export class MarkPlantingSpotFallowUseCase {
  constructor(private readonly repo: IPlantingSpotsRepository) {}

  async execute(id: string): Promise<PlantingSpot> {
    return this.repo.markFallow(id);
  }
}
