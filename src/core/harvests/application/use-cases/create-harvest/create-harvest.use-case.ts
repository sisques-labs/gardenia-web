import type { IHarvestsRepository } from '@/core/harvests/application/ports/harvests.repository.port';
import type { CreateHarvestInput } from '@/core/harvests/application/interfaces/create-harvest-input.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export class CreateHarvestUseCase {
  constructor(private readonly harvestsRepository: IHarvestsRepository) {}

  async execute(input: CreateHarvestInput): Promise<CreatedEntity> {
    return this.harvestsRepository.create(input);
  }
}
