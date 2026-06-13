import type { IHarvestsRepository } from '@/core/harvests/application/ports/harvests.repository.port';

export class DeleteHarvestUseCase {
  constructor(private readonly harvestsRepository: IHarvestsRepository) {}

  async execute(id: string): Promise<void> {
    return this.harvestsRepository.delete(id);
  }
}
