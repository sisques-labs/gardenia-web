import type { IPlantIdentificationsHttpRepository } from '@/core/plant-identification/application/ports/plant-identifications-http.repository.port';
import type { IdentifyPlantInput } from '@/core/plant-identification/application/interfaces/identify-plant-input.interface';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

export class IdentifyPlantUseCase {
  constructor(private readonly plantIdentificationsRepository: IPlantIdentificationsHttpRepository) {}

  async execute(input: IdentifyPlantInput): Promise<PlantIdentification> {
    return this.plantIdentificationsRepository.identify(input);
  }
}
