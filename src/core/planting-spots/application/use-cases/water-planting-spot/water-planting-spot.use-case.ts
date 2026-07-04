import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { WaterPlantingSpotResult } from '@/core/planting-spots/domain/interfaces/water-planting-spot-result.interface';

export class WaterPlantingSpotUseCase {
  constructor(private readonly repo: IPlantingSpotsRepository) {}

  async execute(id: string, performedAt?: string): Promise<WaterPlantingSpotResult> {
    return this.repo.waterAll(id, performedAt);
  }
}
