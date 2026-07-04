import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';
import type { UpdatePlantInput } from '@/core/plants/application/interfaces/update-plant-input.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export class UpdatePlantUseCase {
  constructor(private readonly plantsRepository: IPlantsRepository) {}

  async execute(input: UpdatePlantInput): Promise<CreatedEntity> {
    return this.plantsRepository.update(input);
  }
}
