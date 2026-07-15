import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { CreatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/create-planting-spot-input.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export class CreatePlantingSpotUseCase {
  constructor(private readonly repo: IPlantingSpotsRepository) {}

  async execute(input: CreatePlantingSpotInput): Promise<CreatedEntity> {
    return this.repo.create(input);
  }
}
