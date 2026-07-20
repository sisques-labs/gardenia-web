import type { IPlantIdentificationsRepository } from '@/core/plant-identification/application/ports/plant-identifications.repository.port';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

export class GetPlantIdentificationsUseCase {
  constructor(private readonly plantIdentificationsRepository: IPlantIdentificationsRepository) {}

  async execute(
    spaceId: string,
    page: number,
    limit: number,
  ): Promise<{ items: PlantIdentification[]; total: number }> {
    return this.plantIdentificationsRepository.findByCriteria(spaceId, page, limit);
  }
}
