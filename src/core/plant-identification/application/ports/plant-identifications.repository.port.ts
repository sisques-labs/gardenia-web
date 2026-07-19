import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export interface IPlantIdentificationsRepository {
  findByCriteria(
    spaceId: string,
    page: number,
    limit: number,
  ): Promise<{ items: PlantIdentification[]; total: number }>;

  createPlantFromIdentification(input: {
    identificationId: string;
    name: string;
  }): Promise<CreatedEntity>;
}
