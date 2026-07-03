import type { IHarvestsRepository } from '@/core/harvests/application/ports/harvests.repository.port';
import type { UpdateHarvestInput } from '@/core/harvests/application/interfaces/update-harvest-input.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export class UpdateHarvestUseCase {
  constructor(private readonly harvestsRepository: IHarvestsRepository) {}

  async execute(input: UpdateHarvestInput): Promise<CreatedEntity> {
    return this.harvestsRepository.update(input);
  }
}
