import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';
import type { CreatePlantInput } from '@/core/plants/application/interfaces/create-plant-input.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export class CreatePlantUseCase {
  constructor(private readonly plantsRepository: IPlantsRepository) {}

  async execute(input: CreatePlantInput): Promise<CreatedEntity> {
    return this.plantsRepository.create(input);
  }
}
