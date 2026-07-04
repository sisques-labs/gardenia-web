import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export class MarkPlantingSpotActiveUseCase {
  constructor(private readonly repo: IPlantingSpotsRepository) {}

  async execute(id: string): Promise<CreatedEntity> {
    return this.repo.markActive(id);
  }
}
