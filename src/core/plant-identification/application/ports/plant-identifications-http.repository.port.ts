import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';
import type { PlantIdentificationOrgan } from '@/core/plant-identification/domain/interfaces/plant-identification-organ.type';

export interface IPlantIdentificationsHttpRepository {
  identify(input: {
    photos: { file: File; organ: PlantIdentificationOrgan }[];
  }): Promise<PlantIdentification>;
}
