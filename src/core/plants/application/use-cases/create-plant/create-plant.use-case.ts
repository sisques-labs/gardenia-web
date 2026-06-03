import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';
import type { CreatePlantInput } from '@/core/plants/application/interfaces/create-plant-input.interface';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

export class CreatePlantUseCase {
  constructor(private readonly plantsRepository: IPlantsRepository) {}

  async execute(input: CreatePlantInput): Promise<Plant> {
    return this.plantsRepository.create(input);
  }
}
