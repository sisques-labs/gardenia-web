import type { IHarvestsRepository } from '@/core/harvests/application/ports/harvests.repository.port';
import type { CreateHarvestInput } from '@/core/harvests/application/interfaces/create-harvest-input.interface';
import type { Harvest } from '@/core/harvests/domain/interfaces/harvest.interface';

export class CreateHarvestUseCase {
  constructor(private readonly harvestsRepository: IHarvestsRepository) {}

  async execute(input: CreateHarvestInput): Promise<Harvest> {
    return this.harvestsRepository.create(input);
  }
}
