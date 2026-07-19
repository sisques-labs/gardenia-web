import type { IPlantIdentificationsRepository } from '@/core/plant-identification/application/ports/plant-identifications.repository.port';
import type { CreatePlantFromIdentificationInput } from '@/core/plant-identification/application/interfaces/create-plant-from-identification-input.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export class CreatePlantFromIdentificationUseCase {
  constructor(private readonly plantIdentificationsRepository: IPlantIdentificationsRepository) {}

  async execute(input: CreatePlantFromIdentificationInput): Promise<CreatedEntity> {
    return this.plantIdentificationsRepository.createPlantFromIdentification(input);
  }
}
