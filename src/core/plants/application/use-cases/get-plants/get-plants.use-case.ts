import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

export class GetPlantsUseCase {
  constructor(private readonly plantsRepository: IPlantsRepository) {}

  async execute(): Promise<Plant[]> {
    return this.plantsRepository.list();
  }
}
