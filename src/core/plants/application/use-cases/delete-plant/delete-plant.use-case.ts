import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';

export class DeletePlantUseCase {
  constructor(private readonly plantsRepository: IPlantsRepository) {}

  async execute(id: string): Promise<void> {
    return this.plantsRepository.delete(id);
  }
}
