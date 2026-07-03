import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { UpdatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/update-planting-spot-input.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export class UpdatePlantingSpotUseCase {
  constructor(private readonly repo: IPlantingSpotsRepository) {}

  async execute(input: UpdatePlantingSpotInput): Promise<CreatedEntity> {
    return this.repo.update(input);
  }
}
