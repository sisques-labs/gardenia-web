import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

export class GetPlantUseCase {
  constructor(private readonly plantsRepository: IPlantsRepository) {}

  async execute(id: string): Promise<Plant> {
    return this.plantsRepository.getById(id);
  }
}
