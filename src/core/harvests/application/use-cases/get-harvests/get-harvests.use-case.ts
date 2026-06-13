import type { IHarvestsRepository } from '@/core/harvests/application/ports/harvests.repository.port';
import type { Harvest } from '@/core/harvests/domain/types/harvest.interface';

export class GetHarvestsUseCase {
  constructor(private readonly harvestsRepository: IHarvestsRepository) {}

  async execute(): Promise<Harvest[]> {
    return this.harvestsRepository.findByCriteria();
  }
}
