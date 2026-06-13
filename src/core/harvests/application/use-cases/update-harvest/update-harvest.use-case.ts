import type { IHarvestsRepository } from '@/core/harvests/application/ports/harvests.repository.port';
import type { UpdateHarvestInput } from '@/core/harvests/application/interfaces/update-harvest-input.interface';
import type { Harvest } from '@/core/harvests/domain/interfaces/harvest.interface';

export class UpdateHarvestUseCase {
  constructor(private readonly harvestsRepository: IHarvestsRepository) {}

  async execute(input: UpdateHarvestInput): Promise<Harvest> {
    return this.harvestsRepository.update(input);
  }
}
