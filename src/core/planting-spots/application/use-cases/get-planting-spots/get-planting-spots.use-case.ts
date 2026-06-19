import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

export class GetPlantingSpotsUseCase {
  constructor(private readonly repo: IPlantingSpotsRepository) {}

  async execute(resolve = false): Promise<PlantingSpot[]> {
    return this.repo.list(resolve);
  }
}
