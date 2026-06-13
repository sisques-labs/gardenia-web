import type { IHarvestsRepository } from '@/core/harvests/application/ports/harvests.repository.port';
import type { Harvest } from '@/core/harvests/domain/interfaces/harvest.interface';

export class GetHarvestUseCase {
  constructor(private readonly harvestsRepository: IHarvestsRepository) {}

  async execute(id: string): Promise<Harvest> {
    return this.harvestsRepository.findById(id);
  }
}
